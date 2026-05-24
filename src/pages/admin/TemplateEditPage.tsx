import { useEffect, useRef, useState } from 'react';

import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragStartEvent,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, LifeBuoy, MessageCircleMore, MoreVertical, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { queryKeys } from '@/api/query-keys';
import { createTemplate, deleteTemplate, updateTemplate } from '@/api/templates';
import { AttachmentPreviewOverlay, type PreviewableAttachment, type PreviewState } from '@/components/admin/AttachmentPreviewOverlay';
import { MediaGrid } from '@/components/admin/MediaGrid';
import { MessageBlockSheet } from '@/components/admin/MessageBlockSheet';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { InputGroup, InputGroupAddon, InputGroupInput } from '@/components/ui/input-group';
import { Separator } from '@/components/ui/separator';
import { useTemplate } from '@/hooks/queries/useTemplates';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type { MessageBlock, PhotoAttachment, VideoAttachment } from '@/types/template';

type OnPreviewFn = (attachment: PreviewableAttachment) => void;

function BubbleContent({ block, onPreview }: { block: MessageBlock; onPreview?: OnPreviewFn }) {
  const visualMedia = block.attachments.filter(a => a.type === 'photo' || a.type === 'video');
  const hasVisualMedia = visualMedia.length > 0;
  const nonVisual = block.attachments.filter(
    a => a.type === 'audio' || a.type === 'voice' || a.type === 'document',
  );

  return (
    <div className="w-fit max-w-full overflow-hidden rounded-2xl rounded-tr-sm bg-secondary text-secondary-foreground">
      {hasVisualMedia && <MediaGrid attachments={visualMedia} onPreview={onPreview} />}
      {!hasVisualMedia && nonVisual.length > 0 && <MediaGrid attachments={nonVisual} onPreview={onPreview} />}
      {block.text.trim() && (
        <p className="whitespace-pre-wrap px-3 py-2 text-sm">{block.text}</p>
      )}
      {hasVisualMedia && nonVisual.length > 0 && <MediaGrid attachments={nonVisual} onPreview={onPreview} />}
    </div>
  );
}

type SortableTemplateBubbleProps = {
  block: MessageBlock;
  showGrip: boolean;
  onClick: () => void;
  onPreview?: OnPreviewFn;
};

function SortableTemplateBubble({ block, showGrip, onClick, onPreview }: SortableTemplateBubbleProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0 : 1 }}
      className="flex cursor-pointer justify-end"
      onClick={onClick}
    >
      <div className="flex w-[90%] items-start justify-end gap-2">
        {showGrip && (
          <button
            type="button"
            className="mt-3.5 shrink-0 cursor-grab touch-none text-muted-foreground/40 active:cursor-grabbing"
            aria-label="Переместить блок"
            onClick={e => e.stopPropagation()}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-4 w-4" />
          </button>
        )}
        <div
          role="button"
          tabIndex={0}
          onClick={e => { e.stopPropagation(); onClick(); }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick(); }}
          className="min-w-0 cursor-pointer text-left outline-none"
        >
          <BubbleContent block={block} onPreview={onPreview} />
        </div>
      </div>
    </div>
  );
}

export function TemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const isNew = id === 'new';
  const { data: template } = useTemplate(isNew ? -1 : +(id ?? -1));

  const [name, setName] = useState<string>(isNew ? '' : (template?.name ?? ''));
  const [blocks, setBlocks] = useState<MessageBlock[]>(isNew ? [] : (template?.blocks ?? []));
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<MessageBlock | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [activeBlock, setActiveBlock] = useState<MessageBlock | null>(null);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const prevBlocksLengthRef = useRef(blocks.length);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } }),
  );

  const queryClient = useQueryClient();

  function getContent(): string | null {
    const text = blocks.map(b => b.text.trim()).filter(Boolean).join('\n\n');
    return text || null;
  }

  const saveMutation = useMutation({
    mutationFn: () => isNew
      ? createTemplate(name.trim(), getContent())
      : updateTemplate(+(id ?? 0), name.trim(), getContent()),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
      if (!isNew) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(+(id ?? 0)) });
      }
      void navigate('/admin/templates');
    },
    onError: () => {
      toast.error(t('templates.save_error') ?? 'Failed to save template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTemplate(+(id ?? 0)),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
      void navigate('/admin/templates');
    },
    onError: () => {
      toast.error(t('templates.delete_error') ?? 'Failed to delete template');
    },
  });

  useBackButton();

  useEffect(() => {
    if (template) {
      setName(template.name);
      setBlocks(template.blocks);
    }
  }, [template]);

  useEffect(() => {
    const prev = prevBlocksLengthRef.current;
    prevBlocksLengthRef.current = blocks.length;

    if (blocks.length <= prev) return;

    const html = document.documentElement;
    html.scrollTop = html.scrollHeight;

    const obs = new ResizeObserver(() => { html.scrollTop = html.scrollHeight; });
    if (scrollRef.current) obs.observe(scrollRef.current);

    const cleanup = setTimeout(() => obs.disconnect(), 2000);
    return () => { clearTimeout(cleanup); obs.disconnect(); };
  }, [blocks]);

  function handleDragStart(event: DragStartEvent) {
    setActiveBlock(blocks.find(b => b.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveBlock(null);
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setBlocks(prev => {
        const oldIndex = prev.findIndex(b => b.id === active.id);
        const newIndex = prev.findIndex(b => b.id === over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  }

  function handleBlockSave(saved: MessageBlock) {
    setBlocks(prev => {
      const idx = prev.findIndex(b => b.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  }

  function handleBlockDelete(blockId: string) {
    setBlocks(prev => prev.filter(b => b.id !== blockId));
  }

  function handleSave() {
    saveMutation.mutate();
  }

  return (
    <div className="flex min-h-dvh flex-col bg-background">

      {dropdownOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 transition-opacity" />
      )}

      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] px-4 pb-3 pt-4">
          <div className="flex items-start justify-between gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              {isNew ? (t('templates.edit_title_new') ?? 'Create template') : (t('templates.edit_title_edit') ?? 'Edit template')}
            </h1>
            <div className="mt-0.5">
              <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="shrink-0 rounded-full">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" sideOffset={24}>
                  <DropdownMenuItem onClick={() => setHelpOpen(true)}>
                    <LifeBuoy />
                    {t('templates.edit_menu_how') ?? 'How does it work?'}
                  </DropdownMenuItem>
                  {!isNew && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" onClick={() => setDeleteOpen(true)}>
                        <Trash2 />
                        {t('templates.edit_menu_delete') ?? 'Delete template'}
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex flex-1 flex-col">
        {blocks.length === 0 ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleMore />
              </EmptyMedia>
              <EmptyTitle>{t('templates.edit_empty_title') ?? 'Nothing here yet'}</EmptyTitle>
              <EmptyDescription>{t('templates.edit_empty_description') ?? 'Add the first message block using the button below.'}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
            <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
              <div className="mx-auto mt-auto w-full max-w-[480px] flex flex-col gap-3 px-4 py-4">
                {blocks.map(block => (
                  <SortableTemplateBubble
                    key={block.id}
                    block={block}
                    showGrip={blocks.length > 1}
                    onClick={() => { setEditingBlock(block); setSheetOpen(true); }}
                    onPreview={(a) => {
                      if (a.type === 'photo' || a.type === 'video') {
                        const mediaList = block.attachments.filter(
                          (att): att is PhotoAttachment | VideoAttachment =>
                            att.type === 'photo' || att.type === 'video',
                        );
                        setPreviewState({
                          type: 'media',
                          attachments: mediaList,
                          initialIndex: Math.max(0, mediaList.findIndex(m => m.id === a.id)),
                        });
                      } else if (a.type === 'document') {
                        setPreviewState({ type: 'document', attachment: a });
                      }
                    }}
                  />
                ))}
              </div>
            </SortableContext>
            <DragOverlay dropAnimation={null}>
              {activeBlock && (
                <div className="mx-auto w-full max-w-[480px] flex justify-end px-4">
                  <div className="flex w-[90%] items-start justify-end gap-2 opacity-90">
                    {blocks.length > 1 && (
                      <div className="mt-3.5 w-4 shrink-0" />
                    )}
                    <div className="min-w-0 flex-1">
                      <BubbleContent block={activeBlock} />
                    </div>
                  </div>
                </div>
              )}
            </DragOverlay>
          </DndContext>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] flex flex-col gap-3 px-4 pb-6 pt-3">
        <InputGroup>
          <InputGroupAddon>
            <MessageCircleMore className="h-4 w-4" />
          </InputGroupAddon>
          <InputGroupInput
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder={t('templates.edit_name_placeholder') ?? 'Template name'}
          />
        </InputGroup>
        <Separator />
        <Button
          variant="outline"
          className="w-full"
          onClick={() => { setEditingBlock(null); setSheetOpen(true); }}
        >
          {t('templates.edit_add_block') ?? 'Add message block'}
        </Button>
        <Button
          className="w-full"
          onClick={handleSave}
          disabled={!name.trim() || saveMutation.isPending}
        >
          {t('templates.edit_save') ?? 'Save'}
        </Button>
        </div>
      </div>

      <AlertDialog open={helpOpen} onOpenChange={setHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.help_title') ?? 'How does it work?'}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>{t('templates.help_intro') ?? 'Build a quick reply template:'}</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>{t('templates.help_bullet_add') ?? 'Add message blocks'}</li>
              <li>{t('templates.help_bullet_click') ?? 'Click a block to edit it'}</li>
              <li>{t('templates.help_bullet_drag') ?? 'Drag blocks to reorder'} <GripVertical className="inline h-3.5 w-3.5 align-text-bottom" /></li>
              <li>{t('templates.help_bullet_attachments') ?? 'Add up to 10 attachments to messages'}</li>
              <li>{t('templates.help_bullet_preview') ?? 'Click an attachment to preview it'}</li>
            </ul>
            <p>{t('templates.help_bot_note') ?? 'You can also do this via the bot in chat:'}</p>
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="font-mono text-xs">
                /template{' '}
                <span className="text-muted-foreground">{t('templates.help_cmd_arg')}</span>
              </p>
            </div>
          </div>
          <AlertDialogFooter>
            <AlertDialogAction className="gap-2">{t('templates.help_ok') ?? 'Got it'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.delete_confirm_title') ?? 'Delete this template?'}</AlertDialogTitle>
            <AlertDialogDescription>{t('templates.delete_confirm_description') ?? 'This action cannot be undone.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('templates.delete_cancel') ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => { deleteMutation.mutate(); }}
            >
              {t('templates.delete_confirm') ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <MessageBlockSheet
        block={editingBlock}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        onSave={handleBlockSave}
        onDelete={handleBlockDelete}
      />

      <AttachmentPreviewOverlay
        preview={previewState}
        onClose={() => setPreviewState(null)}
      />

    </div>
  );
}
