import { useState, useMemo, useCallback } from 'react';
import {
  FileText,
  FileCheck,
  Download,
  Copy,
  Check,
  Sparkles,
  Layers,
  Settings2,
} from 'lucide-react';
import { Navbar } from './components/Navbar';
import { StatsBanner } from './components/StatsBanner';
import { RawInputSection } from './components/RawInputSection';
import { SettingsPanel } from './components/SettingsPanel';
import { WordPreview } from './components/WordPreview';
import { CleanTextView } from './components/CleanTextView';
import { BreakdownTable } from './components/BreakdownTable';
import { Lang, translations } from './utils/i18n';
import { SAMPLE_CHATS } from './data/sampleChats';
import {
  parseWhatsAppText,
  getCleanedMessages,
  formatOutputText,
} from './utils/whatsappParser';
import { downloadDocxFile } from './utils/docxExporter';
import { CleanOptions, DocxOptions } from './types';

export default function App() {
  const [lang, setLang] = useState<Lang>('ur');
  // Initialize with the realistic Urdu sample chat highlighting Jameel Noori Nastaleeq
  const [rawText, setRawText] = useState<string>(SAMPLE_CHATS[0].content);
  const [activeTab, setActiveTab] = useState<'clean_text' | 'word_preview' | 'breakdown'>('word_preview');
  const [showSettings, setShowSettings] = useState<boolean>(true);
  const [isCopied, setIsCopied] = useState<boolean>(false);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);

  const [cleanOptions, setCleanOptions] = useState<CleanOptions>({
    outputMode: 'text_only', // Default to pure message text only
    selectedSender: 'all',
    removeSystemMessages: true,
    removeMediaNotices: true,
    removeEmptyLines: true,
    mergeConsecutiveSender: false,
    trimWhitespace: true,
  });

  const [docxOptions, setDocxOptions] = useState<DocxOptions>({
    docTitle: 'واٹس ایپ پیغامات',
    includeTitleInDoc: true,
    fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif",
    fontSizePt: 14,
    lineSpacing: 1.5,
    addMessageDivider: false,
    authorName: 'WhatsApp to Word Cleaner',
  });

  const t = translations[lang];

  // Parse raw text
  const parseResult = useMemo(() => {
    return parseWhatsAppText(rawText);
  }, [rawText]);

  // Cleaned message list
  const cleanedItems = useMemo(() => {
    return getCleanedMessages(parseResult.messages, cleanOptions);
  }, [parseResult.messages, cleanOptions]);

  // Format clean string
  const cleanString = useMemo(() => {
    return formatOutputText(cleanedItems, cleanOptions.outputMode);
  }, [cleanedItems, cleanOptions.outputMode]);

  // Copy to clipboard
  const handleCopyCleanText = useCallback(async () => {
    if (!cleanString) return;
    try {
      await navigator.clipboard.writeText(cleanString);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = cleanString;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    }
  }, [cleanString]);

  // Download Word docx
  const handleDownloadDocx = useCallback(async () => {
    if (cleanedItems.length === 0) return;
    setIsExportingDocx(true);
    try {
      await downloadDocxFile(
        cleanedItems,
        cleanOptions.outputMode,
        docxOptions,
        docxOptions.docTitle || 'WhatsApp_Cleaned_Doc'
      );
    } catch (err) {
      console.error('Failed to export docx:', err);
    } finally {
      setIsExportingDocx(false);
    }
  }, [cleanedItems, cleanOptions.outputMode, docxOptions]);

  // Download plain text
  const handleDownloadTxt = useCallback(() => {
    if (!cleanString) return;
    const blob = new Blob([cleanString], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(docxOptions.docTitle || 'whatsapp_clean').replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }, [cleanString, docxOptions.docTitle]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        onSelectSample={(content) => setRawText(content)}
        hasContent={cleanedItems.length > 0}
        onDownloadDocx={handleDownloadDocx}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 space-y-5">
        {/* Banner with user-centric instruction & metrics */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-800 rounded-2xl p-4 sm:p-6 text-white shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1 max-w-2xl">
            <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-700/80 text-emerald-100 mb-1 border border-emerald-600">
              <Sparkles className="w-3.5 h-3.5 mr-1 text-amber-300" />
              {lang === 'ur'
                ? 'خودکار وقت اور تاریخ ہٹانے والا سسٹم'
                : lang === 'my'
                ? 'နာရီနှင့် ရက်စွဲများ အလိုအလျောက် သန့်စင်စနစ်'
                : 'Automatic Timestamp Stripper'}
            </div>
            <h2 className="text-lg sm:text-xl font-bold tracking-tight">
              {lang === 'ur'
                ? 'واٹس ایپ سے خالص پیغامات مائیکروسافٹ ورڈ (.docx) میں حاصل کریں'
                : lang === 'my'
                ? 'WhatsApp မှ စာသီးသန့်ကို Microsoft Word (.docx) အဖြစ် ဖန်တီးပါ'
                : 'Extract Pure WhatsApp Messages directly into Microsoft Word (.docx)'}
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed">
              {lang === 'ur'
                ? 'واٹس ایپ سے کاپی کرتے وقت آنے والے اوقات، تاریخیں اور فالتو نوٹس خودکار طور پر ہٹا کر صرف اصل پیغامات کو خوبصورت جمیل نوری نستعلیق خطاطی کے ساتھ مائیکروسافٹ ورڈ میں محفوظ کریں۔'
                : lang === 'my'
                ? 'WhatsApp မှ ကူးယူလိုက်သောအခါ ပါလာသည့် နာရီ၊ ရက်စွဲ၊ ပို့သူအမည်များကို အလိုအလျောက်ဖယ်ရှားပေးပြီး သန့်စင်ပြီးသား စာများကိုသာ Microsoft Word ဖိုင်အဖြစ် ဒေါင်းလုဒ် ရယူနိုင်ပါသည်။'
                : 'Strip away clocks, bracketed timestamps, dates, and unwanted media placeholders. Export only the pure clean messages into a genuine Word document.'}
            </p>
          </div>

          {/* Quick Action buttons */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 shrink-0 w-full md:w-auto">
            <button
              type="button"
              id="hero-copy-clean-btn"
              onClick={handleCopyCleanText}
              disabled={cleanedItems.length === 0}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all shadow-xs ${
                isCopied
                  ? 'bg-emerald-500 text-white'
                  : 'bg-white text-emerald-950 hover:bg-emerald-50 disabled:opacity-50'
              }`}
            >
              {isCopied ? (
                <>
                  <Check className="w-4 h-4 mr-1.5 text-white" />
                  {lang === 'my' ? 'ကော်ပီကူးပြီး!' : 'Copied!'}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-1.5 text-emerald-700" />
                  {t.copyCleanTextBtn}
                </>
              )}
            </button>

            <button
              type="button"
              id="hero-download-docx-btn"
              onClick={handleDownloadDocx}
              disabled={cleanedItems.length === 0 || isExportingDocx}
              className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-xs transition-all disabled:opacity-50 cursor-pointer"
            >
              <Download className="w-4 h-4 mr-1.5 text-slate-900" />
              {isExportingDocx
                ? (lang === 'my' ? 'ထုတ်လုပ်နေသည်...' : 'Generating...')
                : t.downloadDocxBtn}
            </button>
          </div>
        </div>

        {/* Live Metrics */}
        <StatsBanner
          lang={lang}
          timestampsRemoved={parseResult.timestampsRemovedCount}
          messagesCount={cleanedItems.length}
          sendersCount={parseResult.senders.length}
          rawLines={parseResult.totalRawLines}
        />

        {/* Workspace Layout: Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Raw Input (5 cols on large screens) */}
          <div className="lg:col-span-5 space-y-4">
            <RawInputSection
              lang={lang}
              rawText={rawText}
              onChangeText={setRawText}
              onClear={() => setRawText('')}
              onLoadSample={() => setRawText(SAMPLE_CHATS[0].content)}
              detectedFormatLabel={
                parseResult.timestampsRemovedCount > 0
                  ? `${parseResult.timestampsRemovedCount} timestamps detected`
                  : undefined
              }
            />

            {/* Quick Toggle for Settings */}
            <div className="flex items-center justify-between px-1">
              <button
                type="button"
                id="toggle-settings-btn"
                onClick={() => setShowSettings(!showSettings)}
                className="inline-flex items-center text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <Settings2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                {showSettings
                  ? (lang === 'my' ? 'ပြင်ဆင်ချက်များ ဝှက်ထားမည်' : 'Hide Customization Options')
                  : (lang === 'my' ? 'ပြင်ဆင်ချက်များ ပြန်ဖွင့်မည်' : 'Show Customization Options')}
              </button>
              <span className="text-[11px] text-slate-400">
                Mode: {cleanOptions.outputMode === 'text_only' ? 'Text Only' : cleanOptions.outputMode}
              </span>
            </div>

            {/* Collapsible Settings Panel */}
            {showSettings && (
              <SettingsPanel
                lang={lang}
                cleanOptions={cleanOptions}
                onChangeCleanOptions={setCleanOptions}
                docxOptions={docxOptions}
                onChangeDocxOptions={setDocxOptions}
                senders={parseResult.senders}
              />
            )}
          </div>

          {/* Right Column: Clean Results & Word Preview (7 cols on large screens) */}
          <div className="lg:col-span-7 space-y-3">
            {/* View Tabs */}
            <div className="bg-white rounded-xl border border-slate-200 p-1.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center space-x-1 sm:space-x-1.5">
                <button
                  type="button"
                  id="tab-word-preview"
                  onClick={() => setActiveTab('word_preview')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'word_preview'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5 mr-1.5" />
                  {t.docPreviewTab}
                </button>

                <button
                  type="button"
                  id="tab-clean-text"
                  onClick={() => setActiveTab('clean_text')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'clean_text'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <FileCheck className="w-3.5 h-3.5 mr-1.5" />
                  {t.cleanViewTab}
                </button>

                <button
                  type="button"
                  id="tab-breakdown"
                  onClick={() => setActiveTab('breakdown')}
                  className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all ${
                    activeTab === 'breakdown'
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5 mr-1.5" />
                  {t.breakdownTab}
                </button>
              </div>

              {/* Action buttons inside tab bar */}
              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  id="tab-copy-btn"
                  onClick={handleCopyCleanText}
                  disabled={cleanedItems.length === 0}
                  className={`p-1.5 rounded-lg border text-xs transition-colors ${
                    isCopied
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                  title={t.copyCleanTextBtn}
                >
                  {isCopied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>

                <button
                  type="button"
                  id="tab-download-docx-btn"
                  onClick={handleDownloadDocx}
                  disabled={cleanedItems.length === 0 || isExportingDocx}
                  className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs transition-colors disabled:opacity-50"
                  title="Download .docx"
                >
                  <Download className="w-3.5 h-3.5 mr-1" />
                  Word
                </button>
              </div>
            </div>

            {/* Active Tab View */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              {activeTab === 'word_preview' && (
                <WordPreview
                  lang={lang}
                  items={cleanedItems}
                  outputMode={cleanOptions.outputMode}
                  docxOptions={docxOptions}
                  onDownloadDocx={handleDownloadDocx}
                />
              )}

              {activeTab === 'clean_text' && (
                <CleanTextView
                  lang={lang}
                  cleanText={cleanString}
                  onCopy={handleCopyCleanText}
                  isCopied={isCopied}
                  onDownloadTxt={handleDownloadTxt}
                />
              )}

              {activeTab === 'breakdown' && (
                <BreakdownTable
                  lang={lang}
                  messages={parseResult.messages}
                />
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 px-4 text-center text-xs text-slate-500">
        <p>
          WhatsApp to Word Cleaner • Generates standard Microsoft Word (.docx) files
          compatible with Microsoft Word, Office 365, Google Docs, and LibreOffice.
        </p>
      </footer>
    </div>
  );
}
