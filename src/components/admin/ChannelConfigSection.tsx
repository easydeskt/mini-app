import { ChannelConfigField } from '@/components/admin/ChannelConfigField';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useChannelT } from '@/hooks/useChannelT';
import { cn } from '@/lib/utils';
import type { SectionSchema } from '@/types/channel';
import { isRootSection } from '@/utils/channelSchema';

type ChannelConfigSectionProps = {
  brand: string;
  config: Record<string, unknown>;
  onChange: (sectionKey: string, fieldKey: string, value: unknown) => void;
  section: SectionSchema;
};

export function ChannelConfigSection({ brand, config, onChange, section }: ChannelConfigSectionProps) {
  const { sectionTitle } = useChannelT(brand);

  function getValue(fieldKey: string): unknown {
    if (isRootSection(section.key)) return config[fieldKey];
    const s = config[section.key];
    if (!s || typeof s !== 'object') return undefined;
    return (s as Record<string, unknown>)[fieldKey];
  }

  const enabledField = section.fields.find(f => f.key === 'enabled' && f.type === 'switch');
  const otherFields = enabledField ? section.fields.filter(f => f !== enabledField) : section.fields;
  const enabledValue = enabledField ? Boolean(getValue('enabled')) : undefined;

  return (
    <Card className="gap-0 py-0">
      <CardHeader
        className={cn(
          'flex flex-row items-center justify-between gap-2 px-4 py-3',
          enabledField && 'cursor-pointer select-none',
        )}
        onClick={enabledField ? () => onChange(section.key, 'enabled', !enabledValue) : undefined}
      >
        <CardTitle className="text-sm font-semibold">{sectionTitle(section.key)}</CardTitle>
        {enabledField && (
          <Switch
            checked={enabledValue}
            onCheckedChange={v => onChange(section.key, 'enabled', v)}
            onClick={e => e.stopPropagation()}
          />
        )}
      </CardHeader>
      {otherFields.length > 0 && enabledValue !== false && (
        <>
          <div className="h-px bg-border" />
          <CardContent className="space-y-6 px-4 pb-4 pt-4">
            {otherFields.map(field => {
              const fieldId = section.key ? `${section.key}__${field.key}` : field.key;
              return (
                <ChannelConfigField
                  key={field.key}
                  brand={brand}
                  field={field}
                  fieldId={fieldId}
                  sectionKey={section.key}
                  value={getValue(field.key)}
                  onChange={value => onChange(section.key, field.key, value)}
                />
              );
            })}
          </CardContent>
        </>
      )}
    </Card>
  );
}
