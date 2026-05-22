import { useState } from 'react';

import { File as FileIcon, Film, Image as ImageIcon, ImageOff, Mic, Music, Pause } from 'lucide-react';

import { useT } from '@/hooks/useT';
import { formatDuration, formatSize } from '@/utils/formatters';
import type { Attachment } from '@/types/template';

export { formatDuration, formatSize };

export function getAttachmentIcon(a: Attachment) {
  switch (a.type) {
    case 'photo': return ImageIcon;
    case 'video': return Film;
    case 'audio': return Music;
    case 'voice': return Mic;
    case 'document': return FileIcon;
  }
}

export function getAttachmentLabel(a: Attachment): string {
  switch (a.type) {
    case 'photo': return 'Image';
    case 'video': return 'Video';
    case 'audio': return a.title || 'Audio';
    case 'voice': return 'Voice message';
    case 'document': return a.name || 'Document';
  }
}

export function getAttachmentMeta(a: Attachment): string {
  switch (a.type) {
    case 'photo': {
      const parts = [`${a.width}×${a.height}`];
      if (a.size !== undefined) parts.push(formatSize(a.size));
      return parts.join(' • ');
    }
    case 'video': {
      const parts = [formatDuration(a.duration)];
      if (a.size !== undefined) parts.push(formatSize(a.size));
      return parts.join(' • ');
    }
    case 'audio': {
      const parts: string[] = [];
      if (a.performer) parts.push(a.performer);
      parts.push(formatDuration(a.duration));
      return parts.join(' • ');
    }
    case 'voice':
      return formatDuration(a.duration);
    case 'document':
      return a.size !== undefined ? formatSize(a.size) : '';
  }
}

type AttachmentCardContentProps = {
  attachment: Attachment;
  playing?: boolean;
  label?: string;
  meta?: string;
  onMediaError?: () => void;
};

export function AttachmentCardContent({ attachment, playing = false, label, meta, onMediaError }: AttachmentCardContentProps) {
  const [mediaError, setMediaError] = useState(false);
  const t = useT();
  const isAudioType = attachment.type === 'audio' || attachment.type === 'voice';

  function getLocalizedLabel(a: Attachment): string {
    switch (a.type) {
      case 'photo': return t('attachments.photo_label') ?? 'Image';
      case 'video': return t('attachments.video_label') ?? 'Video';
      case 'audio': return a.title || (t('attachments.audio_label') ?? 'Audio');
      case 'voice': return t('attachments.voice_label') ?? 'Voice message';
      case 'document': return a.name || (t('attachments.document_label') ?? 'Document');
    }
  }
  const Icon = (playing && isAudioType) ? Pause : getAttachmentIcon(attachment);
  const mime = attachment.type === 'document' ? (attachment.mimeType ?? '') : '';
  const isImageDoc = mime.startsWith('image/');
  const isVideoDoc = mime.startsWith('video/');

  function handleMediaError() {
    setMediaError(true);
    onMediaError?.();
  }

  return (
    <>
      <div className="flex shrink-0 items-center px-0 py-2">
        <div className="h-10 w-10 overflow-hidden rounded-md bg-muted flex items-center justify-center">
          {mediaError ? (
            <ImageOff className="h-4 w-4 text-muted-foreground" />
          ) : attachment.type === 'photo' ? (
            <img src={attachment.url} alt="" className="h-full w-full object-cover" onError={handleMediaError} />
          ) : attachment.type === 'video' ? (
            attachment.thumbnail
              ? <img src={attachment.thumbnail} alt="" className="h-full w-full object-cover" onError={handleMediaError} />
              : <video src={attachment.url} className="h-full w-full object-cover" muted preload="metadata" onError={handleMediaError} />
          ) : isImageDoc ? (
            <img src={attachment.url} alt="" className="h-full w-full object-cover" onError={handleMediaError} />
          ) : isVideoDoc ? (
            <video src={attachment.url} className="h-full w-full object-cover" muted preload="metadata" onError={handleMediaError} />
          ) : (
            <Icon className="h-4 w-4 text-muted-foreground" />
          )}
        </div>
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center px-3 py-2">
        <p className="truncate text-sm font-medium leading-tight">{label ?? getLocalizedLabel(attachment)}</p>
        <p className="truncate text-xs leading-tight text-muted-foreground">
          {mediaError ? (t('attachments.load_error') ?? 'Failed to load') : (meta ?? getAttachmentMeta(attachment))}
        </p>
      </div>
    </>
  );
}
