import { type ChangeEvent, useEffect, useRef, useState } from 'react';

import { useAudioPlayer } from '@/hooks/useAudioPlayer';

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
import { GripVertical, Pencil, Plus, Trash2, X } from 'lucide-react';

import { AttachmentCardContent } from '@/components/admin/AttachmentCard';
import { AttachmentPickerDialog } from '@/components/admin/AttachmentPickerDialog';
import { AttachmentPreviewOverlay, type PreviewState } from '@/components/admin/AttachmentPreviewOverlay';
import { getAudioDuration, getAudioTags, getImageDimensions, getVideoMetadata } from '@/utils/mediaMetadata';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useT } from '@/hooks/useT';
import type { Attachment, AttachmentType, DocumentAttachment, MessageBlock, PhotoAttachment, VideoAttachment } from '@/types/template';


async function fileToAttachment(file: File, type: AttachmentType, url: string): Promise<Attachment | null> {
  const id = crypto.randomUUID();
  try {
    if (type === 'photo') {
      const { width, height } = await getImageDimensions(url);
      return { id, type: 'photo', url, name: file.name, width, height, size: file.size };
    }
    if (type === 'video') {
      const { duration, width, height } = await getVideoMetadata(url);
      return { id, type: 'video', url, name: file.name, width, height, duration, size: file.size };
    }
    if (type === 'audio') {
      const [duration, tags] = await Promise.all([getAudioDuration(url), getAudioTags(file)]);
      return { id, type: 'audio', url, name: file.name, duration, ...tags };
    }
    if (type === 'voice') {
      const duration = await getAudioDuration(url);
      return { id, type: 'voice', url, name: file.name, duration };
    }
    return { id, type: 'document', url, name: file.name, size: file.size, mimeType: file.type || undefined };
  } catch {
    return null;
  }
}


type SortableAttachmentCardProps = {
  attachment: Attachment;
  showGrip: boolean;
  onPreview: (a: Attachment) => void;
  onRemove: (id: string) => void;
  isDragging?: boolean;
};

function SortableAttachmentCard({ attachment, showGrip, onPreview, onRemove, isDragging = false }: SortableAttachmentCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: attachment.id });
  const isAudio = attachment.type === 'audio' || attachment.type === 'voice';
  const canPreview = attachment.type === 'photo' || attachment.type === 'video' || attachment.type === 'document';

  const { playing, audioRef, toggle, onEnded } = useAudioPlayer();
  const [mediaError, setMediaError] = useState(false);

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
      {isAudio && <audio ref={audioRef} src={attachment.url} onEnded={onEnded} />}
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
        <AttachmentCardContent attachment={attachment} playing={playing} onMediaError={() => setMediaError(true)} />
      </div>
      <div className="my-2.5 w-px shrink-0 self-stretch bg-border" />
      <button
        type="button"
        onClick={() => onRemove(attachment.id)}
        className="flex w-12 shrink-0 items-center justify-center text-muted-foreground/60 hover:text-foreground"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

type MessageBlockSheetProps = {
  block: MessageBlock | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (block: MessageBlock) => void;
  onDelete?: (id: string) => void;
};

export function MessageBlockSheet({
  block,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: MessageBlockSheetProps) {
  const [text, setText] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [activeAttachment, setActiveAttachment] = useState<Attachment | null>(null);
  const [pickerFile, setPickerFile] = useState<File | null>(null);
  const [pickerUrl, setPickerUrl] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = useT();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  useEffect(() => {
    if (block) {
      setText(block.text);
      setAttachments(block.attachments);
    } else {
      setText('');
      setAttachments([]);
    }
  }, [block]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [text]);

  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.style.height = 'auto';
      el.style.height = `${el.scrollHeight}px`;
    });
    return () => cancelAnimationFrame(id);
  }, [open]);

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (pickerUrl) URL.revokeObjectURL(pickerUrl);
    const url = URL.createObjectURL(file);
    setPickerFile(file);
    setPickerUrl(url);
  }

  async function handlePickerConfirm(type: AttachmentType) {
    if (!pickerFile || !pickerUrl) return;
    const attachment = await fileToAttachment(pickerFile, type, pickerUrl);
    if (attachment) {
      setAttachments(prev => [...prev, attachment]);
    } else {
      URL.revokeObjectURL(pickerUrl);
    }
    setPickerFile(null);
    setPickerUrl('');
  }

  function handlePickerClose() {
    if (pickerUrl) URL.revokeObjectURL(pickerUrl);
    setPickerFile(null);
    setPickerUrl('');
  }

  function handlePickerPickAnother() {
    fileInputRef.current?.click();
  }

  function handleRemoveAttachment(id: string) {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }

  function handlePreview(attachment: Attachment) {
    if (attachment.type === 'photo' || attachment.type === 'video') {
      const mediaList = attachments.filter(
        (a): a is PhotoAttachment | VideoAttachment => a.type === 'photo' || a.type === 'video',
      );
      setPreviewState({
        type: 'media',
        attachments: mediaList,
        initialIndex: Math.max(0, mediaList.findIndex(m => m.id === attachment.id)),
      });
    } else if (attachment.type === 'document') {
      setPreviewState({ type: 'document', attachment: attachment as DocumentAttachment });
    }
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveAttachment(attachments.find(a => a.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveAttachment(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setAttachments(prev => {
        const oldIndex = prev.findIndex(a => a.id === active.id);
        const newIndex = prev.findIndex(a => a.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleSave() {
    const saved: MessageBlock = block
      ? { ...block, text, attachments }
      : { id: crypto.randomUUID(), text, attachments };
    onSave(saved);
    onOpenChange(false);
  }

  function handleDeleteConfirm() {
    if (block && onDelete) {
      onDelete(block.id);
    }
    setDeleteOpen(false);
    onOpenChange(false);
  }

  const isEditing = block !== null;
  const isSaveDisabled = text.trim() === '' && attachments.length === 0;
  const showGrip = attachments.length > 1;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              {isEditing ? (
                <Pencil className="h-5 w-5 shrink-0" />
              ) : (
                <Plus className="h-5 w-5 shrink-0" />
              )}
              {isEditing ? (t('templates.edit_block_title_edit') ?? 'Edit block') : (t('templates.edit_block_title_add') ?? 'Add block')}
            </SheetTitle>

            {isEditing && onDelete && (
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 rounded-full text-destructive hover:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </SheetHeader>

          <div className="flex flex-col gap-3 px-4 pb-4">
            <Textarea
              ref={textareaRef}
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={t('templates.edit_block_text_placeholder') ?? 'Message text…'}
              className="resize-none overflow-y-auto"
              style={{ minHeight: '2.5rem', maxHeight: '10rem' }}
            />

            <div className="flex flex-col gap-2">
              {attachments.length > 0 && (
                <div className="max-h-39 overflow-y-auto scrollbar-none [&::-webkit-scrollbar]:hidden">
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext items={attachments.map(a => a.id)} strategy={verticalListSortingStrategy}>
                      <div className="flex flex-col gap-1.5">
                        {attachments.map(attachment => (
                          <SortableAttachmentCard
                            key={attachment.id}
                            attachment={attachment}
                            showGrip={showGrip}
                            onPreview={handlePreview}
                            onRemove={handleRemoveAttachment}
                            isDragging={activeAttachment?.id === attachment.id}
                          />
                        ))}
                      </div>
                    </SortableContext>
                    <DragOverlay dropAnimation={null}>
                      {activeAttachment && (
                        <div className="flex items-stretch overflow-hidden rounded-lg border bg-card opacity-90 shadow-lg">
                          {showGrip && <div className="flex w-8 shrink-0 items-center justify-center text-muted-foreground/40"><GripVertical className="h-4 w-4" /></div>}
                          <div className="flex min-w-0 flex-1 items-center">
                            <AttachmentCardContent attachment={activeAttachment} />
                          </div>
                          <div className="my-2.5 w-px shrink-0 self-stretch bg-border" />
                          <div className="flex w-12 shrink-0 items-center justify-center text-muted-foreground/60"><X className="h-4 w-4" /></div>
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={attachments.length >= 10}
              >
                {t('templates.edit_block_add_attachment') ?? 'Add attachment'}
              </Button>
            </div>

            <Button className="w-full" onClick={handleSave} disabled={isSaveDisabled}>
              {t('templates.edit_block_save') ?? 'Save'}
            </Button>
          </div>

          <AttachmentPreviewOverlay preview={previewState} onClose={() => setPreviewState(null)} />
          {pickerFile && (
            <AttachmentPickerDialog
              file={pickerFile}
              url={pickerUrl}
              onConfirm={type => void handlePickerConfirm(type)}
              onPickAnother={handlePickerPickAnother}
              onClose={handlePickerClose}
            />
          )}
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.block_delete_confirm_title') ?? 'Delete this block?'}</AlertDialogTitle>
            <AlertDialogDescription>{t('templates.block_delete_confirm_description') ?? 'This action cannot be undone.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('templates.block_delete_cancel') ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction variant="destructive" onClick={handleDeleteConfirm}>
              {t('templates.block_delete_confirm') ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
