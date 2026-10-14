import React from 'react';
import { FileText, Download } from 'lucide-react';
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

  return (
    <div className="flex flex-col h-full">
      {/* Top ribbon of Word viewer */}
      <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center justify-between text-xs text-slate-600 rounded-t-xl">
        <div className="flex items-center space-x-2">
          <div className="w-5 h-5 rounded bg-blue-700 text-white flex items-center justify-center font-bold text-[10px]">
            W
          </div>
          <span className="font-semibold text-slate-800 truncate max-w-[200px]">
            {docxOptions.docTitle || 'Document'}.docx
          </span>
          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-slate-500">
            {docxOptions.fontFamily.split(',')[0]} • {docxOptions.fontSizePt}pt
          </span>
        </div>

        <button
          type="button"
          onClick={onDownloadDocx}
          disabled={items.length === 0}
          className="inline-flex items-center px-3 py-1 text-xs font-semibold rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white shadow-xs transition-colors"
        >
          <Download className="w-3.5 h-3.5 mr-1.5" />
          {t.downloadDocxBtn}
        </button>
      </div>

      {/* Realistic Word Page Canvas */}
      <div className="flex-1 bg-slate-200/70 p-4 sm:p-8 overflow-y-auto max-h-[620px] rounded-b-xl flex justify-center">
        <div
          className="w-full max-w-2xl bg-white shadow-md border border-slate-200/80 rounded-sm p-6 sm:p-12 min-h-[500px] text-slate-900 transition-all"
          style={{
            fontFamily: docxOptions.fontFamily,
            fontSize: `${docxOptions.fontSizePt}pt`,
            lineHeight: docxOptions.lineSpacing,
            direction: docxOptions.fontFamily.includes('Nastaleeq') || lang === 'ur' ? 'rtl' : 'ltr',
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
          {items.length === 0 ? (
            <div className="py-20 text-center text-slate-400 text-sm italic">
              {t.emptyNotice}
            </div>
          ) : (
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
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
                      {item.text}
                    </p>
                  )}

                  {outputMode === 'sender_and_text' && (
                    <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">
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
                      <div className="pl-3 border-l-2 border-emerald-500/40 text-slate-800 whitespace-pre-wrap">
                        {item.text}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
