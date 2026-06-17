import { useState } from 'react';

import { Eye, EyeOff, KeyRound } from 'lucide-react';

import { VaultPickerSheet } from '@/components/admin/VaultPickerSheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useChannelT } from '@/hooks/useChannelT';
import type { FieldSchema } from '@/types/channel';

const SECRET_REF_PATTERN = /^\$([A-Z][A-Z0-9_]*)$/;

function parseSecretRef(val: unknown): string | null {
  if (typeof val !== 'string') return null;
  return val.match(SECRET_REF_PATTERN)?.[1] ?? null;
}

type ChannelConfigFieldProps = {
  brand: string;
  field: FieldSchema;
  fieldId: string;
  sectionKey: string;
  value: unknown;
  onChange: (value: unknown) => void;
};

export function ChannelConfigField({ brand, field, fieldId, sectionKey, value, onChange }: ChannelConfigFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { fieldLabel, fieldPlaceholder, fieldDescription } = useChannelT(brand);

  const label = fieldLabel(sectionKey, field.key);
  const description = fieldDescription(sectionKey, field.key);
  const placeholder = fieldPlaceholder(sectionKey, field.key) ?? field.placeholder;

  if (field.type === 'switch') {
    return (
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <p className="text-sm font-medium leading-none">{label}</p>
          {description && (
            <p className="whitespace-pre-line text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Switch checked={Boolean(value)} onCheckedChange={onChange} className="mt-0.5 shrink-0" />
      </div>
    );
  }

  if (field.type === 'radio') {
    return (
      <div className="space-y-2">
        <Label>{label}</Label>
        {description && (
          <p className="whitespace-pre-line text-xs text-muted-foreground">{description}</p>
        )}
        <RadioGroup value={String(value ?? '')} onValueChange={onChange} className="gap-2">
          {field.variants?.map(variant => (
            <label
              key={variant}
              htmlFor={`${fieldId}-${variant}`}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50 has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
            >
              <RadioGroupItem id={`${fieldId}-${variant}`} value={variant} className="mt-0.5" />
              <p className="text-sm font-medium leading-none">{variant}</p>
            </label>
          ))}
        </RadioGroup>
      </div>
    );
  }

  if (field.type === 'password') {
    const secretName = parseSecretRef(value);
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>
          {label}{field.required && <span className="text-destructive">*</span>}
        </Label>
        {description && (
          <p className="-mt-1 whitespace-pre-line text-xs text-muted-foreground">{description}</p>
        )}
        <div className="flex">
          {secretName ? (
            <div className="flex h-9 flex-1 items-center rounded-l-md border border-input bg-muted px-3 text-sm">
              <KeyRound className="mr-2 h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="truncate font-mono text-primary">{secretName}</span>
            </div>
          ) : (
            <div className="relative flex-1">
              <Input
                id={fieldId}
                type={showPassword ? 'text' : 'password'}
                value={String(value ?? '')}
                placeholder={placeholder}
                onChange={e => onChange(e.target.value)}
                required={field.required}
                className="rounded-r-none pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full w-10 px-3 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword(prev => !prev)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          )}
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={`h-9 w-10 shrink-0 rounded-l-none border-l-0 ${secretName ? 'text-primary hover:text-primary' : 'text-muted-foreground'}`}
            onClick={() => secretName ? onChange('') : setPickerOpen(true)}
            tabIndex={-1}
          >
            <KeyRound className="h-4 w-4" />
          </Button>
        </div>
        <VaultPickerSheet
          open={pickerOpen}
          onOpenChange={setPickerOpen}
          onSelect={name => onChange(`$${name}`)}
        />
      </div>
    );
  }

  if (field.type === 'number') {
    return (
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0 space-y-0.5">
          <Label htmlFor={fieldId}>
            {label}
            {field.required && <span className="text-destructive">*</span>}
          </Label>
          {description && (
            <p className="whitespace-pre-line text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        <Input
          id={fieldId}
          type="number"
          value={String(value ?? '')}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          required={field.required}
          className="w-24 shrink-0 text-right"
        />
      </div>
    );
  }

  if (field.type === 'number-large') {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>
          {label}
          {field.required && <span className="text-destructive">*</span>}
        </Label>
        {description && (
          <p className="-mt-1 whitespace-pre-line text-xs text-muted-foreground">{description}</p>
        )}
        <Input
          id={fieldId}
          type="number"
          value={String(value ?? '')}
          placeholder={placeholder}
          onChange={e => onChange(e.target.value === '' ? '' : Number(e.target.value))}
          required={field.required}
        />
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={fieldId}>
        {label}
        {field.required && <span className="text-destructive">*</span>}
      </Label>
      {description && (
        <p className="-mt-1 whitespace-pre-line text-xs text-muted-foreground">{description}</p>
      )}
      <Input
        id={fieldId}
        type={field.type === 'url' ? 'url' : 'text'}
        value={String(value ?? '')}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        required={field.required}
      />
    </div>
  );
}
