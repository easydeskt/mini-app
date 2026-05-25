import React, { useEffect, useRef, useState } from 'react';

import { marked } from 'marked';
import { ArrowLeft, Download, FileText } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { useT } from '@/hooks/useT';
import type { DocumentAttachment, PhotoAttachment, VideoAttachment } from '@/types/template';

export type PreviewableAttachment = PhotoAttachment | VideoAttachment | DocumentAttachment;

export type PreviewState =
  | { type: 'media'; attachments: (PhotoAttachment | VideoAttachment)[]; initialIndex: number }
  | { type: 'document'; attachment: DocumentAttachment };

type AttachmentPreviewOverlayProps = {
  preview: PreviewState | null;
  onClose: () => void;
};

function MediaCarousel({
  attachments,
  initialIndex,
  onClose,
}: {
  attachments: (PhotoAttachment | VideoAttachment)[];
  initialIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [slideDir, setSlideDir] = useState<1 | -1>(1);
  const total = attachments.length;
  const current = attachments[index];

  const touchStartX = useRef<number | null>(null);
  const swipedRef = useRef(false);
  const thumbRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const stateRef = useRef({ index, total, onClose });
  stateRef.current = { index, total, onClose };

  function navigate(newIndex: number) {
    if (newIndex === index || newIndex < 0 || newIndex >= total) return;
    setSlideDir(newIndex > index ? 1 : -1);
    setPrevIndex(index);
    setIndex(newIndex);
  }

  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const { index, onClose } = stateRef.current;
      if (e.key === 'ArrowLeft') navigateRef.current(index - 1);
      else if (e.key === 'ArrowRight') navigateRef.current(index + 1);
      else if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    thumbRefs.current[index]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [index]);

  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) {
      navigate(dx < 0 ? index + 1 : index - 1);
      swipedRef.current = true;
    }
    touchStartX.current = null;
  }

  function handleRootClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (swipedRef.current) { swipedRef.current = false; return; }
    onClose();
  }

  function handleMediaClick(e: React.MouseEvent) {
    e.stopPropagation();
    if (swipedRef.current) { swipedRef.current = false; return; }
    const ratio = e.clientX / window.innerWidth;
    if (total > 1 && ratio < 0.15) navigate(index - 1);
    else if (total > 1 && ratio > 0.85) navigate(index + 1);
    // center — no action
  }

  const enterAnim = slideDir === 1 ? 'ed-slide-from-right' : 'ed-slide-from-left';
  const exitAnim = slideDir === 1 ? 'ed-slide-to-left' : 'ed-slide-to-right';

  const exitSlide = prevIndex !== null ? (() => {
    const prev = attachments[prevIndex];
    return (
      <div
        key={`exit-${prevIndex}`}
        className="absolute inset-0 flex items-center justify-center"
        style={{ animation: `${exitAnim} 220ms ease forwards` }}
      >
        {prev.type === 'photo' ? (
          <img src={prev.url} alt={prev.name} className="max-h-full max-w-full object-contain" />
        ) : (
          <video src={prev.url} poster={prev.thumbnail} className="max-h-full max-w-full object-contain" muted />
        )}
      </div>
    );
  })() : null;

  return (
    <div
      className="fixed inset-0 z-[60] flex flex-col bg-black/90"
      onPointerDown={e => e.stopPropagation()}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleRootClick}
    >
      <style>{`
        @keyframes ed-slide-from-right { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes ed-slide-from-left { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        @keyframes ed-slide-to-left { from { transform: translateX(0); } to { transform: translateX(-100%); } }
        @keyframes ed-slide-to-right { from { transform: translateX(0); } to { transform: translateX(100%); } }
      `}</style>
      <div className="relative flex-1 overflow-hidden">
        {exitSlide}
        <div
          key={index}
          className="absolute inset-0 flex items-center justify-center"
          style={prevIndex !== null ? { animation: `${enterAnim} 220ms ease forwards` } : undefined}
          onAnimationEnd={() => setPrevIndex(null)}
        >
          {current.type === 'photo' ? (
            <img
              key={current.id}
              src={current.url}
              alt={current.name}
              className="max-h-full max-w-full object-contain"
              onClick={handleMediaClick}
            />
          ) : (
            <video
              key={current.id}
              src={current.url}
              poster={current.thumbnail}
              className="max-h-full max-w-full object-contain"
              controls
              autoPlay
              onClick={handleMediaClick}
            />
          )}
        </div>
      </div>
      {total > 1 && (
        <div className="h-16 shrink-0 overflow-x-auto py-2">
          <div className="mx-auto flex h-full w-max items-center gap-1 px-2">
          {attachments.map((a, i) => (
            <button
              key={a.id}
              ref={el => { thumbRefs.current[i] = el; }}
              type="button"
              onClick={e => { e.stopPropagation(); navigate(i); }}
              className="relative h-full shrink-0 overflow-hidden rounded"
              style={{ aspectRatio: `${a.width} / ${a.height}` }}
            >
              {a.type === 'photo' ? (
                <img src={a.url} alt="" className="h-full w-full object-cover" />
              ) : a.thumbnail ? (
                <img src={a.thumbnail} alt="" className="h-full w-full object-cover" />
              ) : (
                <video src={a.url} className="h-full w-full object-cover" muted />
              )}
              {i !== index && <div className="absolute inset-0 bg-black/60" />}
            </button>
          ))}
          </div>
        </div>
      )}
    </div>
  );
}

const MD_STYLES = `
  .ed-md > *:first-child { margin-top: 0; }
  .ed-md h1,.ed-md h2,.ed-md h3,.ed-md h4 { font-weight: 600; margin: 1em 0 0.4em; line-height: 1.3; }
  .ed-md h1 { font-size: 1.375rem; }
  .ed-md h2 { font-size: 1.125rem; }
  .ed-md h3 { font-size: 1rem; }
  .ed-md p { margin: 0.5em 0; }
  .ed-md ul { list-style-type: disc; padding-left: 1.5em; margin: 0.5em 0; }
  .ed-md ol { list-style-type: decimal; padding-left: 1.5em; margin: 0.5em 0; }
  .ed-md li { margin: 0.2em 0; }
  .ed-md code { background: var(--muted); padding: 0.1em 0.35em; border-radius: 0.3em; font-family: monospace; font-size: 0.875em; }
  .ed-md pre { background: var(--muted); padding: 0.875em 1em; border-radius: 0.5em; overflow-x: auto; margin: 0.75em 0; }
  .ed-md pre code { background: none; padding: 0; }
  .ed-md blockquote { border-left: 3px solid var(--border); padding-left: 1em; opacity: 0.65; margin: 0.5em 0; }
  .ed-md a { color: var(--primary); text-decoration: underline; }
  .ed-md hr { border: 0; border-top: 1px solid var(--border); margin: 1em 0; }
  .ed-md table { border-collapse: collapse; width: 100%; margin: 0.5em 0; }
  .ed-md th,.ed-md td { border: 1px solid var(--border); padding: 0.35em 0.6em; text-align: left; }
  .ed-md th { background: var(--muted); font-weight: 600; }
`;

function DocumentPreview({ attachment, onClose }: { attachment: DocumentAttachment; onClose: () => void }) {
  const [markdownHtml, setMarkdownHtml] = useState<string | null>(null);
  const [markdownError, setMarkdownError] = useState(false);
  const t = useT();

  const mime = attachment.mimeType ?? '';
  const isImage = mime.startsWith('image/');
  const isVideo = mime.startsWith('video/');
  const isPdf = mime === 'application/pdf';
  const isMarkdown = mime === 'text/markdown' || mime === 'text/x-markdown' ||
    attachment.name.toLowerCase().endsWith('.md') || attachment.name.toLowerCase().endsWith('.markdown');

  useEffect(() => {
    if (!isMarkdown) return;
    let cancelled = false;
    fetch(attachment.url)
      .then(r => r.text())
      .then(text => {
        if (!cancelled) setMarkdownHtml(marked.parse(text) as string);
      })
      .catch(() => { if (!cancelled) setMarkdownError(true); });
    return () => { cancelled = true; };
  }, [attachment.url, isMarkdown]);

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-background" onPointerDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
      <div className="z-10 flex shrink-0 items-center gap-2 border-b bg-background/80 px-4 py-3 backdrop-blur-md">
        <Button variant="outline" size="icon" className="shrink-0 rounded-full" onClick={onClose}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="flex-1 truncate text-center text-base font-semibold">{attachment.name}</h1>
        <Button variant="outline" size="icon" className="shrink-0 rounded-full" asChild>
          <a href={attachment.url} download={attachment.name}>
            <Download className="h-4 w-4" />
          </a>
        </Button>
      </div>

      {isImage ? (
        <div className="flex flex-1 items-center justify-center bg-black">
          <img src={attachment.url} alt={attachment.name} className="max-h-full max-w-full object-contain" />
        </div>
      ) : isVideo ? (
        <div className="flex flex-1 items-center justify-center bg-black">
          <video src={attachment.url} className="max-h-full max-w-full object-contain" controls autoPlay />
        </div>
      ) : isPdf ? (
        <iframe src={attachment.url} className="flex-1 w-full border-0" title={attachment.name} />
      ) : isMarkdown ? (
        <>
          <style>{MD_STYLES}</style>
          <div className="flex-1 overflow-auto p-4 text-sm">
            {markdownError ? (
              <p className="text-muted-foreground">{t('attachments.preview_error') ?? 'Failed to load file'}</p>
            ) : markdownHtml !== null ? (
              <div className="ed-md" dangerouslySetInnerHTML={{ __html: markdownHtml }} />
            ) : (
              <p className="text-muted-foreground">{t('attachments.preview_loading') ?? 'Loading…'}</p>
            )}
          </div>
        </>
      ) : (
        <Empty className="border-0">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <FileText />
            </EmptyMedia>
            <EmptyTitle>{t('attachments.preview_unsupported_title') ?? 'Preview unavailable'}</EmptyTitle>
            <EmptyDescription>{t('attachments.preview_unsupported_description') ?? 'File format not supported. Download and open it on your device.'}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button asChild>
              <a href={attachment.url} download={attachment.name}>
                <Download className="h-4 w-4" />
                {t('attachments.preview_download') ?? 'Download file'}
              </a>
            </Button>
          </EmptyContent>
        </Empty>
      )}
    </div>
  );
}

export function AttachmentPreviewOverlay({ preview, onClose }: AttachmentPreviewOverlayProps) {
  if (!preview) return null;

  if (preview.type === 'media') {
    return (
      <MediaCarousel
        attachments={preview.attachments}
        initialIndex={preview.initialIndex}
        onClose={onClose}
      />
    );
  }

  return <DocumentPreview attachment={preview.attachment} onClose={onClose} />;
}
