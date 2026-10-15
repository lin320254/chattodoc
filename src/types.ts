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

export type OutputMode = 'fatwa_a4' | 'text_only' | 'sender_and_text' | 'formatted_chat';

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
  // Fatwa-specific A4 layout options
  fatwaHeaderTemplate?: string;
  itemsPerPage?: number;
  senderLabelPrefix?: string;
  senderAtBottom?: boolean;
  zeroGapSender?: boolean;
  showPageBorders?: boolean;
  // Dynamic page numbering & counts based on 3-items-per-page constraint
  enablePageNumbering?: boolean;
  pageNumberFormat?: 'page_of_total' | 'simple_dash';
  resetItemCountPerPage?: boolean; // default: true (counts reset to 1..3 on each page based on 3-items constraint)
  includeItemNumberInHeader?: boolean; // default: true (auto inserts dynamic 1..3 into header)
  resetPageNumberPerSection?: boolean; // default: false (continuous page numbers in docx)
}

export interface ParseResult {
  messages: WhatsAppMessage[];
  senders: string[];
  totalRawLines: number;
  timestampsRemovedCount: number;
  systemMessagesCount: number;
}
