import { Fragment, useEffect, useState } from 'react';

import { AttachmentCardContent } from '@/components/admin/AttachmentCard';
import { AttachmentPreviewOverlay, type PreviewState } from '@/components/admin/AttachmentPreviewOverlay';
import { Button } from '@/components/ui/button';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useT } from '@/hooks/useT';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { AUDIO_EXTENSIONS, detectType, fileExt, getCompatibleTypes } from '@/utils/attachmentType';
import { formatSize } from '@/utils/formatters';
import { getAudioDuration, getAudioTags, getImageDimensions, getVideoMetadata } from '@/utils/mediaMetadata';
import type { Attachment, AttachmentType, DocumentAttachment, PhotoAttachment, VideoAttachment } from '@/types/template';

type TypeOption = {
  value: AttachmentType;
  label: string;
  description: string;
};

export type ExtractedMeta = {
  width?: number;
  height?: number;
  duration?: number;
  title?: string;
  performer?: string;
};

function fileToDisplayAttachment(file: File, url: string, type: AttachmentType, meta: ExtractedMeta | null): Attachment {
  const id = 'picker';
  switch (type) {
    case 'photo':    return { id, type: 'photo',    url, name: file.name, width: meta?.width ?? 0, height: meta?.height ?? 0, size: file.size };
    case 'video':    return { id, type: 'video',    url, name: file.name, width: meta?.width ?? 0, height: meta?.height ?? 0, duration: meta?.duration ?? 0, size: file.size };
    case 'audio':    return { id, type: 'audio',    url, name: file.name, duration: meta?.duration ?? 0, title: meta?.title, performer: meta?.performer };
    case 'voice':    return { id, type: 'voice',    url, name: file.name, duration: meta?.duration ?? 0 };
    case 'document': return { id, type: 'document', url, name: file.name, size: file.size, mimeType: file.type || undefined };
  }
}

function fileToPreviewAttachment(file: File, url: string): DocumentAttachment {
  return { id: 'picker', type: 'document', url, name: file.name, size: file.size, mimeType: file.type || undefined };
}

type AttachmentPickerDialogProps = {
  file: File;
  url: string;
  onConfirm: (type: AttachmentType, meta: ExtractedMeta | null) => void;
  onPickAnother: () => void;
  onClose: () => void;
};

export function AttachmentPickerDialog({ file, url, onConfirm, onPickAnother, onClose }: AttachmentPickerDialogProps) {
  const compatible = getCompatibleTypes(file);
  const [selectedType, setSelectedType] = useState<AttachmentType>(() => detectType(file));
  const [preview, setPreview] = useState<PreviewState | null>(null);
  const [mediaError, setMediaError] = useState(false);
  const [extractedMeta, setExtractedMeta] = useState<ExtractedMeta | null>(null);
  const { playing, audioRef, toggle, pause, onEnded } = useAudioPlayer();
  const t = useT();

  const TYPE_OPTIONS: TypeOption[] = [
    { value: 'photo', label: t('attachments.photo_label') ?? 'Image', description: t('attachments.photo_description') ?? 'Photo from device gallery or camera' },
    { value: 'video', label: t('attachments.video_label') ?? 'Video', description: t('attachments.video_description') ?? 'Video file from device' },
    { value: 'audio', label: t('attachments.audio_label') ?? 'Audio', description: t('attachments.audio_description') ?? 'Music or sound recording' },
    { value: 'voice', label: t('attachments.voice_label') ?? 'Voice message', description: t('attachments.voice_description') ?? 'Voice message recording' },
    { value: 'document', label: t('attachments.document_label') ?? 'Document', description: t('attachments.document_description') ?? 'Any file: PDF, ZIP, DOCX, etc.' },
  ];

  const displayAttachment = fileToDisplayAttachment(file, url, selectedType, extractedMeta);
  const isAudio = selectedType === 'audio' || selectedType === 'voice';

  const metaOverride: string | undefined = (() => {
    if (selectedType === 'photo') return extractedMeta?.width ? undefined : formatSize(file.size);
    if (selectedType === 'video' || selectedType === 'audio' || selectedType === 'voice')
      return extractedMeta?.duration ? undefined : formatSize(file.size);
    return undefined;
  })();

  useEffect(() => {
    setSelectedType(detectType(file));
    setExtractedMeta(null);
    setMediaError(false);

    let cancelled = false;

    async function extract() {
      try {
        const meta: ExtractedMeta = {};
        if (file.type.startsWith('image/')) {
          const dims = await getImageDimensions(url);
          meta.width = dims.width;
          meta.height = dims.height;
        } else if (file.type.startsWith('video/')) {
          const v = await getVideoMetadata(url);
          meta.width = v.width;
          meta.height = v.height;
          meta.duration = v.duration;
        } else if (file.type.startsWith('audio/') || AUDIO_EXTENSIONS.has(fileExt(file.name))) {
          const [duration, tags] = await Promise.all([getAudioDuration(url), getAudioTags(file)]);
          meta.duration = duration;
          meta.title = tags.title;
          meta.performer = tags.performer;
        }
        if (!cancelled) setExtractedMeta(meta);
      } catch {
        if (!cancelled) setExtractedMeta({});
      }
    }

    void extract();
    return () => { cancelled = true; };
  }, [file, url]);

  useEffect(() => {
    pause();
  }, [selectedType]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  function handleCardClick() {
    if (isAudio) {
      toggle();
    } else if (!mediaError) {
      if (selectedType === 'photo') {
        const photo: PhotoAttachment = { id: 'picker', type: 'photo', url, name: file.name, width: extractedMeta?.width ?? 1, height: extractedMeta?.height ?? 1, size: file.size };
        setPreview({ type: 'media', attachments: [photo], initialIndex: 0 });
      } else if (selectedType === 'video') {
        const video: VideoAttachment = { id: 'picker', type: 'video', url, name: file.name, width: extractedMeta?.width ?? 1, height: extractedMeta?.height ?? 1, duration: extractedMeta?.duration ?? 0, size: file.size };
        setPreview({ type: 'media', attachments: [video], initialIndex: 0 });
      } else {
        setPreview({ type: 'document', attachment: fileToPreviewAttachment(file, url) });
      }
    }
  }

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-background"
      onPointerDown={e => e.stopPropagation()}
      onClick={e => e.stopPropagation()}
    >
      <div className="z-10 shrink-0 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 py-3">
          <h1 className="text-center text-base font-semibold">{t('attachments.picker_title') ?? 'Add attachment'}</h1>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto flex w-full max-w-[480px] flex-col gap-4 p-4">
          <div className="overflow-hidden rounded-lg border bg-card">
            {isAudio && <audio ref={audioRef} src={url} onEnded={onEnded} />}
            <div className="flex min-w-0 cursor-pointer items-center pl-3" onClick={handleCardClick}>
              <AttachmentCardContent
                attachment={displayAttachment}
                playing={playing}
                meta={metaOverride}
                onMediaError={() => setMediaError(true)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium">{t('attachments.picker_type_label') ?? 'Attachment type'}</p>
            <RadioGroup
              value={selectedType}
              onValueChange={v => setSelectedType(v as AttachmentType)}
              className="gap-0 overflow-hidden rounded-lg border"
            >
              {TYPE_OPTIONS.map((opt, i) => {
                const disabled = !compatible.includes(opt.value);
                return (
                  <Fragment key={opt.value}>
                    {i > 0 && <div className="h-px bg-border" />}
                    <label
                      htmlFor={`type-${opt.value}`}
                      className={`flex items-center gap-3 px-4 py-3 transition-colors${disabled ? ' cursor-not-allowed opacity-40' : ' cursor-pointer hover:bg-muted/50 active:bg-muted'}`}
                    >
                      <RadioGroupItem value={opt.value} id={`type-${opt.value}`} disabled={disabled} />
                      <div>
                        <p className="text-sm">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">{opt.description}</p>
                      </div>
                    </label>
                  </Fragment>
                );
              })}
            </RadioGroup>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t bg-background">
        <div className="mx-auto flex max-w-[480px] flex-col gap-2 p-4">
          <Button className="w-full" onClick={() => onConfirm(selectedType, extractedMeta)}>
            {t('attachments.picker_add') ?? 'Add'}
          </Button>
          <Button variant="outline" className="w-full" onClick={onPickAnother}>
            {t('attachments.picker_change_file') ?? 'Choose a different file'}
          </Button>
        </div>
      </div>

      <AttachmentPreviewOverlay preview={preview} onClose={() => setPreview(null)} />
    </div>
  );
}
