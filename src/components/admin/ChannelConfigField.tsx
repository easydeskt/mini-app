import { useState } from 'react';

import { Eye, EyeOff } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { useChannelT } from '@/hooks/useChannelT';
import type { FieldSchema } from '@/types/channel';

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
    return (
      <div className="space-y-1.5">
        <Label htmlFor={fieldId}>
          {label}{field.required && <span className="text-destructive">*</span>}
        </Label>
        {description && (
          <p className="-mt-1 whitespace-pre-line text-xs text-muted-foreground">{description}</p>
        )}
        <div className="relative">
          <Input
            id={fieldId}
            type={showPassword ? 'text' : 'password'}
            value={String(value ?? '')}
            placeholder={placeholder}
            onChange={e => onChange(e.target.value)}
            required={field.required}
            className="pr-10"
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
