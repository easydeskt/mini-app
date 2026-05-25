import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { createPortal } from 'react-dom';

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Paperclip, X } from 'lucide-react';
import { toast } from 'sonner';

import {
  deleteTemplateAttachment,
  fetchTemplateAttachmentBlobUrl,
  getTemplateAttachmentContentUrl,
  reorderTemplateAttachments,
  uploadTemplateAttachment,
} from '@/api/templates';
import { AttachmentCardContent } from '@/components/admin/AttachmentCard';
import { AttachmentPickerDialog, type ExtractedMeta } from '@/components/admin/AttachmentPickerDialog';
import { AttachmentPreviewOverlay, type PreviewState } from '@/components/admin/AttachmentPreviewOverlay';
import { Button } from '@/components/ui/button';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useAudioPlayer } from '@/hooks/useAudioPlayer';
import { useT } from '@/hooks/useT';
import type {
  Attachment,
  AttachmentType,
  ApiAttachmentKind,
  DocumentAttachment,
  PhotoAttachment,
  PendingUiAttachment,
  ServerUiAttachment,
  UiAttachment,
  VideoAttachment,
} from '@/types/template';

const KIND_MAP: Record<AttachmentType, ApiAttachmentKind> = {
  audio: 'AUDIO',
  document: 'DOCUMENT',
  photo: 'PHOTO',
  video: 'VIDEO',
  voice: 'VOICE',
};

function uiAttachmentId(a: UiAttachment): string {
  return a._uiKind === 'pending' ? a.localId : String(a.attachmentId);
}

function toDisplayAttachment(a: UiAttachment): Attachment {
  const id = uiAttachmentId(a);
  const url = a._uiKind === 'pending'
    ? a.objectUrl
    : getTemplateAttachmentContentUrl(a.templateId, a.attachmentId);

  switch (a.kind) {
    case 'PHOTO':
      return { id, type: 'photo', url, name: a.fileName, width: (a.attributes?.['width'] as number | undefined) ?? 1, height: (a.attributes?.['height'] as number | undefined) ?? 1, size: a.fileSize };
    case 'VIDEO':
      return { id, type: 'video', url, name: a.fileName, width: (a.attributes?.['width'] as number | undefined) ?? 1, height: (a.attributes?.['height'] as number | undefined) ?? 1, duration: 0, size: a.fileSize };
    case 'AUDIO':
      return { id, type: 'audio', url, name: a.fileName, duration: 0 };
    case 'VOICE':
      return { id, type: 'voice', url, name: a.fileName, duration: 0 };
    case 'DOCUMENT':
      return { id, type: 'document', url, name: a.fileName, size: a.fileSize, mimeType: a.contentType };
  }
}

type SortableUiAttachmentCardProps = {
  attachment: UiAttachment;
  isDragging?: boolean;
  onPreview: (a: UiAttachment) => void;
  onRemove: (a: UiAttachment) => void;
  showGrip: boolean;
};

function SortableUiAttachmentCard({
  attachment,
  isDragging = false,
  onPreview,
  onRemove,
  showGrip,
}: SortableUiAttachmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: uiAttachmentId(attachment) });
  const { playing, audioRef, toggle, onEnded } = useAudioPlayer();
  const [mediaError, setMediaError] = useState(false);
  const display = toDisplayAttachment(attachment);
  const isAudio = display.type === 'audio' || display.type === 'voice';
  const canPreview = display.type === 'photo' || display.type === 'video' || display.type === 'document';

  function handleContentClick() {
    if (isAudio) toggle();
    else if (canPreview && !mediaError) onPreview(attachment);
  }

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      className="flex items-stretch overflow-hidden rounded-lg border bg-card"
    >
      {isAudio && <audio ref={audioRef} src={display.type === 'audio' || display.type === 'voice' ? display.url : ''} onEnded={onEnded} />}
      {showGrip && (
        <button
          type="button"
          className="flex w-8 shrink-0 cursor-grab items-center justify-center touch-none text-muted-foreground/40 active:cursor-grabbing"
          aria-label="Переместить вложение"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      )}
      <div
        className={`flex min-w-0 flex-1 cursor-pointer items-center${showGrip ? '' : ' pl-3'}`}
        onClick={handleContentClick}
      >
        <AttachmentCardContent attachment={display} playing={playing} onMediaError={() => setMediaError(true)} />
      </div>
      <div className="my-2.5 w-px shrink-0 self-stretch bg-border" />
      <button
        type="button"
        onClick={() => onRemove(attachment)}
        className="flex w-12 shrink-0 items-center justify-center text-muted-foreground/60 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export type TemplateAttachmentsDialogProps = {
  attachments: UiAttachment[];
  onAttachmentsChange: (attachments: UiAttachment[]) => void;
  onClose: () => void;
  open: boolean;
  templateId: number | null;
};

export function TemplateAttachmentsDialog({
  attachments,
  onAttachmentsChange,
  onClose,
  open,
  templateId,
}: TemplateAttachmentsDialogProps) {
  const [localAttachments, setLocalAttachments] = useState<UiAttachment[]>(attachments);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [pickerFile, setPickerFile] = useState<File | null>(null);
  const [pickerUrl, setPickerUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  useEffect(() => {
    if (open) setLocalAttachments(attachments);
  }, [open]); // intentionally not including attachments — sync only on open

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  function updateAttachments(next: UiAttachment[]) {
    setLocalAttachments(next);
    onAttachmentsChange(next);
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = localAttachments.findIndex(a => uiAttachmentId(a) === active.id);
    const newIndex = localAttachments.findIndex(a => uiAttachmentId(a) === over.id);
    const next = arrayMove(localAttachments, oldIndex, newIndex);
    updateAttachments(next);

    if (templateId !== null) {
      const serverIds = next
        .filter((a): a is ServerUiAttachment => a._uiKind === 'server')
        .map(a => a.attachmentId);
      reorderTemplateAttachments(templateId, serverIds).catch(() => {
        toast.error(t('templates.reorder_error') ?? 'Failed to reorder attachments');
      });
    }
  }

  async function handleRemove(attachment: UiAttachment) {
    if (attachment._uiKind === 'pending') {
      URL.revokeObjectURL(attachment.objectUrl);
      updateAttachments(localAttachments.filter(a => uiAttachmentId(a) !== uiAttachmentId(attachment)));
      return;
    }

    if (templateId !== null) {
      try {
        await deleteTemplateAttachment(templateId, attachment.attachmentId);
        updateAttachments(localAttachments.filter(a => uiAttachmentId(a) !== uiAttachmentId(attachment)));
      } catch {
        toast.error(t('templates.delete_attachment_error') ?? 'Failed to delete attachment');
      }
    }
  }

  async function handlePreview(attachment: UiAttachment) {
    const id = uiAttachmentId(attachment);
    const kind = attachment.kind;

    if (kind !== 'PHOTO' && kind !== 'VIDEO' && kind !== 'DOCUMENT') return;

    let url: string;

    if (attachment._uiKind === 'pending') {
      url = attachment.objectUrl;
    } else {
      try {
        url = await fetchTemplateAttachmentBlobUrl(attachment.templateId, attachment.attachmentId);
      } catch {
        toast.error(t('attachments.load_error') ?? 'Failed to load');
        return;
      }
    }

    if (kind === 'PHOTO') {
      const photo: PhotoAttachment = { id, type: 'photo', url, name: attachment.fileName, width: 1, height: 1, size: attachment.fileSize };
      setPreviewState({ type: 'media', attachments: [photo], initialIndex: 0 });
    } else if (kind === 'VIDEO') {
      const video: VideoAttachment = { id, type: 'video', url, name: attachment.fileName, width: 1, height: 1, duration: 0, size: attachment.fileSize };
      setPreviewState({ type: 'media', attachments: [video], initialIndex: 0 });
    } else {
      const doc: DocumentAttachment = { id, type: 'document', url, name: attachment.fileName, size: attachment.fileSize, mimeType: attachment.contentType };
      setPreviewState({ type: 'document', attachment: doc });
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (pickerUrl) URL.revokeObjectURL(pickerUrl);
    const url = URL.createObjectURL(file);
    setPickerFile(file);
    setPickerUrl(url);
  }

  async function computeHash(file: File): Promise<string> {
    const buf = await file.arrayBuffer();
    const hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function handlePickerConfirm(type: AttachmentType, meta: ExtractedMeta | null) {
    if (!pickerFile || !pickerUrl) return;
    const apiKind = KIND_MAP[type];

    const fileHash = await computeHash(pickerFile);
    const isDuplicate = localAttachments.some(att =>
      att._uiKind === 'pending'
        ? att.hash === fileHash
        : att.fileName === pickerFile.name && att.fileSize === pickerFile.size,
    );
    if (isDuplicate) {
      toast.error(t('templates.attachment_duplicate') ?? 'This file is already attached');
      handlePickerClose();
      return;
    }

    if (templateId !== null) {
      setIsUploading(true);
      try {
        const result = await uploadTemplateAttachment(templateId, apiKind, pickerFile);
        const newAttachment: ServerUiAttachment = {
          _uiKind: 'server',
          attachmentId: result.attachment_id,
          attributes: result.attributes ?? {},
          contentType: result.content_type,
          fileName: result.file_name,
          fileSize: result.file_size,
          kind: result.kind,
          templateId: result.template_id,
        };
        updateAttachments([...localAttachments, newAttachment]);
        URL.revokeObjectURL(pickerUrl);
      } catch {
        toast.error(t('templates.upload_error') ?? 'Failed to upload attachment');
        URL.revokeObjectURL(pickerUrl);
      } finally {
        setIsUploading(false);
      }
    } else {
      const attrs: Record<string, unknown> = {};
      if (meta?.width) attrs['width'] = meta.width;
      if (meta?.height) attrs['height'] = meta.height;
      if (meta?.duration) attrs['duration'] = meta.duration;
      const pending: PendingUiAttachment = {
        _uiKind: 'pending',
        attributes: attrs,
        contentType: pickerFile.type,
        file: pickerFile,
        fileName: pickerFile.name,
        fileSize: pickerFile.size,
        hash: fileHash,
        kind: apiKind,
        localId: crypto.randomUUID(),
        objectUrl: pickerUrl,
      };
      updateAttachments([...localAttachments, pending]);
    }

    setPickerFile(null);
    setPickerUrl('');
  }

  function handlePickerClose() {
    if (pickerUrl) URL.revokeObjectURL(pickerUrl);
    setPickerFile(null);
    setPickerUrl('');
  }

  const activeAttachment = activeId ? localAttachments.find(a => uiAttachmentId(a) === activeId) : null;
  const showGrip = localAttachments.length > 1;
  const canAdd = localAttachments.length < 10;

  const dialog = open ? createPortal(
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 animate-in fade-in-0 duration-200"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 z-[51] flex w-full max-w-[min(480px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 max-h-[85dvh] flex-col rounded-lg border bg-background shadow-lg animate-in fade-in-0 zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
        <div className="flex shrink-0 items-center justify-between border-b px-4 py-3">
          <p className="text-base font-semibold">
            {t('templates.attachments_sheet_title') ?? 'Attachments'}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground/60 transition-colors hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-4">
          {localAttachments.length === 0 ? (
            <Empty className="flex-1 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <Paperclip />
                </EmptyMedia>
                <EmptyTitle>{t('templates.attachments_empty_title') ?? 'No attachments'}</EmptyTitle>
                <EmptyDescription>{t('templates.attachments_empty_description') ?? 'Add up to 10 attachments'}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            >
              <SortableContext items={localAttachments.map(uiAttachmentId)} strategy={verticalListSortingStrategy}>
                <div className="flex flex-col gap-1.5">
                  {localAttachments.map(attachment => (
                    <SortableUiAttachmentCard
                      key={uiAttachmentId(attachment)}
                      attachment={attachment}
                      showGrip={showGrip}
                      isDragging={uiAttachmentId(attachment) === activeId}
                      onPreview={a => { void handlePreview(a); }}
                      onRemove={a => { void handleRemove(a); }}
                    />
                  ))}
                </div>
              </SortableContext>
              {createPortal(
                <DragOverlay dropAnimation={null}>
                  {activeAttachment && (
                    <div className="flex items-stretch overflow-hidden rounded-lg border bg-card opacity-90 shadow-lg">
                      {showGrip && (
                        <div className="flex w-8 shrink-0 items-center justify-center text-muted-foreground/40">
                          <GripVertical className="h-4 w-4" />
                        </div>
                      )}
                      <div className="flex min-w-0 flex-1 items-center pl-3">
                        <AttachmentCardContent attachment={toDisplayAttachment(activeAttachment)} />
                      </div>
                      <div className="my-2.5 w-px shrink-0 self-stretch bg-border" />
                      <div className="flex w-12 shrink-0 items-center justify-center text-muted-foreground/60">
                        <X className="h-4 w-4" />
                      </div>
                    </div>
                  )}
                </DragOverlay>,
                document.body,
              )}
            </DndContext>
          )}
        </div>

        <div className="shrink-0 border-t p-4 flex flex-col gap-2">
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={() => fileInputRef.current?.click()}
            disabled={!canAdd || isUploading}
          >
            {t('templates.attachments_add') ?? 'Add attachment'}
          </Button>
          <Button
            type="button"
            className="w-full"
            onClick={onClose}
          >
            {t('templates.attachments_done') ?? 'Done'}
          </Button>
        </div>
      </div>
    </>,
    document.body,
  ) : null;

  return (
    <>
      {dialog}

      {pickerFile && (
        <AttachmentPickerDialog
          file={pickerFile}
          url={pickerUrl}
          onConfirm={(type, meta) => { void handlePickerConfirm(type, meta); }}
          onPickAnother={() => fileInputRef.current?.click()}
          onClose={handlePickerClose}
        />
      )}

      <AttachmentPreviewOverlay
        preview={previewState}
        onClose={() => setPreviewState(null)}
      />
    </>
  );
}
