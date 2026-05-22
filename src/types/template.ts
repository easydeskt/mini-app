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

export type MessageBlock = {
  id: string;
  text: string;
  attachments: Attachment[];
};

export type ReplyTemplate = {
  id: number;
  name: string;
  blocks: MessageBlock[];
};
