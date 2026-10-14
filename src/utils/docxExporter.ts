import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  PageBreak,
  convertInchesToTwip,
} from 'docx';
import { DocxOptions, OutputMode } from '../types';

interface CleanMessageItem {
  sender?: string;
  text: string;
}

export async function generateWordDocument(
  items: CleanMessageItem[],
  outputMode: OutputMode,
  options: DocxOptions
): Promise<Blob> {
  const paragraphs: Paragraph[] = [];
  // Use font name without CSS quotes for docx
  let fontFamily = options.fontFamily || 'Jameel Noori Nastaleeq';
  if (fontFamily.includes('Jameel Noori Nastaleeq')) {
    fontFamily = 'Jameel Noori Nastaleeq';
  } else if (fontFamily.includes('Pyidaungsu')) {
    fontFamily = 'Pyidaungsu';
  }

  const isUrduFont = fontFamily === 'Jameel Noori Nastaleeq';
  // Urdu Nastaleeq typography looks best at slightly larger pt (14-16pt) or user chosen
  const fontSizeHalfPt = (options.fontSizePt || (isUrduFont ? 14 : 12)) * 2; // docx uses half-points
  const lineSpacingTwip = Math.round((options.lineSpacing || (isUrduFont ? 1.4 : 1.15)) * 240); // 240 is single line in twip

  // 1. Optional Document Title
  if (options.includeTitleInDoc && options.docTitle && options.docTitle.trim()) {
    paragraphs.push(
      new Paragraph({
        text: options.docTitle.trim(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 240,
          before: 120,
        },
        run: {
          font: fontFamily,
          bold: true,
          size: fontSizeHalfPt + 8, // Prominent title
          color: '1E293B',
        },
      })
    );

    // Subtitle / Generated timestamp
    paragraphs.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 320,
        },
        children: [
          new TextRun({
            text: `Generated from WhatsApp • ${new Date().toLocaleDateString()}`,
            font: fontFamily,
            size: 18, // 9pt
            color: '64748B',
            italics: true,
          }),
        ],
      })
    );
  }

  // 2. Add Messages based on Output Mode
  const itemsPerPage = options.itemsPerPage || 3;
  const fatwaHeader = options.fatwaHeaderTemplate || 'تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب';
  const senderPrefix = options.senderLabelPrefix !== undefined ? options.senderLabelPrefix : 'سائل: ';

  items.forEach((item, index) => {
    const rawLines = item.text.split('\n');

    if (outputMode === 'fatwa_a4') {
      // User's specific Fatwa A4 mode:
      // - 3 items strictly per A4 page (with PageBreak after every 3 items)
      // - Header on top of each item: "تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب"
      // - Fatwa text
      // - Sender name directly at the bottom with NO GAP (zero spacing) between text and sender!

      // Page break before item if starting a new A4 page (index > 0 and index % itemsPerPage === 0)
      if (index > 0 && index % itemsPerPage === 0) {
        paragraphs.push(
          new Paragraph({
            children: [new PageBreak()],
          })
        );
      }

      // 1. Top Header Paragraph
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: fatwaHeader,
              font: fontFamily,
              bold: true,
              size: fontSizeHalfPt + 2,
              color: '0F172A',
            }),
          ],
          alignment: isUrduFont ? AlignmentType.RIGHT : AlignmentType.LEFT,
          bidirectional: isUrduFont,
          spacing: {
            before: index % itemsPerPage === 0 ? 60 : 160,
            after: 60,
          },
          border: {
            bottom: {
              style: BorderStyle.SINGLE,
              size: 2,
              color: 'CBD5E1',
            },
          },
        })
      );

      // 2. Fatwa Message Text (Middle)
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
            before: 60,
            after: 0, // CRITICAL: Zero spacing after text so bottom name connects immediately!
            line: lineSpacingTwip,
          },
        })
      );

      // 3. Bottom Sender Name (NO GAP from fatwa text above it)
      if (item.sender && options.senderAtBottom !== false) {
        paragraphs.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${senderPrefix}${item.sender}`,
                font: fontFamily,
                bold: true,
                size: Math.max(18, fontSizeHalfPt - 2),
                color: '0369A1', // Clean subtle slate blue for sender identity
              }),
            ],
            // In Urdu Nastaleeq documents, signature / asker is positioned at left or right as preferred
            alignment: isUrduFont ? AlignmentType.LEFT : AlignmentType.RIGHT,
            bidirectional: isUrduFont,
            spacing: {
              before: 0, // CRITICAL: NO GAP between fatwa text and bottom name!
              after: options.addMessageDivider ? 180 : 140,
            },
            border: options.addMessageDivider && (index + 1) % itemsPerPage !== 0
              ? {
                  bottom: {
                    style: BorderStyle.DOTTED,
                    size: 1,
                    color: '94A3B8',
                  },
                }
              : undefined,
          })
        );
      } else if (options.addMessageDivider && (index + 1) % itemsPerPage !== 0) {
        // If no sender but divider is requested
        paragraphs.push(
          new Paragraph({
            spacing: { before: 0, after: 140 },
            border: {
              bottom: {
                style: BorderStyle.DOTTED,
                size: 1,
                color: '94A3B8',
              },
            },
          })
        );
      }
    } else if (outputMode === 'text_only') {
      // Clean text only (no sender, no timestamp)
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
      // Sender: Text inline
      const textRuns: TextRun[] = [];

      if (item.sender) {
        textRuns.push(
          new TextRun({
            text: `${item.sender}: `,
            bold: true,
            font: fontFamily,
            size: fontSizeHalfPt,
            color: '0369A1', // Slate blue for sender
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
      // Formatted Chat Dialogue
      if (item.sender) {
        paragraphs.push(
          new Paragraph({
            alignment: isUrduFont ? AlignmentType.RIGHT : AlignmentType.LEFT,
            bidirectional: isUrduFont,
            spacing: {
              before: 180,
              after: 60,
            },
            children: [
              new TextRun({
                text: item.sender,
                bold: true,
                font: fontFamily,
                size: fontSizeHalfPt,
                color: '047857', // Forest green header
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

  // If no items were parsed, provide a placeholder paragraph
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

  // Standard A4 dimensions in twips: width: 11906, height: 16838
  const doc = new Document({
    title: options.docTitle || 'فتاویٰ و پیغامات',
    creator: options.authorName || 'دار الافتاء / WhatsApp to Word',
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width
              height: 16838, // A4 height
            },
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
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
