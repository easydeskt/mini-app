import { useEffect, useRef, useState } from 'react';

import { GripVertical, LifeBuoy, MessageCircleMore, MoreVertical, Paperclip, Trash2 } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { ApiError } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import {
  createTemplate,
  deleteTemplate,
  fetchTemplateAttachmentBlobUrl,
  getTemplateAttachmentContentUrl,
  reorderTemplateAttachments,
  updateTemplate,
  uploadTemplateAttachment,
} from '@/api/templates';
import { AttachmentPreviewOverlay, type PreviewState } from '@/components/admin/AttachmentPreviewOverlay';
import { MediaGrid } from '@/components/admin/MediaGrid';
import { TemplateAttachmentsDialog } from '@/components/admin/TemplateAttachmentsDialog';
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
import { Textarea } from '@/components/ui/textarea';
import { useTemplate } from '@/hooks/queries/useTemplates';
import { useBackButton } from '@/hooks/useBackButton';
import { useT } from '@/hooks/useT';
import type {
  Attachment,
  DocumentAttachment,
  PendingUiAttachment,
  PhotoAttachment,
  ServerUiAttachment,
  UiAttachment,
  VideoAttachment,
} from '@/types/template';

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

type BubbleContentProps = {
  content: string;
  attachments: UiAttachment[];
  onPreview: (a: PhotoAttachment | VideoAttachment | DocumentAttachment) => void;
};

function BubbleContent({ content, attachments, onPreview }: BubbleContentProps) {
  const displayAttachments = attachments.map(toDisplayAttachment);
  const visualMedia = displayAttachments.filter(a => a.type === 'photo' || a.type === 'video');
  const nonMedia = displayAttachments.filter(a => a.type !== 'photo' && a.type !== 'video');
  const hasVisualMedia = visualMedia.length > 0;

  return (
    <div className={`${hasVisualMedia ? 'w-[90%]' : 'w-fit max-w-[90%]'} overflow-hidden rounded-2xl rounded-tr-sm bg-secondary text-secondary-foreground`}>
      {hasVisualMedia && <MediaGrid attachments={visualMedia} onPreview={onPreview} />}
      {!hasVisualMedia && nonMedia.length > 0 && <MediaGrid attachments={nonMedia} onPreview={onPreview} />}
      {content.trim() && (
        <p className="whitespace-pre-wrap px-3 py-2 text-sm">{content}</p>
      )}
      {hasVisualMedia && nonMedia.length > 0 && <MediaGrid attachments={nonMedia} onPreview={onPreview} />}
    </div>
  );
}

export function TemplateEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const t = useT();
  const queryClient = useQueryClient();
  const isNew = id === 'new';
  const { data: template } = useTemplate(isNew ? -1 : +(id ?? -1));

  const [name, setName] = useState('');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<UiAttachment[]>([]);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [previewState, setPreviewState] = useState<PreviewState | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const initializedTemplateId = useRef<number | null>(null);

  useBackButton();

  useEffect(() => {
    if (template && initializedTemplateId.current !== template.id) {
      initializedTemplateId.current = template.id;
      setName(template.name);
      setContent(template.content ?? '');
      setAttachments(
        template.attachments.map(a => ({
          _uiKind: 'server' as const,
          attachmentId: a.attachment_id,
          attributes: a.attributes ?? {},
          contentType: a.content_type,
          fileName: a.file_name,
          fileSize: a.file_size,
          kind: a.kind,
          templateId: a.template_id,
        } satisfies ServerUiAttachment)),
      );
    }
  }, [template]);

  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [content]);

  async function handleAttachmentPreview(display: PhotoAttachment | VideoAttachment | DocumentAttachment) {
    const uiA = attachments.find(a => uiAttachmentId(a) === display.id);
    if (!uiA) return;

    const kind = uiA.kind;
    if (kind !== 'PHOTO' && kind !== 'VIDEO' && kind !== 'DOCUMENT') return;

    let url: string;
    if (uiA._uiKind === 'pending') {
      url = uiA.objectUrl;
    } else {
      try {
        url = await fetchTemplateAttachmentBlobUrl(uiA.templateId, uiA.attachmentId);
      } catch {
        toast.error(t('attachments.load_error') ?? 'Failed to load');
        return;
      }
    }

    if (kind === 'PHOTO') {
      const photo: PhotoAttachment = { id: display.id, type: 'photo', url, name: uiA.fileName, width: 1, height: 1, size: uiA.fileSize };
      setPreviewState({ type: 'media', attachments: [photo], initialIndex: 0 });
    } else if (kind === 'VIDEO') {
      const video: VideoAttachment = { id: display.id, type: 'video', url, name: uiA.fileName, width: 1, height: 1, duration: 0, size: uiA.fileSize };
      setPreviewState({ type: 'media', attachments: [video], initialIndex: 0 });
    } else {
      const doc: DocumentAttachment = { id: display.id, type: 'document', url, name: uiA.fileName, size: uiA.fileSize, mimeType: uiA.contentType };
      setPreviewState({ type: 'document', attachment: doc });
    }
  }

  async function handleSave() {
    if (!name.trim()) return;
    setIsSaving(true);
    try {
      if (isNew) {
        const result = await createTemplate(name.trim(), content.trim() || null);
        const newId = result.id;

        const pending = attachments.filter((a): a is PendingUiAttachment => a._uiKind === 'pending');
        const uploadedIds: number[] = [];
        for (const a of pending) {
          const uploaded = await uploadTemplateAttachment(newId, a.kind, a.file);
          uploadedIds.push(uploaded.attachment_id);
          URL.revokeObjectURL(a.objectUrl);
        }
        if (uploadedIds.length > 1) {
          await reorderTemplateAttachments(newId, uploadedIds);
        }

        await queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
      } else {
        const templateId = +(id ?? 0);
        await updateTemplate(templateId, name.trim(), content.trim() || null);
        await queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
        await queryClient.invalidateQueries({ queryKey: queryKeys.templates.detail(templateId) });
      }
      void navigate('/admin/templates');
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        toast.error(t('templates.name_conflict') ?? 'A template with this name already exists');
      } else {
        toast.error(t('templates.save_error') ?? 'Failed to save template');
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete() {
    setIsDeleting(true);
    try {
      await deleteTemplate(+(id ?? 0));
      await queryClient.invalidateQueries({ queryKey: queryKeys.templates.all });
      void navigate('/admin/templates');
    } catch {
      toast.error(t('templates.delete_error') ?? 'Failed to delete template');
    } finally {
      setIsDeleting(false);
      setDeleteOpen(false);
    }
  }

  const hasContent = content.trim().length > 0 || attachments.length > 0;
  const attachmentCount = attachments.length;
  const changeAttachmentsLabel = attachmentCount > 0
    ? `${t('templates.edit_change_attachments') ?? 'Change attachments'} (${attachmentCount})`
    : (t('templates.edit_change_attachments') ?? 'Change attachments');

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

      <div className="flex flex-1 flex-col">
        {!hasContent ? (
          <Empty className="border-0">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleMore />
              </EmptyMedia>
              <EmptyTitle>{t('templates.edit_empty_title') ?? 'Nothing here yet'}</EmptyTitle>
              <EmptyDescription>{t('templates.edit_empty_description') ?? 'Add text or attachments below.'}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="mx-auto mt-auto w-full max-w-[480px] flex flex-col gap-3 px-4 py-4">
            <div className="flex justify-end">
              <BubbleContent
                content={content}
                attachments={attachments}
                onPreview={a => { void handleAttachmentPreview(a); }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="sticky bottom-0 z-10 border-t bg-background/80 backdrop-blur-md">
        <div className="mx-auto max-w-[480px] flex flex-col gap-3 px-4 pb-6 pt-3">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            placeholder={t('templates.edit_text_placeholder') ?? 'Message text…'}
            className="min-h-10 resize-none overflow-hidden"
            style={{ height: 'auto' }}
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => setAttachmentsOpen(true)}
          >
            <Paperclip className="h-4 w-4" />
            {changeAttachmentsLabel}
          </Button>
          <Separator />
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
          <Button
            className="w-full"
            onClick={() => { void handleSave(); }}
            disabled={!name.trim() || isSaving}
          >
            {t('templates.edit_save') ?? 'Save'}
          </Button>
        </div>
      </div>

      <TemplateAttachmentsDialog
        open={attachmentsOpen}
        onClose={() => setAttachmentsOpen(false)}
        templateId={isNew ? null : +(id ?? 0)}
        attachments={attachments}
        onAttachmentsChange={setAttachments}
      />

      <AttachmentPreviewOverlay
        preview={previewState}
        onClose={() => setPreviewState(null)}
      />

      <AlertDialog open={helpOpen} onOpenChange={setHelpOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('templates.help_title') ?? 'How does it work?'}</AlertDialogTitle>
          </AlertDialogHeader>
          <div className="flex flex-col gap-4 text-sm text-muted-foreground">
            <p>{t('templates.help_intro') ?? 'Build a quick reply template:'}</p>
            <ul className="list-disc space-y-0.5 pl-4">
              <li>{t('templates.help_bullet_text') ?? 'Message text is optional'}</li>
              <li>{t('templates.help_bullet_attachments') ?? 'Add up to 10 attachments'}</li>
              <li>{t('templates.help_bullet_drag') ?? 'Drag attachments to reorder'} <GripVertical className="inline h-3.5 w-3.5 align-text-bottom" /></li>
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
            <AlertDialogAction>{t('templates.help_ok') ?? 'Got it'}</AlertDialogAction>
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
              disabled={isDeleting}
              onClick={() => { void handleDelete(); }}
            >
              {t('templates.delete_confirm') ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}
