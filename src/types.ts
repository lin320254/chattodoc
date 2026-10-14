export interface WhatsAppMessage {
  id: string;
  raw: string;
  sender?: string;
  timestamp?: string;
  date?: string;
  time?: string;
  content: string;
  isSystemMessage: boolean;
  isMediaOmitted: boolean;
  lineNumber: number;
}

export type OutputMode = 'text_only' | 'sender_and_text' | 'formatted_chat';

export interface CleanOptions {
  outputMode: OutputMode;
  selectedSender: string; // 'all' or specific sender name
  removeSystemMessages: boolean;
  removeMediaNotices: boolean;
  removeEmptyLines: boolean;
  mergeConsecutiveSender: boolean;
  trimWhitespace: boolean;
}

export interface DocxOptions {
  docTitle: string;
  includeTitleInDoc: boolean;
  fontFamily: string;
  fontSizePt: number;
  lineSpacing: number; // 1.15, 1.5, 2.0
  addMessageDivider: boolean;
  authorName?: string;
}

export interface ParseResult {
  messages: WhatsAppMessage[];
  senders: string[];
  totalRawLines: number;
  timestampsRemovedCount: number;
  systemMessagesCount: number;
}
