import type { ApiConfigSchema, ApiField, ApiSection, FieldSchema, FieldType, SectionSchema } from '@/types/channel';

export function isRootSection(key: string): boolean {
  return !key || key === '__basic__' || key === '__extras__';
}

function mapFieldType(apiType: string): FieldType {
  switch (apiType) {
    case 'text.default': return 'text';
    case 'text.password': return 'password';
    case 'text.url': return 'url';
    case 'boolean': return 'switch';
    case 'selectable.enum':
    case 'selectable.literal': return 'radio';
    case 'number.long': return 'number-large';
    default: return 'number';
  }
}

function parseDefaultValue(type: FieldType, raw: string | null | undefined): unknown {
  if (raw == null) return undefined;
  if (type === 'switch') return raw === 'true';
  if (type === 'number' || type === 'number-large') {
    const n = Number(raw);
    return isNaN(n) ? undefined : n;
  }
  return raw;
}

function mapField(apiField: ApiField): FieldSchema {
  const type = mapFieldType(apiField.type);
  return {
    key: apiField.key,
    type,
    variants: apiField.variants,
    placeholder: apiField.placeholder ?? undefined,
    required: apiField.required,
    defaultValue: parseDefaultValue(type, apiField.default_value),
  };
}

function applyOrder(allKeys: string[], order: string[]): string[] {
  const inOrder = new Set(order);
  return [
    ...order.filter(k => allKeys.includes(k)),
    ...allKeys.filter(k => !inOrder.has(k)),
  ];
}

function mapSection(apiSection: ApiSection): SectionSchema {
  const orderedKeys = applyOrder(apiSection.fields.map(f => f.key), apiSection.order);
  const fieldMap = new Map(apiSection.fields.map(f => [f.key, f]));
  return {
    key: apiSection.key,
    fields: orderedKeys.map(k => mapField(fieldMap.get(k)!)),
  };
}

export function buildOrderedSections(apiSchema: ApiConfigSchema): SectionSchema[] {
  const rootSection = apiSchema.sections.find(s => s.key === '');
  const namedSections = apiSchema.sections.filter(s => s.key !== '');

  const rootFieldKeys = rootSection?.fields.map(f => f.key) ?? [];
  const rootFieldMap = new Map(rootSection?.fields.map(f => [f.key, f]) ?? []);
  const namedSectionKeys = namedSections.map(s => s.key);

  // Root field keys first, then named section keys (declaration order as fallback)
  const allTopLevelKeys = [...rootFieldKeys, ...namedSectionKeys];
  const ordered = applyOrder(allTopLevelKeys, apiSchema.order);

  const basicFields: FieldSchema[] = [];
  const extraFields: FieldSchema[] = [];
  const orderedNamedSections: SectionSchema[] = [];
  let firstSectionSeen = false;

  for (const key of ordered) {
    if (rootFieldMap.has(key)) {
      const field = mapField(rootFieldMap.get(key)!);
      if (!firstSectionSeen) {
        basicFields.push(field);
      } else {
        extraFields.push(field);
      }
    } else {
      firstSectionSeen = true;
      const apiSection = namedSections.find(s => s.key === key);
      if (apiSection) orderedNamedSections.push(mapSection(apiSection));
    }
  }

  const result: SectionSchema[] = [];
  if (basicFields.length > 0) result.push({ key: '__basic__', fields: basicFields });
  result.push(...orderedNamedSections);
  if (extraFields.length > 0) result.push({ key: '__extras__', fields: extraFields });
  return result;
}
