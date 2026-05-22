// Raw API types (from backend JSON)

export type ApiFieldType =
  | 'boolean'
  | 'number.byte' | 'number.double' | 'number.float'
  | 'number.int' | 'number.long' | 'number.short'
  | 'selectable.enum' | 'selectable.literal'
  | 'text.default' | 'text.password' | 'text.url';

export type ApiField = {
  key: string;
  type: ApiFieldType;
  variants?: string[];
  default_value?: string | null;
  placeholder?: string | null;
  required: boolean;
};

export type ApiSection = {
  key: string;
  fields: ApiField[];
  order: string[];
};

export type ApiConfigSchema = {
  sections: ApiSection[];
  order: string[];
};

export type ApiChannelProvider = {
  brand: string;
  name: string;
  config: ApiConfigSchema;
};

// Processed UI types

// '' | '__basic__' | '__extras__' = root/virtual sections stored flat in config
export type FieldType = 'text' | 'password' | 'number' | 'number-large' | 'url' | 'switch' | 'radio';

export type FieldSchema = {
  key: string;
  type: FieldType;
  variants?: string[];
  placeholder?: string;
  required: boolean;
  defaultValue?: unknown;
};

export type SectionSchema = {
  key: string;
  fields: FieldSchema[];
};

export type ChannelProviderInfo = {
  brand: string;
  name: string;
  configSchema: SectionSchema[];
};

export type Channel = {
  id: number;
  brand: string;
  displayName: string;
  isEnabled: boolean;
  config: Record<string, unknown>;
  createdAt: string;
};
