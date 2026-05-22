import { useCallback, useEffect, useState } from 'react';

import { Pencil, TagIcon, Trash2 } from 'lucide-react';

import {
  ColorPicker,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerPreview,
  ColorPickerSelection,
  type ColorPickerProps,
} from '@/components/kibo-ui/color-picker';
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
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useT } from '@/hooks/useT';
import type { Tag } from '@/types/tag';
import { rgbaArrayToInt, rgbaIntToHex } from '@/utils/color';

type ColorChangeHandler = NonNullable<ColorPickerProps['onChange']>;

type TagEditSheetProps = {
  tag: Tag | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TagEditSheet({ tag, open, onOpenChange }: TagEditSheetProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<number | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const t = useT();

  useEffect(() => {
    if (tag) {
      setName(tag.name);
      setColor(tag.color);
    }
  }, [tag]);

  const handleColorChange = useCallback<ColorChangeHandler>((rgba) => {
    const arr = rgba as number[];
    setColor(rgbaArrayToInt(arr[0], arr[1], arr[2], arr[3]));
  }, []);

  if (!tag) return null;

  const colorPickerDefault = color != null ? rgbaIntToHex(color) : undefined;

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
          <SheetHeader className="flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base">
              <Pencil className="h-5 w-5 shrink-0" />
              {t('tags.edit_sheet_title') ?? 'Edit tag'}
            </SheetTitle>

            <Button
              variant="outline"
              size="icon"
              className="shrink-0 rounded-full text-destructive hover:text-destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </SheetHeader>

          <div className="flex flex-col gap-4 px-4 pb-4">

            <InputGroup>
              <InputGroupInput
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={t('tags.edit_field_name') ?? 'Tag name'}
              />
              <InputGroupAddon>
                <TagIcon className="h-4 w-4" />
              </InputGroupAddon>
            </InputGroup>

            <div>
              <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
                {t('tags.edit_field_color') ?? 'Choose color'}
              </p>
              <ColorPicker key={tag.id} defaultValue={colorPickerDefault} onChange={handleColorChange}>
                <ColorPickerSelection className="h-36 rounded-lg" />
                <div className="flex flex-col gap-2">
                  <ColorPickerHue />
                </div>
                <div className="flex items-center gap-2">
                  <ColorPickerOutput />
                  <ColorPickerFormat className="flex-1" />
                  <ColorPickerPreview />
                </div>
              </ColorPicker>
            </div>

            <Button className="w-full" onClick={() => onOpenChange(false)}>
              {t('tags.edit_save') ?? 'Save'}
            </Button>

          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent size="sm">
          <AlertDialogHeader>
            <AlertDialogTitle>{t('tags.delete_confirm_title') ?? 'Delete this tag?'}</AlertDialogTitle>
            <AlertDialogDescription>{t('tags.delete_confirm_description') ?? 'This action cannot be undone.'}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('tags.delete_cancel') ?? 'Cancel'}</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => { setDeleteOpen(false); onOpenChange(false); }}
            >
              {t('tags.delete_confirm') ?? 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
