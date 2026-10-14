import React from 'react';
import { FileText, Sparkles, Globe, Download } from 'lucide-react';
import { Lang, translations } from '../utils/i18n';
import { SAMPLE_CHATS } from '../data/sampleChats';

interface NavbarProps {
  lang: Lang;
  onLanguageChange: (lang: Lang) => void;
  onSelectSample: (content: string) => void;
  hasContent: boolean;
  onDownloadDocx: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  onSelectSample,
  hasContent,
  onDownloadDocx,
}) => {
  const t = translations[lang];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  WhatsApp to Word
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  .docx Exporter
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Controls & Quick Actions */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Sample Selector */}
            <div className="relative group">
              <button
                type="button"
                id="sample-menu-btn"
                className="inline-flex items-center px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-500" />
                {t.loadSampleBtn}
              </button>
              <div className="hidden group-hover:block absolute right-0 mt-1 w-64 bg-white rounded-lg shadow-lg border border-slate-200 py-1.5 z-50">
                <div className="px-3 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Choose a sample chat
                </div>
                {SAMPLE_CHATS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSelectSample(sample.content)}
                    className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex flex-col"
                  >
                    <span className="font-medium">{sample.name}</span>
                    <span className="text-[11px] text-slate-400 truncate">
                      {sample.content.slice(0, 45)}...
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative flex items-center">
              <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 text-xs font-medium text-slate-700 shadow-xs">
                <button
                  type="button"
                  id="lang-ur-btn"
                  onClick={() => onLanguageChange('ur')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    lang === 'ur'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="اردو (Urdu)"
                >
                  اردو
                </button>
                <button
                  type="button"
                  id="lang-my-btn"
                  onClick={() => onLanguageChange('my')}
                  className={`px-2.5 py-1 rounded-md transition-colors ${
                    lang === 'my'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="မြန်မာ (Burmese)"
                >
                  မြန်မာ
                </button>
                <button
                  type="button"
                  id="lang-en-btn"
                  onClick={() => onLanguageChange('en')}
                  className={`px-2 py-1 rounded-md transition-colors ${
                    lang === 'en'
                      ? 'bg-emerald-600 text-white font-semibold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                  title="English"
                >
                  EN
                </button>
              </div>
            </div>

            {/* Direct Word Export in Navbar when content exists */}
            {hasContent && (
              <button
                type="button"
                id="navbar-download-docx"
                onClick={onDownloadDocx}
                className="hidden md:inline-flex items-center px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Word (.docx)
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
