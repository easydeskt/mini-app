import { useCallback, useState } from 'react';

import { Plus, TagIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import {
  ColorPicker,
  ColorPickerFormat,
  ColorPickerHue,
  ColorPickerOutput,
  ColorPickerPreview,
  ColorPickerSelection,
  type ColorPickerProps,
} from '@/components/kibo-ui/color-picker';
import { Button } from '@/components/ui/button';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from '@/components/ui/input-group';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ApiError } from '@/api/client';
import { queryKeys } from '@/api/query-keys';
import { createTag } from '@/api/tags';
import { useT } from '@/hooks/useT';
import { rgbaArrayToInt, rgbaIntToHex } from '@/utils/color';

const DEFAULT_COLOR: number = rgbaArrayToInt(255, 0, 0, 1);

type ColorChangeHandler = NonNullable<ColorPickerProps['onChange']>;

type TagCreateSheetProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TagCreateSheet({ open, onOpenChange }: TagCreateSheetProps) {
  const [name, setName] = useState('');
  const [color, setColor] = useState<number>(DEFAULT_COLOR);
  const t = useT();

  const queryClient = useQueryClient();
  const createMutation = useMutation({
    mutationFn: () => createTag(name.trim(), color),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.tags.all });
      setName('');
      setColor(DEFAULT_COLOR);
      onOpenChange(false);
    },
    onError: (error) => {
      if (error instanceof ApiError && error.status === 409) {
        toast.error(t('tags.name_conflict') ?? 'A tag with this name already exists');
      } else {
        toast.error(t('tags.create_error') ?? 'Failed to create tag');
      }
    },
  });

  const handleColorChange = useCallback<ColorChangeHandler>((rgba) => {
    const arr = rgba as number[];
    setColor(rgbaArrayToInt(arr[0], arr[1], arr[2], arr[3]));
  }, []);

  function handleCreate() {
    createMutation.mutate();
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl gap-1" showCloseButton={false}>
        <SheetHeader className="flex-row items-center justify-between">
          <SheetTitle className="flex items-center gap-2 text-base">
            <Plus className="h-5 w-5 shrink-0" />
            {t('tags.create_sheet_title') ?? 'Create tag'}
          </SheetTitle>
        </SheetHeader>

        <div className="flex flex-col gap-4 px-4 pb-4">

          <InputGroup>
            <InputGroupInput
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={t('tags.create_field_name') ?? 'Name'}
            />
            <InputGroupAddon>
              <TagIcon className="h-4 w-4" />
            </InputGroupAddon>
          </InputGroup>

          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-widest text-muted-foreground">
              {t('tags.create_field_color') ?? 'Choose color'}
            </p>
            <ColorPicker defaultValue={rgbaIntToHex(color)} onChange={handleColorChange}>
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

          <Button className="w-full" onClick={handleCreate} disabled={name.trim() === '' || createMutation.isPending}>
            {t('tags.create_submit') ?? 'Create'}
          </Button>

        </div>
      </SheetContent>
    </Sheet>
  );
}
