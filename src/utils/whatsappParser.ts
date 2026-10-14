import { WhatsAppMessage, ParseResult, CleanOptions, DocxOptions } from '../types';

/**
 * Common WhatsApp timestamp regex patterns:
 * 1. Bracketed date & time: [DD/MM/YYYY, HH:mm:ss AM/PM] Sender: Message
 *    e.g. [19/09/2026, 10:15:30 AM] John: Hello
 *    e.g. [19/09/26, 10:15:30] John: Hello
 *    e.g. [10:15 AM, 19/09/2026] John: Hello
 *    e.g. [10:15 AM] John: Hello
 * 2. Hyphen format: DD/MM/YYYY, HH:mm - Sender: Message
 *    e.g. 19/09/2026, 10:15 am - John: Hello
 *    e.g. 19/09/26, 10:15 - John: Hello
 *    e.g. 9/19/26, 10:15 AM - John: Hello
 *    e.g. 2026-09-19, 10:15 - John: Hello
 *    e.g. 10:15 AM, 19/09/2026 - John: Hello
 * 3. Desktop/Web variant:
 *    John, [19.09.2026 10:15]: Hello
 *    John [10:15 AM]: Hello
 */

// Regex 1: [Date, Time] Sender: Message OR [Time, Date] Sender: Message
const BRACKET_PATTERN = /^\[(?:\u200E|\u200F)?(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4}|\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)[, ]\s*(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4}|\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]\s*(?:~)?([^:]+?):\s*([\s\S]*)$/;

// Regex 2: Standard Android/Export: "19/09/2026, 10:15 am - Sender: Message" or "19/09/2026, 10:15 - Sender: Message"
const HYPHEN_PATTERN = /^(?:\u200E|\u200F)?(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\s*[-–—]\s*(?:~)?([^:]+?):\s*([\s\S]*)$/;

// Regex 3: System message in hyphen format: "19/09/2026, 10:15 - System notice" (no sender colon)
const SYSTEM_HYPHEN_PATTERN = /^(?:\u200E|\u200F)?(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4})[,\s]+(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\s*[-–—]\s*([^:]+)$/;

// Regex 4: System message in bracket format: "[19/09/2026, 10:15:30] System notice"
const SYSTEM_BRACKET_PATTERN = /^\[(?:\u200E|\u200F)?(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4}|\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)[, ]\s*(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4}|\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]\s*([^:]+)$/;

// Regex 5: Simple timestamp prefix without date: "[10:15 AM] Sender: Message" or "10:15 AM - Sender: Message"
const TIME_ONLY_PATTERN = /^(?:\[)?(?:\u200E|\u200F)?(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)(?:\]|\s*[-–—])\s*(?:~)?([^:]+?):\s*([\s\S]*)$/;

// Regex 6: Sender first format: "Sender, [19.09.2026 10:15]: Message" or "Sender [10:15 AM]: Message"
const SENDER_FIRST_PATTERN = /^(?:~)?([^[\n,]+?)(?:,\s*|\s+)\[(\d{1,4}[-/. ]\d{1,2}[-/. ]\d{1,4})?[,\s]*(\d{1,2}:\d{2}(?::\d{2})?(?:\s?[AaPp][Mm])?)\]:\s*([\s\S]*)$/;

const MEDIA_KEYWORDS = [
  '<media omitted>',
  '<မီဒီယာ ချန်လှပ်ထားသည်>',
  'image omitted',
  'video omitted',
  'audio omitted',
  'sticker omitted',
  'gif omitted',
  'document omitted',
  'contact card omitted',
  'location omitted',
  'missed voice call',
  'missed video call',
  'missed group call',
  'photo',
  'voice call'
];

const SYSTEM_MESSAGE_KEYWORDS = [
  'messages and calls are end-to-end encrypted',
  'end-to-end encrypted',
  'created group',
  'added you',
  'removed you',
  'left the group',
  'changed the subject',
  'changed this group',
  'security code changed',
  'you deleted this message',
  'this message was deleted',
  'waiting for this message',
  'disappearing messages'
];

export function parseWhatsAppText(rawText: string): ParseResult {
  if (!rawText || !rawText.trim()) {
    return {
      messages: [],
      senders: [],
      totalRawLines: 0,
      timestampsRemovedCount: 0,
      systemMessagesCount: 0,
    };
  }

  // Normalize line endings and invisible directional characters
  const sanitized = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u200B\u200E\u200F\uFEFF]/g, '');

  const lines = sanitized.split('\n');
  const messages: WhatsAppMessage[] = [];
  const senderSet = new Set<string>();
  let timestampsRemovedCount = 0;
  let systemMessagesCount = 0;

  let currentMessage: WhatsAppMessage | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // Check if line starts a new message
    let match = BRACKET_PATTERN.exec(trimmedLine);
    let isBracket = false;
    let isHyphen = false;
    let isSystem = false;
    let isTimeOnly = false;
    let isSenderFirst = false;

    if (match) {
      isBracket = true;
    } else {
      match = HYPHEN_PATTERN.exec(trimmedLine);
      if (match) {
        isHyphen = true;
      } else {
        match = TIME_ONLY_PATTERN.exec(trimmedLine);
        if (match) {
          isTimeOnly = true;
        } else {
          match = SENDER_FIRST_PATTERN.exec(trimmedLine);
          if (match) {
            isSenderFirst = true;
          } else {
            // Check system patterns
            const sysHyphen = SYSTEM_HYPHEN_PATTERN.exec(trimmedLine);
            if (sysHyphen) {
              isSystem = true;
              match = sysHyphen;
            } else {
              const sysBracket = SYSTEM_BRACKET_PATTERN.exec(trimmedLine);
              if (sysBracket) {
                isSystem = true;
                match = sysBracket;
              }
            }
          }
        }
      }
    }

    if (match) {
      // Save previous message if exists
      if (currentMessage) {
        messages.push(currentMessage);
      }

      timestampsRemovedCount++;

      if (isSystem) {
        systemMessagesCount++;
        const content = match[3] || match[2] || '';
        currentMessage = {
          id: `msg-${i}`,
          raw: line,
          timestamp: `${match[1]} ${match[2]}`.trim(),
          content: content.trim(),
          isSystemMessage: true,
          isMediaOmitted: false,
          lineNumber: i + 1,
        };
      } else if (isBracket) {
        const timePart = match[1];
        const datePart = match[2];
        const sender = match[3].trim();
        const content = match[4];

        senderSet.add(sender);
        const lowerContent = content.toLowerCase();
        const isMedia = MEDIA_KEYWORDS.some(k => lowerContent.includes(k));
        const isSys = SYSTEM_MESSAGE_KEYWORDS.some(k => lowerContent.includes(k));
        if (isSys) systemMessagesCount++;

        currentMessage = {
          id: `msg-${i}`,
          raw: line,
          sender,
          timestamp: `${timePart}, ${datePart}`,
          date: datePart,
          time: timePart,
          content: content,
          isSystemMessage: isSys,
          isMediaOmitted: isMedia,
          lineNumber: i + 1,
        };
      } else if (isHyphen) {
        const datePart = match[1];
        const timePart = match[2];
        const sender = match[3].trim();
        const content = match[4];

        senderSet.add(sender);
        const lowerContent = content.toLowerCase();
        const isMedia = MEDIA_KEYWORDS.some(k => lowerContent.includes(k));
        const isSys = SYSTEM_MESSAGE_KEYWORDS.some(k => lowerContent.includes(k));
        if (isSys) systemMessagesCount++;

        currentMessage = {
          id: `msg-${i}`,
          raw: line,
          sender,
          timestamp: `${datePart}, ${timePart}`,
          date: datePart,
          time: timePart,
          content: content,
          isSystemMessage: isSys,
          isMediaOmitted: isMedia,
          lineNumber: i + 1,
        };
      } else if (isTimeOnly) {
        const timePart = match[1];
        const sender = match[2].trim();
        const content = match[3];

        senderSet.add(sender);
        const lowerContent = content.toLowerCase();
        const isMedia = MEDIA_KEYWORDS.some(k => lowerContent.includes(k));
        const isSys = SYSTEM_MESSAGE_KEYWORDS.some(k => lowerContent.includes(k));
        if (isSys) systemMessagesCount++;

        currentMessage = {
          id: `msg-${i}`,
          raw: line,
          sender,
          timestamp: timePart,
          time: timePart,
          content: content,
          isSystemMessage: isSys,
          isMediaOmitted: isMedia,
          lineNumber: i + 1,
        };
      } else if (isSenderFirst) {
        const sender = match[1].trim();
        const datePart = match[2] || '';
        const timePart = match[3] || '';
        const content = match[4];

        senderSet.add(sender);
        const lowerContent = content.toLowerCase();
        const isMedia = MEDIA_KEYWORDS.some(k => lowerContent.includes(k));
        const isSys = SYSTEM_MESSAGE_KEYWORDS.some(k => lowerContent.includes(k));
        if (isSys) systemMessagesCount++;

        currentMessage = {
          id: `msg-${i}`,
          raw: line,
          sender,
          timestamp: `${datePart} ${timePart}`.trim(),
          date: datePart,
          time: timePart,
          content: content,
          isSystemMessage: isSys,
          isMediaOmitted: isMedia,
          lineNumber: i + 1,
        };
      }
    } else {
      // Line is a continuation of the previous message OR plain unformatted line
      if (currentMessage) {
        currentMessage.content += '\n' + line;
        currentMessage.raw += '\n' + line;
      } else {
        // Line without any timestamp prefix at all
        const lowerLine = trimmedLine.toLowerCase();
        const isSys = SYSTEM_MESSAGE_KEYWORDS.some(k => lowerLine.includes(k));
        const isMedia = MEDIA_KEYWORDS.some(k => lowerLine.includes(k));

        currentMessage = {
          id: `msg-${i}`,
          raw: line,
          content: line,
          isSystemMessage: isSys,
          isMediaOmitted: isMedia,
          lineNumber: i + 1,
        };
      }
    }
  }

  if (currentMessage) {
    messages.push(currentMessage);
  }

  return {
    messages,
    senders: Array.from(senderSet),
    totalRawLines: lines.length,
    timestampsRemovedCount,
    systemMessagesCount,
  };
}

/**
 * Filter and format messages according to user's clean options
 */
export function getCleanedMessages(messages: WhatsAppMessage[], options: CleanOptions): {
  sender?: string;
  text: string;
  originalMessage: WhatsAppMessage;
}[] {
  const result: { sender?: string; text: string; originalMessage: WhatsAppMessage }[] = [];

  for (const msg of messages) {
    // Filter system messages
    if (options.removeSystemMessages && msg.isSystemMessage) {
      continue;
    }

    // Filter media omitted
    if (options.removeMediaNotices && msg.isMediaOmitted) {
      continue;
    }

    // Filter by sender
    if (options.selectedSender !== 'all' && msg.sender && msg.sender !== options.selectedSender) {
      continue;
    }

    let text = msg.content;

    // Clean whitespace
    if (options.trimWhitespace) {
      text = text.trim();
    }

    // Clean empty lines
    if (options.removeEmptyLines && !text) {
      continue;
    }

    result.push({
      sender: msg.sender,
      text,
      originalMessage: msg,
    });
  }

  // Optionally merge consecutive messages from the same sender
  if (options.mergeConsecutiveSender && result.length > 0) {
    const merged: { sender?: string; text: string; originalMessage: WhatsAppMessage }[] = [];
    let current = result[0];

    for (let i = 1; i < result.length; i++) {
      const next = result[i];
      if (current.sender && next.sender && current.sender === next.sender) {
        current.text += '\n' + next.text;
      } else {
        merged.push(current);
        current = next;
      }
    }
    merged.push(current);
    return merged;
  }

  return result;
}

/**
 * Produce final plain text representation for copying or text export
 */
export function formatOutputText(
  items: { sender?: string; text: string }[],
  mode: CleanOptions['outputMode'],
  docxOptions?: DocxOptions
): string {
  if (mode === 'fatwa_a4') {
    const header = docxOptions?.fatwaHeaderTemplate || 'تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب';
    const prefix = docxOptions?.senderLabelPrefix !== undefined ? docxOptions.senderLabelPrefix : 'سائل: ';
    const itemsPerPage = docxOptions?.itemsPerPage || 3;

    return items
      .map((item, idx) => {
        const senderLine = item.sender ? `\n${prefix}${item.sender}` : '';
        // Zero gap between text and bottom name as requested
        const entry = `${header}\n${item.text}${senderLine}`;
        const isPageBreak = (idx + 1) % itemsPerPage === 0 && idx < items.length - 1;
        const pageNum = Math.floor(idx / itemsPerPage) + 1;
        if (isPageBreak) {
          return `${entry}\n\n==================== [A4 Page ${pageNum} End / Page ${pageNum + 1} Start] ====================`;
        }
        return entry;
      })
      .join('\n\n────────────────────────────────────────\n\n');
  }

  if (mode === 'text_only') {
    // Exactly what user asked: only message content, no timestamps, no sender labels
    return items.map(i => i.text).join('\n\n');
  }

  if (mode === 'sender_and_text') {
    return items
      .map(i => (i.sender ? `${i.sender}: ${i.text}` : i.text))
      .join('\n\n');
  }

  // formatted_chat
  return items
    .map(i => {
      const nameHeader = i.sender ? `[${i.sender}]\n` : '';
      return `${nameHeader}${i.text}`;
    })
    .join('\n\n-------------------------\n\n');
}
