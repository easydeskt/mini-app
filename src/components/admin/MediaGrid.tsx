import { useEffect, useMemo, useRef, useState } from 'react';

import { FileIcon, ImageOff, Mic, Music, Pause, Play } from 'lucide-react';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useT } from '@/hooks/useT';
import { formatDuration, formatSize } from '@/utils/formatters';
import { Layouter } from '@/utils/groupedLayout';
import type {
  AudioAttachment,
  DocumentAttachment,
  PhotoAttachment,
  VideoAttachment,
  VoiceAttachment,
} from '@/types/template';
import type { Attachment } from '@/types/template';

type OnPreviewFn = (attachment: PhotoAttachment | VideoAttachment | DocumentAttachment) => void;

type MediaGridProps = {
  attachments: Attachment[];
  onPreview?: OnPreviewFn;
};

function MediaTile({
  attachment,
  onPreview,
}: {
  attachment: PhotoAttachment | VideoAttachment;
  onPreview?: OnPreviewFn;
}) {
  const [mediaError, setMediaError] = useState(false);

  if (attachment.type === 'video') {
    return (
      <div
        className="h-full w-full cursor-pointer"
        onClick={e => { e.stopPropagation(); if (!mediaError) onPreview?.(attachment); }}
      >
        {mediaError ? (
          <div className="flex h-full w-full items-center justify-center bg-muted">
            <ImageOff className="h-6 w-6 text-muted-foreground" />
          </div>
        ) : (
          <div className="relative h-full w-full">
            {attachment.thumbnail ? (
              <img src={attachment.thumbnail} alt={attachment.name} className="h-full w-full object-cover" onError={() => setMediaError(true)} />
            ) : (
              <video className="h-full w-full object-cover" muted preload="metadata" src={attachment.url} onError={() => setMediaError(true)} />
            )}
            <div className="absolute inset-0 flex items-center justify-center bg-black/25">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black/40">
                <Play className="ml-0.5 h-5 w-5 fill-white text-white" />
              </div>
            </div>
            <span className="absolute bottom-2 right-2 rounded-md bg-black/50 px-1.5 py-0.5 text-xs font-medium text-white backdrop-blur-md">
              {formatDuration(attachment.duration)}
            </span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div
      className="h-full w-full cursor-pointer"
      onClick={e => { e.stopPropagation(); if (!mediaError) onPreview?.(attachment); }}
    >
      {mediaError ? (
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <ImageOff className="h-6 w-6 text-muted-foreground" />
        </div>
      ) : (
        <img alt={attachment.name} className="h-full w-full object-cover" loading="lazy" src={attachment.url} onError={() => setMediaError(true)} />
      )}
    </div>
  );
}

function MediaMosaic({
  media,
  onPreview,
}: {
  media: (PhotoAttachment | VideoAttachment)[];
  onPreview?: OnPreviewFn;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (el && el.offsetWidth > 0) setContainerWidth(el.offsetWidth);
  }, []);

  const layouts = useMemo(() => {
    if (!containerWidth || !media.length) return [];
    const sizes = media.map(m => ({ w: m.width, h: m.height }));
    return new Layouter(sizes, containerWidth, 80, 2, Math.round(containerWidth * 1.5)).layout();
  }, [media, containerWidth]);

  const totalHeight = layouts.reduce((max, l) => Math.max(max, l.geometry.y + l.geometry.height), 0);

  return (
    <div ref={containerRef} style={{ position: 'relative', height: totalHeight || undefined }}>
      {layouts.map((layout, i) => {
        const m = media[i];
        const { x, y, width, height } = layout.geometry;
        return (
          <div key={m.id} style={{ position: 'absolute', left: x, top: y, width, height }}>
            <MediaTile attachment={m} onPreview={onPreview} />
          </div>
        );
      })}
    </div>
  );
}

function AudioRow({ attachment }: { attachment: AudioAttachment }) {
  const { playing, audioRef, toggle, onEnded } = useAudioPlayer();

  return (
    <div className="flex cursor-pointer items-center gap-2" onClick={toggle}>
      <audio ref={audioRef} src={attachment.url} onEnded={onEnded} />
      <button
        type="button"
        onClick={e => { e.stopPropagation(); toggle(); }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-current/15"
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Music className="h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">{attachment.title ?? attachment.name}</p>
        <p className="truncate text-xs leading-tight opacity-60">
          {[attachment.performer, formatDuration(attachment.duration)].filter(Boolean).join(' • ')}
        </p>
      </div>
    </div>
  );
}

function VoiceRow({ attachment }: { attachment: VoiceAttachment }) {
  const { playing, audioRef, toggle, onEnded } = useAudioPlayer();
  const t = useT();
  const subtitle = [attachment.sender, formatDuration(attachment.duration)].filter(Boolean).join(' • ');

  return (
    <div className="flex cursor-pointer items-center gap-2" onClick={toggle}>
      <audio ref={audioRef} src={attachment.url} onEnded={onEnded} />
      <button
        type="button"
        onClick={e => { e.stopPropagation(); toggle(); }}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-current/15"
      >
        {playing ? <Pause className="h-4 w-4 fill-current" /> : <Mic className="h-4 w-4" />}
      </button>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{t('attachments.voice_label_short') ?? 'Voice message'}</p>
        <p className="truncate text-xs leading-tight opacity-60">{subtitle}</p>
      </div>
    </div>
  );
}

function DocumentItem({
  doc,
  onPreview,
}: {
  doc: DocumentAttachment;
  onPreview?: OnPreviewFn;
}) {
  const [mediaError, setMediaError] = useState(false);
  const mime = doc.mimeType ?? '';
  const isImageDoc = mime.startsWith('image/');
  const isVideoDoc = mime.startsWith('video/');

  return (
    <div
      className="flex cursor-pointer items-center gap-2"
      onClick={e => { e.stopPropagation(); if (!mediaError) onPreview?.(doc); }}
    >
      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-current/15">
        {mediaError ? (
          <ImageOff className="h-4 w-4" />
        ) : isImageDoc ? (
          <img src={doc.url} alt="" className="h-full w-full object-cover" onError={() => setMediaError(true)} />
        ) : isVideoDoc ? (
          <video src={doc.url} className="h-full w-full object-cover" muted preload="metadata" onError={() => setMediaError(true)} />
        ) : (
          <FileIcon className="h-4 w-4" />
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm">{doc.name}</p>
        {doc.size !== undefined && <p className="text-xs opacity-60">{formatSize(doc.size)}</p>}
      </div>
    </div>
  );
}

function NonMediaList({
  items,
  onPreview,
}: {
  items: (AudioAttachment | VoiceAttachment | DocumentAttachment)[];
  onPreview?: OnPreviewFn;
}) {
  return (
    <div className="flex flex-col gap-2 px-3 py-2">
      {items.map(item => {
        if (item.type === 'audio') return <AudioRow key={item.id} attachment={item} />;
        if (item.type === 'voice') return <VoiceRow key={item.id} attachment={item} />;
        return <DocumentItem key={item.id} doc={item} onPreview={onPreview} />;
      })}
    </div>
  );
}

export function MediaGrid({ attachments, onPreview }: MediaGridProps) {
  const visualMedia = attachments.filter((a): a is PhotoAttachment | VideoAttachment =>
    a.type === 'photo' || a.type === 'video',
  );
  const nonMedia = attachments.filter((a): a is AudioAttachment | VoiceAttachment | DocumentAttachment =>
    a.type === 'audio' || a.type === 'voice' || a.type === 'document',
  );

  return (
    <>
      {visualMedia.length > 0 && <MediaMosaic media={visualMedia} onPreview={onPreview} />}
      {nonMedia.length > 0 && <NonMediaList items={nonMedia} onPreview={onPreview} />}
    </>
  );
}
