import type { AttachmentType } from '@/types/template';

export const AUDIO_EXTENSIONS = new Set([
  'mp3', 'ogg', 'oga', 'opus', 'm4a', 'aac', 'flac', 'wav', 'wma',
]);

export function fileExt(name: string): string {
  return name.split('.').pop()?.toLowerCase() ?? '';
}

export function getCompatibleTypes(file: File): AttachmentType[] {
  const mime = file.type;
  if (mime.startsWith('image/')) return ['photo', 'document'];
  if (mime.startsWith('video/')) return ['video', 'document'];
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(fileExt(file.name))) return ['audio', 'voice', 'document'];
  return ['document'];
}

export function detectType(file: File): AttachmentType {
  const mime = file.type;
  if (mime.startsWith('image/')) return 'photo';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/') || AUDIO_EXTENSIONS.has(fileExt(file.name))) return 'audio';
  return 'document';
}
