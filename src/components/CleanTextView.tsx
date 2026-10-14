import React, { useState } from 'react';
import { Copy, Check, Download, Search } from 'lucide-react';
import { Lang, translations } from '../utils/i18n';

interface CleanTextViewProps {
  lang: Lang;
  cleanText: string;
  onCopy: () => void;
  isCopied: boolean;
  onDownloadTxt: () => void;
}

export const CleanTextView: React.FC<CleanTextViewProps> = ({
  lang,
  cleanText,
  onCopy,
  isCopied,
  onDownloadTxt,
}) => {
  const t = translations[lang];
  const [searchTerm, setSearchTerm] = useState('');

  const wordCount = cleanText.trim() ? cleanText.trim().split(/\s+/).length : 0;
  const charCount = cleanText.length;
  const lineCount = cleanText ? cleanText.split('\n').length : 0;

  return (
    <div className="flex flex-col h-full bg-white rounded-xl border border-slate-200 overflow-hidden">
      {/* Top Action Ribbon */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 text-xs">
        {/* Stats */}
        <div className="flex items-center space-x-3 text-slate-500 font-medium">
          <span>{charCount.toLocaleString()} chars</span>
          <span>•</span>
          <span>{wordCount.toLocaleString()} words</span>
          <span>•</span>
          <span>{lineCount} lines</span>
        </div>

        {/* Buttons */}
        <div className="flex items-center space-x-2">
          {/* Search box if content exists */}
          {cleanText && (
            <div className="relative hidden sm:block">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs bg-white border border-slate-200 rounded-md text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-32"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2" />
            </div>
          )}

          <button
            type="button"
            id="copy-clean-text-btn"
            onClick={onCopy}
            disabled={!cleanText}
            className={`inline-flex items-center px-3 py-1.5 font-medium rounded-lg text-xs shadow-xs transition-all ${
              isCopied
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 disabled:opacity-50'
            }`}
          >
            {isCopied ? (
              <>
                <Check className="w-3.5 h-3.5 mr-1" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 mr-1" />
                {t.copyCleanTextBtn}
              </>
            )}
          </button>

          <button
            type="button"
            id="download-txt-btn"
            onClick={onDownloadTxt}
            disabled={!cleanText}
            className="inline-flex items-center px-2.5 py-1.5 font-medium rounded-lg text-xs bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 disabled:opacity-50 transition-colors"
          >
            <Download className="w-3.5 h-3.5 mr-1 text-slate-500" />
            .txt
          </button>
        </div>
      </div>

      {/* Text display */}
      <div
        className="p-4 sm:p-6 overflow-y-auto max-h-[580px] flex-1 bg-white text-base text-slate-800 leading-relaxed whitespace-pre-wrap select-text"
        style={{
          fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Sans Myanmar', 'Pyidaungsu', system-ui, sans-serif",
          direction: lang === 'ur' ? 'rtl' : 'ltr',
          lineHeight: lang === 'ur' ? '2.1' : '1.7',
        }}
      >
        {!cleanText ? (
          <div className="py-20 text-center text-slate-400 text-sm italic">
            {t.emptyNotice}
          </div>
        ) : (
          cleanText
        )}
      </div>
    </div>
  );
};
