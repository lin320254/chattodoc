import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
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
  const lineSpacingTwip = Math.round((options.lineSpacing || (isUrduFont ? 1.5 : 1.15)) * 240); // 240 is single line in twip

  // 1. Optional Document Title
  if (options.includeTitleInDoc && options.docTitle.trim()) {
    paragraphs.push(
      new Paragraph({
        text: options.docTitle.trim(),
        heading: HeadingLevel.HEADING_1,
        alignment: AlignmentType.CENTER,
        spacing: {
          after: 280,
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
          after: 400,
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
  items.forEach((item, index) => {
    const rawLines = item.text.split('\n');

    if (outputMode === 'text_only') {
      // Clean text only (no sender, no timestamp)
      // Build lines with proper breaks
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

  const doc = new Document({
    title: options.docTitle || 'WhatsApp Messages',
    creator: options.authorName || 'WhatsApp to Word Cleaner',
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
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
