import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  PageBreak,
  Footer,
  PageNumber,
  convertInchesToTwip,
} from 'docx';
import { DocxOptions, OutputMode } from '../types';

interface CleanMessageItem {
  sender?: string;
  text: string;
}

export function toUrduDigits(num: number | string): string {
  const urduDigits = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  return String(num).replace(/[0-9]/g, (d) => urduDigits[Number(d)]);
}

export function toMyanmarDigits(num: number | string): string {
  const myanmarDigits = ['၀', '၁', '၂', '၃', '၄', '၅', '၆', '၇', '၈', '၉'];
  return String(num).replace(/[0-9]/g, (d) => myanmarDigits[Number(d)]);
}

export function formatNumberForFont(num: number | string, fontFamily: string): string {
  if (fontFamily.includes('Nastaleeq') || fontFamily.includes('Urdu')) {
    return toUrduDigits(num);
  }
  if (fontFamily.includes('Pyidaungsu') || fontFamily.includes('Myanmar')) {
    return toMyanmarDigits(num);
  }
  return String(num);
}

function buildDocumentFooter(
  fontFamily: string,
  isUrduFont: boolean,
  options: DocxOptions
): Footer {
  const format = options.pageNumberFormat || 'page_of_total';
  const runs: TextRun[] = [];

  if (format === 'simple_dash') {
    runs.push(
      new TextRun({ text: '- ', font: fontFamily, size: 18, color: '64748B' }),
      new TextRun({
        children: [PageNumber.CURRENT],
        font: fontFamily,
        size: 18,
        bold: true,
        color: '334155',
      }),
      new TextRun({ text: ' -', font: fontFamily, size: 18, color: '64748B' })
    );
  } else {
    // page_of_total
    const pageLabel = isUrduFont
      ? 'صفحہ '
      : fontFamily.includes('Pyidaungsu')
      ? 'စာမျက်နှာ '
      : 'Page ';
    const ofLabel = isUrduFont
      ? ' از '
      : fontFamily.includes('Pyidaungsu')
      ? ' / '
      : ' of ';

    runs.push(
      new TextRun({ text: pageLabel, font: fontFamily, size: 18, color: '64748B' }),
      new TextRun({
        children: [PageNumber.CURRENT],
        font: fontFamily,
        size: 18,
        bold: true,
        color: '334155',
      }),
      new TextRun({ text: ofLabel, font: fontFamily, size: 18, color: '64748B' }),
      new TextRun({
        children: [PageNumber.TOTAL_PAGES],
        font: fontFamily,
        size: 18,
        bold: true,
        color: '334155',
      })
    );
  }

  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 140, after: 60 },
        children: runs,
      }),
    ],
  });
}

export async function generateWordDocument(
  items: CleanMessageItem[],
  outputMode: OutputMode,
  options: DocxOptions
): Promise<Blob> {
  // Normalize font name
  let fontFamily = options.fontFamily || 'Jameel Noori Nastaleeq';
  if (fontFamily.includes('Jameel Noori Nastaleeq')) {
    fontFamily = 'Jameel Noori Nastaleeq';
  } else if (fontFamily.includes('Pyidaungsu')) {
    fontFamily = 'Pyidaungsu';
  }

  const isUrduFont = fontFamily === 'Jameel Noori Nastaleeq';
  const fontSizeHalfPt = (options.fontSizePt || (isUrduFont ? 14 : 12)) * 2;
  const lineSpacingTwip = Math.round((options.lineSpacing || (isUrduFont ? 1.4 : 1.15)) * 240);
  const itemsPerPage = options.itemsPerPage || 3;
  const fatwaHeaderTemplate = options.fatwaHeaderTemplate || 'تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب';
  const senderPrefix = options.senderLabelPrefix !== undefined ? options.senderLabelPrefix : 'سائل: ';

  // Create standard A4 dimensions (210 x 297 mm = 11906 x 16838 twips)
  const a4PageProperties = {
    size: {
      width: 11906,
      height: 16838,
    },
    margin: {
      top: convertInchesToTwip(0.75),
      right: convertInchesToTwip(0.75),
      bottom: convertInchesToTwip(0.75),
      left: convertInchesToTwip(0.75),
    },
    pageNumbers: options.resetPageNumberPerSection ? { start: 1 } : undefined,
  };

  const footer = options.enablePageNumbering !== false ? buildDocumentFooter(fontFamily, isUrduFont, options) : undefined;

  // FATWA A4 MODE:
  // Strictly partitions items into pages of `itemsPerPage` (default 3)
  // Ensures item counts reset correctly to 1..3 on each page
  // Provides dynamic page numbers in the footer
  if (outputMode === 'fatwa_a4') {
    const pageChunks: CleanMessageItem[][] = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      pageChunks.push(items.slice(i, i + itemsPerPage));
    }

    // Handle empty case
    if (pageChunks.length === 0) {
      pageChunks.push([]);
    }

    const sections = pageChunks.map((chunk, pageIndex) => {
      const pageParagraphs: Paragraph[] = [];

      // 1. Optional Document Title on Page 1 only
      if (pageIndex === 0 && options.includeTitleInDoc && options.docTitle && options.docTitle.trim()) {
        pageParagraphs.push(
          new Paragraph({
            text: options.docTitle.trim(),
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200, before: 100 },
            run: {
              font: fontFamily,
              bold: true,
              size: fontSizeHalfPt + 8,
              color: '1E293B',
            },
          })
        );

        pageParagraphs.push(
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [
              new TextRun({
                text: `Generated from WhatsApp • ${new Date().toLocaleDateString()}`,
                font: fontFamily,
                size: 18,
                color: '64748B',
                italics: true,
              }),
            ],
          })
        );
      }

      if (chunk.length === 0) {
        pageParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: 'No message content available.',
                font: fontFamily,
                size: fontSizeHalfPt,
                italics: true,
                color: '94A3B8',
              }),
            ],
          })
        );
      }

      // Add each item on this 3-item page
      chunk.forEach((item, itemIdx) => {
        const rawLines = item.text.split('\n');

        // Dynamic Count:
        // Item count resets to 1, 2, 3 on every page based on 3-items-per-page constraint!
        const itemNumberOnPage = itemIdx + 1; // 1, 2, or 3
        const continuousNumber = pageIndex * itemsPerPage + itemIdx + 1;
        const activeNumber = options.resetItemCountPerPage !== false ? itemNumberOnPage : continuousNumber;
        const numDisplay = formatNumberForFont(activeNumber, fontFamily);
        const totalInChunkDisplay = formatNumberForFont(chunk.length, fontFamily);

        // Header text: If user template has {num}, replace it; otherwise preserve the exact requested text
        let finalHeader = fatwaHeaderTemplate;
        if (finalHeader.includes('{num}')) {
          finalHeader = finalHeader
            .replace('{num}', numDisplay)
            .replace('{total}', totalInChunkDisplay);
        }

        // 1. Top Header paragraph (Clean, bold, right-aligned, matching Word screenshot)
        pageParagraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: finalHeader,
                font: fontFamily,
                bold: true,
                size: fontSizeHalfPt + 2,
                color: '1E293B',
              }),
            ],
            alignment: AlignmentType.RIGHT,
            bidirectional: isUrduFont,
            spacing: {
              before: itemIdx === 0 && (!options.includeTitleInDoc || pageIndex > 0) ? 80 : 420,
              after: 100,
            },
          })
        );

        // 2 & 3. Fatwa question and attached sender name:
        // CRITICAL REQUIREMENT: "နာမည်ကကွာမနေရဘူး ကပ်နေရမယ်" (No gap between question and sender!)
        // In Word, putting both into the SAME Paragraph using a soft break (<w:br/> / break: 1)
        // guarantees 100% that Microsoft Word will not add paragraph spacing or page breaks between them.
        const questionRuns: TextRun[] = [];
        const cleanLines = item.text.trim().split('\n');
        cleanLines.forEach((line, lIdx) => {
          questionRuns.push(
            new TextRun({
              text: line,
              font: fontFamily,
              size: fontSizeHalfPt,
              color: '1E293B',
              break: lIdx > 0 ? 1 : 0,
            })
          );
        });

        // Tightly attached sender name directly on the next line (ZERO GAP)
        if (item.sender && options.senderAtBottom !== false) {
          const prefix = options.senderLabelPrefix || '';
          questionRuns.push(
            new TextRun({
              text: `${prefix}${item.sender}`,
              font: fontFamily,
              size: fontSizeHalfPt,
              bold: true,
              color: '1E293B',
              break: 1, // Soft line break in exact same paragraph - zero gap!
            })
          );
        }

        pageParagraphs.push(
          new Paragraph({
            children: questionRuns,
            alignment: AlignmentType.RIGHT,
            bidirectional: isUrduFont,
            spacing: {
              before: 60,
              after: 0,
              line: lineSpacingTwip,
            },
          })
        );

        if (options.addMessageDivider && itemIdx < chunk.length - 1) {
          pageParagraphs.push(
            new Paragraph({
              spacing: { before: 80, after: 80 },
              border: {
                bottom: {
                  style: BorderStyle.DOTTED,
                  size: 1,
                  color: 'CBD5E1',
                },
              },
            })
          );
        }
      });

      return {
        properties: {
          page: a4PageProperties,
        },
        footers: footer ? { default: footer } : undefined,
        children: pageParagraphs,
      };
    });

    const doc = new Document({
      title: options.docTitle || 'فتاویٰ و پیغامات',
      creator: options.authorName || 'دار الافتاء / WhatsApp to Word',
      sections,
    });

    return await Packer.toBlob(doc);
  }

  // OTHER OUTPUT MODES (text_only, sender_and_text, formatted_chat)
  const paragraphs: Paragraph[] = [];

  if (options.includeTitleInDoc && options.docTitle && options.docTitle.trim()) {
    paragraphs.push(
      new Paragraph({
        text: options.docTitle.trim(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: { after: 240, before: 120 },
        run: {
          font: fontFamily,
          bold: true,
          size: fontSizeHalfPt + 8,
          color: '1E293B',
        },
      })
    );

    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 320 },
        children: [
          new TextRun({
            text: `Generated from WhatsApp • ${new Date().toLocaleDateString()}`,
            font: fontFamily,
            size: 18,
            color: '64748B',
            italics: true,
          }),
        ],
      })
    );
  }

  items.forEach((item) => {
    const rawLines = item.text.split('\n');

    if (outputMode === 'text_only') {
      const textRuns: TextRun[] = [];
      rawLines.forEach((line, lIdx) => {
        textRuns.push(
          new TextRun({
            text: line,
            font: fontFamily,
            size: fontSizeHalfPt,
            color: '1E293B',
            break: lIdx > 0 ? 1 : 0,
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          children: textRuns,
          alignment: isUrduFont ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: isUrduFont,
          spacing: {
            after: options.addMessageDivider ? 200 : 160,
            line: lineSpacingTwip,
          },
          border: options.addMessageDivider
            ? {
                bottom: {
                  style: BorderStyle.DOTTED,
                  size: 1,
                  color: 'E2E8F0',
                },
              }
            : undefined,
        })
      );
    } else if (outputMode === 'sender_and_text') {
      const textRuns: TextRun[] = [];

      if (item.sender) {
        textRuns.push(
          new TextRun({
            text: `${item.sender}: `,
            bold: true,
            font: fontFamily,
            size: fontSizeHalfPt,
            color: '0369A1',
          })
        );
      }

      rawLines.forEach((line, lIdx) => {
        textRuns.push(
          new TextRun({
            text: line,
            font: fontFamily,
            size: fontSizeHalfPt,
            color: '1E293B',
            break: lIdx > 0 ? 1 : 0,
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          children: textRuns,
          alignment: isUrduFont ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: isUrduFont,
          spacing: {
            after: options.addMessageDivider ? 200 : 160,
            line: lineSpacingTwip,
          },
          border: options.addMessageDivider
            ? {
                bottom: {
                  style: BorderStyle.DOTTED,
                  size: 1,
                  color: 'E2E8F0',
                },
              }
            : undefined,
        })
      );
    } else {
      // formatted_chat
      if (item.sender) {
        paragraphs.push(
          new Paragraph({
            alignment: isUrduFont ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isUrduFont,
            spacing: { before: 180, after: 60 },
            children: [
              new TextRun({
                text: item.sender,
                bold: true,
                font: fontFamily,
                size: fontSizeHalfPt,
                color: '047857',
              }),
            ],
          })
        );
      }

      const textRuns: TextRun[] = [];
      rawLines.forEach((line, lIdx) => {
        textRuns.push(
          new TextRun({
            text: line,
            font: fontFamily,
            size: fontSizeHalfPt,
            color: '1E293B',
            break: lIdx > 0 ? 1 : 0,
          })
        );
      });

      paragraphs.push(
        new Paragraph({
          alignment: isUrduFont ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: isUrduFont,
          indent: {
            left: convertInchesToTwip(0.2),
          },
          children: textRuns,
          spacing: {
            after: 240,
            line: lineSpacingTwip,
          },
          border: options.addMessageDivider
            ? {
                bottom: {
                  style: BorderStyle.SINGLE,
                  size: 1,
                  color: 'CBD5E1',
                },
              }
            : undefined,
        })
      );
    }
  });

  if (paragraphs.length === 0) {
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'No message content available.',
            font: fontFamily,
            size: fontSizeHalfPt,
            italics: true,
            color: '94A3B8',
          }),
        ],
      })
    );
  }

  const doc = new Document({
    title: options.docTitle || 'WhatsApp Messages',
    creator: options.authorName || 'WhatsApp to Word Cleaner',
    sections: [
      {
        properties: {
          page: a4PageProperties,
        },
        footers: footer ? { default: footer } : undefined,
        children: paragraphs,
      },
    ],
  });

  return await Packer.toBlob(doc);
}

export async function downloadDocxFile(
  items: CleanMessageItem[],
  outputMode: OutputMode,
  options: DocxOptions,
  filename?: string
): Promise<void> {
  const blob = await generateWordDocument(items, outputMode, options);
  const cleanName = (filename || options.docTitle || 'WhatsApp_Messages')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_');
  const finalFilename = `${cleanName || 'WhatsApp_Messages'}.docx`;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = finalFilename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}
