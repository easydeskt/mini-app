export function getImageDimensions(url: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = reject;
    img.src = url;
  });
}

export function getVideoMetadata(url: string): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () =>
      resolve({ duration: Math.round(video.duration), width: video.videoWidth, height: video.videoHeight });
    video.onerror = reject;
    video.src = url;
  });
}

export function getAudioDuration(url: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = document.createElement('audio');
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => resolve(Math.round(audio.duration));
    audio.onerror = () => {
      // Fallback for containers like video/ogg where the audio element refuses to load
      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => resolve(Math.round(video.duration));
      video.onerror = reject;
      video.src = url;
    };
    audio.src = url;
  });
}

export async function getAudioTags(file: File): Promise<{ title?: string; performer?: string }> {
  try {
    const mime = file.type.toLowerCase();
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (mime === 'audio/mpeg' || mime === 'audio/mp3' || ext === 'mp3') {
      return await parseId3v2Tags(file);
    }
    if (['audio/mp4', 'audio/m4a', 'audio/x-m4a', 'audio/aac'].includes(mime) ||
        ['m4a', 'mp4', 'aac'].includes(ext)) {
      return await parseItunesTags(file);
    }
    if (['audio/ogg', 'audio/opus', 'audio/vorbis', 'video/ogg'].includes(mime) ||
        ['ogg', 'oga', 'opus'].includes(ext)) {
      return await parseOggComments(file);
    }
    if (mime === 'audio/flac' || mime === 'audio/x-flac' || ext === 'flac') {
      return await parseFlacComments(file);
    }
    return {};
  } catch {
    return {};
  }
}

// ─── ID3v2 (MP3) ────────────────────────────────────────────────────────────

async function parseId3v2Tags(file: File): Promise<{ title?: string; performer?: string }> {
  const buf = await file.slice(0, Math.min(file.size, 512 * 1024)).arrayBuffer();
  const u8 = new Uint8Array(buf);
  const view = new DataView(buf);

  if (u8[0] !== 0x49 || u8[1] !== 0x44 || u8[2] !== 0x33) return {};

  const majorVer = u8[3];
  const flags = u8[5];
  const tagSize = synchsafe4(u8, 6);

  let offset = 10;

  // Skip extended header if present
  if (flags & 0x40) {
    if (majorVer === 4) {
      offset += synchsafe4(u8, 10);
    } else {
      offset += 4 + view.getUint32(10);
    }
  }

  const tagEnd = Math.min(10 + tagSize, buf.byteLength);
  const result: { title?: string; performer?: string } = {};

  if (majorVer === 2) {
    // ID3v2.2: 3-byte IDs, 3-byte big-endian sizes
    while (offset + 6 <= tagEnd) {
      const id = chars(u8, offset, 3);
      if (id[0] === '\0') break;
      const size = (u8[offset + 3] << 16) | (u8[offset + 4] << 8) | u8[offset + 5];
      offset += 6;
      if ((id === 'TT2' || id === 'TP1') && size > 0 && offset + size <= tagEnd) {
        const text = decodeId3Text(u8, view, offset, size);
        if (id === 'TT2') result.title = text || undefined;
        else result.performer = text || undefined;
      }
      offset += size;
    }
  } else {
    // ID3v2.3 / v2.4: 4-byte IDs, 4-byte sizes
    while (offset + 10 <= tagEnd) {
      const id = chars(u8, offset, 4);
      if (id[0] === '\0') break;
      const size = majorVer === 4 ? synchsafe4(u8, offset + 4) : view.getUint32(offset + 4);
      offset += 10;
      if ((id === 'TIT2' || id === 'TPE1') && size > 0 && offset + size <= tagEnd) {
        const text = decodeId3Text(u8, view, offset, size);
        if (id === 'TIT2') result.title = text || undefined;
        else result.performer = text || undefined;
      }
      offset += size;
    }
  }

  return result;
}

function synchsafe4(u8: Uint8Array, offset: number): number {
  return ((u8[offset] & 0x7f) << 21) | ((u8[offset + 1] & 0x7f) << 14) |
         ((u8[offset + 2] & 0x7f) << 7) | (u8[offset + 3] & 0x7f);
}

function chars(u8: Uint8Array, offset: number, len: number): string {
  return String.fromCharCode(...u8.subarray(offset, offset + len));
}

function decodeId3Text(u8: Uint8Array, _view: DataView, offset: number, size: number): string {
  const enc = u8[offset];
  const slice = u8.subarray(offset + 1, offset + size);
  let text: string;
  if (enc === 0) text = new TextDecoder('latin1').decode(slice);
  else if (enc === 1 || enc === 2) text = new TextDecoder('utf-16').decode(slice);
  else text = new TextDecoder('utf-8').decode(slice);
  return text.replace(/\0/g, '').trim();
}

// ─── iTunes atoms (M4A / AAC) ────────────────────────────────────────────────

async function parseItunesTags(file: File): Promise<{ title?: string; performer?: string }> {
  const buf = await file.slice(0, Math.min(file.size, 4 * 1024 * 1024)).arrayBuffer();
  const view = new DataView(buf);

  function atomSize(offset: number) { return view.getUint32(offset); }
  function atomType(offset: number) { return chars(new Uint8Array(buf), offset + 4, 4); }

  function findAtom(start: number, end: number, type: string): number {
    let p = start;
    while (p + 8 <= end) {
      const sz = atomSize(p);
      if (sz < 8) break;
      if (atomType(p) === type) return p;
      p += sz;
    }
    return -1;
  }

  const moov = findAtom(0, buf.byteLength, 'moov');
  if (moov === -1) return {};
  const moovEnd = moov + atomSize(moov);

  const udta = findAtom(moov + 8, moovEnd, 'udta');
  if (udta === -1) return {};

  const meta = findAtom(udta + 8, udta + atomSize(udta), 'meta');
  if (meta === -1) return {};

  // meta has a 4-byte version/flags field after its 8-byte box header
  const ilst = findAtom(meta + 12, meta + atomSize(meta), 'ilst');
  if (ilst === -1) return {};

  const result: { title?: string; performer?: string } = {};
  const decoder = new TextDecoder('utf-8');
  const u8 = new Uint8Array(buf);
  let p = ilst + 8;
  const ilstEnd = ilst + atomSize(ilst);

  while (p + 8 <= ilstEnd) {
    const sz = atomSize(p);
    if (sz < 8) break;
    const type = atomType(p);

    if (type === '©nam' || type === '©ART') {
      const data = findAtom(p + 8, p + sz, 'data');
      if (data !== -1) {
        const dataEnd = data + atomSize(data);
        const textStart = data + 16; // 8 box header + 4 type-indicator + 4 locale
        if (textStart < dataEnd && dataEnd <= buf.byteLength) {
          const text = decoder.decode(u8.subarray(textStart, dataEnd)).trim();
          if (type === '©nam') result.title = text || undefined;
          else result.performer = text || undefined;
        }
      }
    }

    p += sz;
  }

  return result;
}

// ─── OGG Vorbis / Opus ───────────────────────────────────────────────────────

async function parseOggComments(file: File): Promise<{ title?: string; performer?: string }> {
  const buf = await file.slice(0, Math.min(file.size, 128 * 1024)).arrayBuffer();
  const u8 = new Uint8Array(buf);

  const vorbisMarker = [0x03, 0x76, 0x6f, 0x72, 0x62, 0x69, 0x73]; // \x03vorbis
  const opusMarker   = [0x4f, 0x70, 0x75, 0x73, 0x54, 0x61, 0x67, 0x73]; // OpusTags

  let dataOffset = -1;
  outer: for (let i = 0; i < u8.length - 8; i++) {
    for (const marker of [vorbisMarker, opusMarker]) {
      if (marker.every((b, j) => u8[i + j] === b)) {
        dataOffset = i + marker.length;
        break outer;
      }
    }
  }

  if (dataOffset === -1) return {};
  return parseVorbisCommentBlock(u8, dataOffset);
}

// ─── FLAC ────────────────────────────────────────────────────────────────────

async function parseFlacComments(file: File): Promise<{ title?: string; performer?: string }> {
  const buf = await file.slice(0, Math.min(file.size, 1024 * 1024)).arrayBuffer();
  const u8 = new Uint8Array(buf);
  const view = new DataView(buf);

  if (u8[0] !== 0x66 || u8[1] !== 0x4c || u8[2] !== 0x61 || u8[3] !== 0x43) return {};

  let offset = 4;
  while (offset + 4 <= u8.length) {
    const blockHeader = u8[offset];
    const isLast = (blockHeader & 0x80) !== 0;
    const blockType = blockHeader & 0x7f;
    const blockLength = (view.getUint8(offset + 1) << 16) | view.getUint16(offset + 2);
    offset += 4;

    if (blockType === 4) return parseVorbisCommentBlock(u8, offset);

    offset += blockLength;
    if (isLast) break;
  }

  return {};
}

// ─── Shared Vorbis comment reader ────────────────────────────────────────────

function parseVorbisCommentBlock(u8: Uint8Array, offset: number): { title?: string; performer?: string } {
  const view = new DataView(u8.buffer, u8.byteOffset, u8.byteLength);
  const decoder = new TextDecoder('utf-8');

  if (offset + 4 > u8.length) return {};
  const vendorLen = view.getUint32(offset, true);
  offset += 4 + vendorLen;

  if (offset + 4 > u8.length) return {};
  const commentCount = view.getUint32(offset, true);
  offset += 4;

  const result: { title?: string; performer?: string } = {};

  for (let i = 0; i < commentCount; i++) {
    if (offset + 4 > u8.length) break;
    const len = view.getUint32(offset, true);
    offset += 4;
    if (offset + len > u8.length) break;
    const comment = decoder.decode(u8.subarray(offset, offset + len));
    offset += len;

    const eq = comment.indexOf('=');
    if (eq === -1) continue;
    const key = comment.slice(0, eq).toUpperCase();
    const val = comment.slice(eq + 1).trim();
    if (!val) continue;

    if (key === 'TITLE') result.title = val;
    else if (key === 'ARTIST') result.performer = val;
  }

  return result;
}
