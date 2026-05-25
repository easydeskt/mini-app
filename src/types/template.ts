export type PhotoAttachment = {
  id: string;
  type: 'photo';
  url: string;
  name: string;
  width: number;
  height: number;
  size?: number;
};

export type VideoAttachment = {
  id: string;
  type: 'video';
  url: string;
  name: string;
  width: number;
  height: number;
  duration: number;
  thumbnail?: string;
  size?: number;
};

export type AudioAttachment = {
  id: string;
  type: 'audio';
  url: string;
  name: string;
  duration: number;
  performer?: string;
  title?: string;
};

export type VoiceAttachment = {
  id: string;
  type: 'voice';
  url: string;
  name: string;
  duration: number;
  sender?: string;
};

export type DocumentAttachment = {
  id: string;
  type: 'document';
  url: string;
  name: string;
  size?: number;
  mimeType?: string;
};

export type Attachment =
  | PhotoAttachment
  | VideoAttachment
  | AudioAttachment
  | VoiceAttachment
  | DocumentAttachment;

export type AttachmentType = Attachment['type'];

export type ApiAttachmentKind = 'AUDIO' | 'DOCUMENT' | 'PHOTO' | 'VIDEO' | 'VOICE';

export type TemplateAttachment = {
  attachment_id: number;
  attributes?: Record<string, unknown>;
  content_type: string;
  file_name: string;
  file_size: number;
  kind: ApiAttachmentKind;
  template_id: number;
};

export type ReplyTemplate = {
  attachments: TemplateAttachment[];
  content: string | null;
  id: number;
  name: string;
};

export type PendingUiAttachment = {
  _uiKind: 'pending';
  attributes: Record<string, unknown>;
  contentType: string;
  file: File;
  fileName: string;
  fileSize: number;
  hash: string;
  kind: ApiAttachmentKind;
  localId: string;
  objectUrl: string;
};

export type ServerUiAttachment = {
  _uiKind: 'server';
  attachmentId: number;
  attributes?: Record<string, unknown>;
  contentType: string;
  fileName: string;
  fileSize: number;
  kind: ApiAttachmentKind;
  templateId: number;
};

export type UiAttachment = PendingUiAttachment | ServerUiAttachment;
