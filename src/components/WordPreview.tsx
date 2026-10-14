import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Layers,
  Sparkles,
  Maximize2,
} from 'lucide-react';
import { DocxOptions, OutputMode } from '../types';
import { Lang, translations } from '../utils/i18n';

interface CleanItem {
  sender?: string;
  text: string;
}

interface WordPreviewProps {
  lang: Lang;
  items: CleanItem[];
  outputMode: OutputMode;
  docxOptions: DocxOptions;
  onDownloadDocx: () => void;
}

export const WordPreview: React.FC<WordPreviewProps> = ({
  lang,
  items,
  outputMode,
  docxOptions,
  onDownloadDocx,
}) => {
  const t = translations[lang];
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'all' | 'single'>('all');

  const itemsPerPage = docxOptions.itemsPerPage || 3;
  const fatwaHeader =
    docxOptions.fatwaHeaderTemplate ||
    'تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب';
  const senderPrefix =
    docxOptions.senderLabelPrefix !== undefined
      ? docxOptions.senderLabelPrefix
      : 'سائل: ';

  // Chunk items into A4 pages
  const pages = useMemo(() => {
    if (items.length === 0) return [];
    if (outputMode !== 'fatwa_a4') {
      // Non-fatwa modes can either be single continuous doc or chunked
      return [items];
    }
    const chunks: CleanItem[][] = [];
    for (let i = 0; i < items.length; i += itemsPerPage) {
      chunks.push(items.slice(i, i + itemsPerPage));
    }
    return chunks;
  }, [items, itemsPerPage, outputMode]);

  const totalPages = Math.max(1, pages.length);
  const safePageIndex = Math.min(currentPageIndex, totalPages - 1);

  const isRtl =
    docxOptions.fontFamily.includes('Nastaleeq') ||
    docxOptions.fontFamily.includes('Urdu') ||
    lang === 'ur';

  return (
    <div className="flex flex-col h-full bg-slate-100 rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      {/* Top Ribbon of Word Viewer */}
      <div className="bg-white border-b border-slate-200 px-3.5 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded-md bg-blue-700 text-white flex items-center justify-center font-bold text-[11px] shadow-2xs">
            W
          </div>
          <span className="font-bold text-slate-800 truncate max-w-[180px] sm:max-w-[260px]">
            {docxOptions.docTitle || 'WhatsApp_Document'}.docx
          </span>
          <span className="hidden sm:inline text-slate-300">|</span>
          <span className="hidden sm:inline-flex items-center text-slate-600 font-medium">
            A4 Paper • {itemsPerPage} items/page
          </span>
        </div>

        {/* View Mode & Page Navigation */}
        <div className="flex items-center space-x-2">
          {outputMode === 'fatwa_a4' && totalPages > 1 && (
            <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-[11px]">
              <button
                type="button"
                onClick={() => setViewMode('all')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'all'
                    ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.viewAllPages} ({totalPages})
              </button>
              <button
                type="button"
                onClick={() => setViewMode('single')}
                className={`px-2 py-0.5 rounded transition-colors ${
                  viewMode === 'single'
                    ? 'bg-white font-semibold text-slate-900 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {t.viewSinglePage}
              </button>
            </div>
          )}

          {outputMode === 'fatwa_a4' && viewMode === 'single' && totalPages > 1 && (
            <div className="flex items-center space-x-1 text-slate-700 font-medium">
              <button
                type="button"
                onClick={() => setCurrentPageIndex((p) => Math.max(0, p - 1))}
                disabled={safePageIndex === 0}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] px-1 font-mono">
                {safePageIndex + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() =>
                  setCurrentPageIndex((p) => Math.min(totalPages - 1, p + 1))
                }
                disabled={safePageIndex === totalPages - 1}
                className="p-1 rounded hover:bg-slate-200 disabled:opacity-40"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <button
            type="button"
            id="word-preview-download-docx"
            onClick={onDownloadDocx}
            disabled={items.length === 0}
            className="inline-flex items-center px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {t.downloadDocxBtn}
          </button>
        </div>
      </div>

      {/* Realistic Word Page Canvas */}
      <div className="flex-1 bg-slate-300/60 p-4 sm:p-8 overflow-y-auto max-h-[640px] flex flex-col items-center space-y-8">
        {items.length === 0 ? (
          <div className="w-full max-w-2xl bg-white shadow-md border border-slate-200 rounded-sm p-12 text-center text-slate-400 text-sm italic">
            {t.emptyNotice}
          </div>
        ) : outputMode === 'fatwa_a4' ? (
          // Fatwa A4 Page View (Either All Pages stacked or Single Page)
          (viewMode === 'all' ? pages : [pages[safePageIndex] || []]).map(
            (pageItems, pageIdx) => {
              const actualPageNum =
                viewMode === 'all' ? pageIdx + 1 : safePageIndex + 1;
              return (
                <div key={pageIdx} className="w-full max-w-2xl flex flex-col items-center">
                  {/* Page Indicator Tag */}
                  <div className="w-full flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2 px-1">
                    <span className="inline-flex items-center bg-white/80 border border-slate-300/80 px-2 py-0.5 rounded text-slate-700 shadow-2xs font-mono">
                      📄 {t.pageBadge} {actualPageNum} {t.pageOfText} {totalPages}
                      <span className="ml-2 text-emerald-700 font-sans font-bold">
                        • {pageItems.length} {lang === 'my' ? 'ကြောင်း' : 'فتاویٰ'}
                      </span>
                    </span>
                    <span className="text-slate-400 font-mono text-[10px]">
                      A4 (210 × 297 mm)
                    </span>
                  </div>

                  {/* A4 Sheet Paper */}
                  <div
                    className="w-full bg-white shadow-lg border border-slate-300 rounded-xs p-6 sm:p-10 min-h-[580px] text-slate-900 transition-all relative"
                    style={{
                      fontFamily: docxOptions.fontFamily,
                      fontSize: `${docxOptions.fontSizePt}pt`,
                      lineHeight: isRtl ? '2.1' : docxOptions.lineSpacing,
                      direction: isRtl ? 'rtl' : 'ltr',
                    }}
                  >
                    {/* Optional Document Title on Page 1 */}
                    {actualPageNum === 1 &&
                      docxOptions.includeTitleInDoc &&
                      docxOptions.docTitle && (
                        <div className="text-center mb-6 border-b pb-3 border-slate-200">
                          <h1
                            className="font-bold text-slate-900 tracking-tight mb-1"
                            style={{
                              fontSize: `${Math.round(
                                docxOptions.fontSizePt * 1.35
                              )}pt`,
                            }}
                          >
                            {docxOptions.docTitle}
                          </h1>
                          <p className="text-[11px] text-slate-500 italic">
                            Generated from WhatsApp • {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      )}

                    {/* Page Fatwa Items: Strictly 3 items per A4 sheet */}
                    <div className="space-y-4">
                      {pageItems.map((item, itemIdx) => {
                        const isLastItemOnPage = itemIdx === pageItems.length - 1;
                        return (
                          <div
                            key={itemIdx}
                            className={`transition-all ${
                              !isLastItemOnPage && docxOptions.addMessageDivider
                                ? 'border-b border-dashed border-slate-300 pb-3'
                                : ''
                            }`}
                          >
                            {/* 1. Top Header: "تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب" */}
                            <div className="bg-slate-50 border border-slate-200 rounded-md px-3 py-1.5 mb-2 font-bold text-slate-800 text-sm tracking-wide select-all flex items-center justify-between">
                              <span
                                className="font-urdu leading-relaxed"
                                style={{
                                  fontSize: `${docxOptions.fontSizePt + 1}pt`,
                                }}
                              >
                                {fatwaHeader}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono font-normal">
                                #{itemIdx + 1}
                              </span>
                            </div>

                            {/* 2. Message / Fatwa Text */}
                            <p className="whitespace-pre-wrap text-slate-900 leading-relaxed font-urdu select-text">
                              {item.text}
                            </p>

                            {/* 3. Bottom Sender Name: NO GAP (zero spacing) directly attached beneath the text! */}
                            {item.sender && docxOptions.senderAtBottom !== false && (
                              <div
                                className="mt-0 pt-0.5 flex items-center justify-between text-xs text-sky-800 font-bold select-text"
                                style={{
                                  // Zero gap as user explicitly instructed: "အောက်ကနာမည်နဲ့ ဖသ်ဝါကြားမှာအကွာအဝေးမလိုချင်ဘူး"
                                  marginTop: '0px',
                                  paddingTop: '2px',
                                }}
                              >
                                <span className="font-urdu">
                                  {senderPrefix}
                                  {item.sender}
                                </span>
                                <span className="text-[10px] text-slate-400 font-normal italic">
                                  (منقول از واٹس ایپ)
                                </span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Page Footer / Page Number */}
                    <div className="absolute bottom-3 left-0 right-0 text-center text-[10px] text-slate-400 font-mono pointer-events-none">
                      - {actualPageNum} -
                    </div>
                  </div>
                </div>
              );
            }
          )
        ) : (
          // Standard / Continuous Modes (text_only, sender_and_text, formatted_chat)
          <div
            className="w-full max-w-2xl bg-white shadow-md border border-slate-200/80 rounded-sm p-6 sm:p-12 min-h-[500px] text-slate-900 transition-all"
            style={{
              fontFamily: docxOptions.fontFamily,
              fontSize: `${docxOptions.fontSizePt}pt`,
              lineHeight: docxOptions.lineSpacing,
              direction: isRtl ? 'rtl' : 'ltr',
            }}
          >
            {/* Document Title if toggled */}
            {docxOptions.includeTitleInDoc && docxOptions.docTitle && (
              <div className="text-center mb-8 border-b pb-4 border-slate-200">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-1">
                  {docxOptions.docTitle}
                </h1>
                <p className="text-xs text-slate-500 italic">
                  Generated from WhatsApp • {new Date().toLocaleDateString()}
                </p>
              </div>
            )}

            {/* Messages list */}
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div
                  key={idx}
                  className={`transition-colors ${
                    docxOptions.addMessageDivider
                      ? 'border-b border-dashed border-slate-200 pb-3'
                      : ''
                  }`}
                >
                  {outputMode === 'text_only' && (
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed font-urdu">
                      {item.text}
                    </p>
                  )}

                  {outputMode === 'sender_and_text' && (
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed font-urdu">
                      {item.sender && (
                        <span className="font-bold text-sky-800 mr-1.5">
                          {item.sender}:
                        </span>
                      )}
                      <span>{item.text}</span>
                    </p>
                  )}

                  {outputMode === 'formatted_chat' && (
                    <div className="my-2">
                      {item.sender && (
                        <div className="text-xs font-bold text-emerald-800 uppercase tracking-wide mb-1">
                          {item.sender}
                        </div>
                      )}
                      <div className="pl-3 border-l-2 border-emerald-500/40 text-slate-800 whitespace-pre-wrap font-urdu">
                        {item.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

