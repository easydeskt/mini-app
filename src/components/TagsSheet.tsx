import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import { Tag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { extractTagRgb, tagTextColor } from '@/components/ui/tag-badge';
import { useT } from '@/hooks/useT';
import { useTags } from '@/hooks/queries/useTags';
import type { Tag as TagType } from '@/types/tag';
import type { TicketTag } from '@/types/ticket';

type TagsSheetProps = {
  currentTags: TicketTag[];
  isPending: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (tagIds: number[]) => void;
};

type DragState = {
  fromSelected: boolean;
  tagId: number;
  x: number;
  y: number;
};

type TagPillProps = {
  color: number | null;
  isDimmed?: boolean;
  name: string;
  pillRef?: (el: HTMLDivElement | null) => void;
  onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => void;
};

function tagPillStyle(color: number | null): React.CSSProperties {
  if (color === null) return {};
  const [r, g, b] = extractTagRgb(color);
  return { backgroundColor: `rgba(${r}, ${g}, ${b}, 0.13)`, color: tagTextColor(r, g, b) };
}

function TagPill({ color, isDimmed, name, pillRef, onPointerDown }: TagPillProps) {
  return (
    <div
      ref={pillRef}
      className={`inline-flex cursor-grab select-none items-center rounded-full px-2.5 py-1 text-xs font-medium transition-opacity ${color === null ? 'bg-zinc-100 text-foreground dark:bg-zinc-800' : ''} ${isDimmed ? 'opacity-25' : ''}`}
      style={{ touchAction: 'none', ...tagPillStyle(color) }}
      onPointerDown={onPointerDown}
    >
      {name}
    </div>
  );
}

function GhostPill({ tag, x, y }: { tag: TagType; x: number; y: number }) {
  const hasColor = tag.color !== null;
  return createPortal(
    <div
      className={`pointer-events-none fixed z-[9999] inline-flex cursor-grabbing items-center rounded-full px-2.5 py-1 text-xs font-medium shadow-lg ${!hasColor ? 'bg-zinc-100 text-foreground dark:bg-zinc-800' : ''}`}
      style={{ left: x, top: y, transform: 'translate(-50%, -50%)', ...tagPillStyle(tag.color) }}
    >
      {tag.name}
    </div>,
    document.body,
  );
}

export function TagsSheet({ currentTags, isPending, open, onOpenChange, onSave }: TagsSheetProps) {
  const t = useT();
  const { data: allTags, isLoading } = useTags();
  const [selectedIds, setSelectedIds] = useState<number[]>(currentTags.map(t => t.id));
  const [drag, setDrag] = useState<{ tagId: number; fromSelected: boolean } | null>(null);
  const [dragPos, setDragPos] = useState<{ x: number; y: number } | null>(null);
  const [dropTarget, setDropTarget] = useState<'available' | 'selected' | null>(null);

  const availableRef = useRef<HTMLDivElement>(null);
  const selectedRef = useRef<HTMLDivElement>(null);
  const pillRefs = useRef<Map<number, HTMLDivElement>>(new Map());
  const dragRef = useRef<DragState | null>(null);

  useEffect(() => {
    if (open) setSelectedIds(currentTags.map(t => t.id));
  }, [open, currentTags]);

  const panelAt = useCallback((x: number, y: number): 'available' | 'selected' | null => {
    for (const [ref, name] of [
      [selectedRef, 'selected'],
      [availableRef, 'available'],
    ] as [React.RefObject<HTMLDivElement | null>, 'available' | 'selected'][]) {
      const el = ref.current;
      if (el) {
        const r = el.getBoundingClientRect();
        if (x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) return name;
      }
    }
    return null;
  }, []);

  // Insertion index among the selected pills, excluding the dragged one. Reads the
  // live DOM order (row-aware) so it stays correct as pills physically reorder.
  const calcInsertIndex = useCallback((x: number, y: number, draggingId: number): number => {
    const draggedEl = pillRefs.current.get(draggingId);
    const container = draggedEl?.parentElement;
    if (!container) return 0;
    const others = Array.from(container.children).filter(el => el !== draggedEl);
    for (let i = 0; i < others.length; i++) {
      const r = others[i].getBoundingClientRect();
      if (y < r.top) return i;
      if (y <= r.bottom && x < r.left + r.width / 2) return i;
    }
    return others.length;
  }, []);

  // Drag is tracked via window listeners rather than pointer capture: live reorder
  // relocates DOM nodes, which silently drops setPointerCapture and would otherwise
  // leave pointerup unhandled (the drag would hang).
  useEffect(() => {
    if (!drag) return;

    function onMove(e: PointerEvent) {
      const d = dragRef.current;
      if (!d) return;
      dragRef.current = { ...d, x: e.clientX, y: e.clientY };
      setDragPos({ x: e.clientX, y: e.clientY });

      const panel = panelAt(e.clientX, e.clientY);
      setDropTarget(panel);

      if (panel === 'selected' && d.fromSelected) {
        const idx = calcInsertIndex(e.clientX, e.clientY, d.tagId);
        setSelectedIds(prev => {
          const without = prev.filter(id => id !== d.tagId);
          if (without.length === prev.length) return prev;
          const next = [...without.slice(0, idx), d.tagId, ...without.slice(idx)];
          return next.some((id, i) => id !== prev[i]) ? next : prev;
        });
      }
    }

    function onEnd() {
      const d = dragRef.current;
      if (d) {
        const panel = panelAt(d.x, d.y);
        if (panel === 'selected' && !d.fromSelected) {
          setSelectedIds(prev => (prev.includes(d.tagId) ? prev : [...prev, d.tagId]));
        } else if (panel === 'available' && d.fromSelected) {
          setSelectedIds(prev => prev.filter(id => id !== d.tagId));
        }
        // selected + fromSelected: reorder already applied live in onMove
      }
      dragRef.current = null;
      setDrag(null);
      setDragPos(null);
      setDropTarget(null);
    }

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onEnd);
    window.addEventListener('pointercancel', onEnd);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onEnd);
      window.removeEventListener('pointercancel', onEnd);
    };
  }, [drag, panelAt, calcInsertIndex]);

  function startDrag(e: React.PointerEvent<HTMLDivElement>, tagId: number, fromSelected: boolean) {
    e.preventDefault();
    dragRef.current = { tagId, fromSelected, x: e.clientX, y: e.clientY };
    setDrag({ tagId, fromSelected });
    setDragPos({ x: e.clientX, y: e.clientY });
    setDropTarget(panelAt(e.clientX, e.clientY));
  }

  const selectedTags = selectedIds.map(id => allTags.find(t => t.id === id)).filter((t): t is TagType => !!t);
  const availableTags = allTags.filter(t => !selectedIds.includes(t.id));
  const dragTag = drag ? (allTags.find(t => t.id === drag.tagId) ?? null) : null;

  function pillCallbacks(tagId: number, fromSelected: boolean) {
    return {
      isDimmed: drag?.tagId === tagId,
      pillRef: (el: HTMLDivElement | null) => {
        if (el) pillRefs.current.set(tagId, el);
        else pillRefs.current.delete(tagId);
      },
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => startDrag(e, tagId, fromSelected),
    };
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Tag className="h-5 w-5 shrink-0" />
            {t('tags.sheet_title')}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-3 px-4 pb-4">
          {isLoading ? (
            <div className="rounded-lg border py-6 text-center text-sm text-muted-foreground">{t('tags.loading')}</div>
          ) : (
            <>
              <div>
                <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">{t('tags.section_selected')}</p>
                <div
                  ref={selectedRef}
                  className={`min-h-12 rounded-lg border p-3 transition-colors ${dropTarget === 'selected' ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  {selectedTags.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60">{t('tags.empty_selected')}</p>
                  ) : (
                    <div className="flex flex-wrap items-center gap-2">
                      {selectedTags.map(tag => (
                        <TagPill key={tag.id} name={tag.name} color={tag.color} {...pillCallbacks(tag.id, true)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <p className="mb-1.5 px-4 text-xs font-medium uppercase tracking-widest text-muted-foreground">{t('tags.section_available')}</p>
                <div
                  ref={availableRef}
                  className={`min-h-12 rounded-lg border p-3 transition-colors ${dropTarget === 'available' ? 'border-primary bg-primary/5' : 'border-border bg-muted/30'}`}
                >
                  {availableTags.length === 0 ? (
                    <p className="text-xs text-muted-foreground/60">{t('tags.empty_available')}</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {availableTags.map(tag => (
                        <TagPill key={tag.id} name={tag.name} color={tag.color} {...pillCallbacks(tag.id, false)} />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          <Button className="w-full" disabled={isPending || isLoading} onClick={() => onSave(selectedIds)}>
            {t('tags.save')}
          </Button>
        </div>
      </SheetContent>

      {drag && dragPos && dragTag && <GhostPill tag={dragTag} x={dragPos.x} y={dragPos.y} />}
    </Sheet>
  );
}
