import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Type,
  Filter,
  Check,
  ChevronDown,
  Sparkles,
  Eye,
  Edit3,
  RotateCcw,
} from 'lucide-react';
import { CleanOptions, DocxOptions, OutputMode } from '../types';
import { Lang, translations } from '../utils/i18n';

interface SettingsPanelProps {
  lang: Lang;
  cleanOptions: CleanOptions;
  onChangeCleanOptions: (options: CleanOptions) => void;
  docxOptions: DocxOptions;
  onChangeDocxOptions: (options: DocxOptions) => void;
  senders: string[];
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  lang,
  cleanOptions,
  onChangeCleanOptions,
  docxOptions,
  onChangeDocxOptions,
  senders,
}) => {
  const t = translations[lang];

  const [sampleScript, setSampleScript] = useState<'auto' | 'ur' | 'my' | 'en' | 'custom'>('auto');
  const [customText, setCustomText] = useState<string>('');

  const isNastaleeq =
    docxOptions.fontFamily.includes('Nastaleeq') ||
    docxOptions.fontFamily.includes('Urdu');
  const isMyanmar =
    docxOptions.fontFamily.includes('Pyidaungsu') ||
    docxOptions.fontFamily.includes('Myanmar');

  // Determine script for preview sample
  const effectiveScript =
    sampleScript === 'auto'
      ? isNastaleeq
        ? 'ur'
        : isMyanmar
        ? 'my'
        : lang === 'ur'
        ? 'ur'
        : lang === 'my'
        ? 'my'
        : 'en'
      : sampleScript;

  const isRtl =
    effectiveScript === 'ur' || (sampleScript === 'auto' && isNastaleeq);

  const fontDisplayName = (() => {
    if (docxOptions.fontFamily.includes('Nastaleeq'))
      return 'Jameel Noori Nastaleeq (جمیل نوری نستعلیق)';
    if (docxOptions.fontFamily.includes('Pyidaungsu'))
      return 'Pyidaungsu (ပြည်ထောင်စု ယူနီကုဒ်)';
    if (docxOptions.fontFamily.includes('Calibri'))
      return 'Calibri (Standard Word)';
    if (docxOptions.fontFamily.includes('Arial')) return 'Arial';
    if (docxOptions.fontFamily.includes('Times New Roman'))
      return 'Times New Roman';
    if (docxOptions.fontFamily.includes('Segoe UI')) return 'Segoe UI';
    if (docxOptions.fontFamily.includes('Georgia')) return 'Georgia';
    return docxOptions.fontFamily;
  })();

  const sampleTexts = {
    ur: 'السلام علیکم ورحمۃ اللہ وبرکاتہ! تمام انسان آزادی، وقار اور حقوق کے اعتبار سے برابر پیدا ہوئے ہیں۔ یہ مائیکروسافٹ ورڈ (.docx) میں جمیل نوری نستعلیق خطاطی کا حقیقی نمونہ ہے۔ ۱۲۳۴۵۶۷۸۹۰',
    my: 'မင်္ဂလာပါခင်ဗျာ! လူတိုင်းသည် လွတ်လပ်စွာ မွေးဖွားလာကြပြီး ဂုဏ်သိက္ခာနှင့် အခွင့်အရေးများ တူညီကြသည်။ ဤစာသားသည် Microsoft Word (.docx) ဖိုင်တွင် ပြည်ထောင်စု ဖောင့်ဖြင့် ပေါ်လာမည့် ပုံစံနမူနာ ဖြစ်ပါသည်။ ၀၁၂၃၄၅၆၇၈၉',
    en: 'The quick brown fox jumps over the lazy dog. WhatsApp exported dialogue sample with numbers 0123456789 and clean punctuation.',
  };

  const sampleSecondTexts = {
    ur: 'وعلیکم السلام! الحمدللہ، تمام پیغامات وقت اور تاریخ کے بغیر بالکل صاف تیار ہو چکے ہیں۔',
    my: 'ဟုတ်ကဲ့ခင်ဗျာ၊ မင်္ဂလာပါ! စာရွက်စာတမ်းအားလုံး နာရီနှင့် ရက်စွဲများ ဖယ်ရှားပြီး အဆင်သင့် ဖြစ်ပါပြီ။',
    en: 'Clean messages are ready to export without clocks or bracketed timestamps.',
  };

  const updateCleanOption = <K extends keyof CleanOptions>(
    key: K,
    val: CleanOptions[K]
  ) => {
    onChangeCleanOptions({
      ...cleanOptions,
      [key]: val,
    });
  };

  const updateDocxOption = <K extends keyof DocxOptions>(
    key: K,
    val: DocxOptions[K]
  ) => {
    onChangeDocxOptions({
      ...docxOptions,
      [key]: val,
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-5 space-y-6">
      {/* 1. Output Format Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center">
            <Sliders className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
            {t.outputModeLabel}
          </label>
          <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-medium">
            4 Modes
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {/* Fatwa A4 Layout (The user's direct request) */}
          <button
            type="button"
            id="mode-fatwa-a4-btn"
            onClick={() => updateCleanOption('outputMode', 'fatwa_a4')}
            className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all relative ${
              cleanOptions.outputMode === 'fatwa_a4'
                ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/25 text-emerald-950 font-medium shadow-xs'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-emerald-600 inline" />
                {t.modeFatwaA4}
              </span>
              {cleanOptions.outputMode === 'fatwa_a4' && (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t.modeFatwaA4Desc}
            </p>
          </button>

          {/* Text Only */}
          <button
            type="button"
            id="mode-text-only-btn"
            onClick={() => updateCleanOption('outputMode', 'text_only')}
            className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all relative ${
              cleanOptions.outputMode === 'text_only'
                ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-emerald-950 font-medium'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-900 flex items-center">
                {t.modeTextOnly}
              </span>
              {cleanOptions.outputMode === 'text_only' && (
                <div className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t.modeTextOnlyDesc}
            </p>
          </button>

          {/* Sender + Text */}
          <button
            type="button"
            id="mode-sender-text-btn"
            onClick={() => updateCleanOption('outputMode', 'sender_and_text')}
            className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all relative ${
              cleanOptions.outputMode === 'sender_and_text'
                ? 'border-blue-600 bg-blue-50/50 ring-2 ring-blue-500/20 text-blue-950 font-medium'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-900">
                {t.modeSenderText}
              </span>
              {cleanOptions.outputMode === 'sender_and_text' && (
                <div className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t.modeSenderTextDesc}
            </p>
          </button>

          {/* Formatted Chat */}
          <button
            type="button"
            id="mode-formatted-chat-btn"
            onClick={() => updateCleanOption('outputMode', 'formatted_chat')}
            className={`text-left p-3 rounded-xl border text-xs sm:text-sm transition-all relative ${
              cleanOptions.outputMode === 'formatted_chat'
                ? 'border-purple-600 bg-purple-50/50 ring-2 ring-purple-500/20 text-purple-950 font-medium'
                : 'border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50/50'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-semibold text-slate-900">
                {t.modeFormattedChat}
              </span>
              {cleanOptions.outputMode === 'formatted_chat' && (
                <div className="w-4 h-4 rounded-full bg-purple-600 text-white flex items-center justify-center shrink-0">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-normal">
              {t.modeFormattedChatDesc}
            </p>
          </button>
        </div>

        {/* Fatwa Specific Configuration Card (When Fatwa A4 Mode is selected) */}
        {cleanOptions.outputMode === 'fatwa_a4' && (
          <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200 space-y-3.5 animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-emerald-200/60 pb-2.5">
              <span className="text-xs font-bold text-emerald-950 flex items-center">
                <Sparkles className="w-3.5 h-3.5 mr-1.5 text-emerald-600" />
                {t.fatwaSettingsSection}
              </span>
              <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full border border-emerald-200">
                {lang === 'my'
                  ? 'A4 တစ်မျက်နှာလျှင် ၃ ကြောင်းတိတိ'
                  : lang === 'ur'
                  ? '۳ فتاویٰ فی A4 صفحہ'
                  : '3 Items Strictly Per A4 Page'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
              {/* Header template input */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700">
                    {t.fatwaHeaderLabel}
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      updateDocxOption(
                        'fatwaHeaderTemplate',
                        'تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب'
                      )
                    }
                    className="text-[10px] text-emerald-700 hover:underline flex items-center"
                  >
                    <RotateCcw className="w-2.5 h-2.5 mr-1" />
                    {t.resetHeaderBtn}
                  </button>
                </div>
                <input
                  type="text"
                  value={
                    docxOptions.fatwaHeaderTemplate !== undefined
                      ? docxOptions.fatwaHeaderTemplate
                      : 'تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب'
                  }
                  onChange={(e) =>
                    updateDocxOption('fatwaHeaderTemplate', e.target.value)
                  }
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium text-right"
                  dir="rtl"
                  placeholder="تاریخ: ــــــــــــــــــ فتوی نمبر: ــــــــــــــــ باب"
                />
                <p className="text-[10px] text-slate-500">
                  {lang === 'my'
                    ? 'စာတစ်ကြောင်းစီရဲ့ အပေါ်တွင် ဤခေါင်းစဉ်စာတန်းကို အလိုအလျောက် ထည့်သွင်းပေးပါမည်။'
                    : 'یہ سرخی ہر شرعی سوال یا فتویٰ کے آغاز میں ظاہر ہوگی۔'}
                </p>
              </div>

              {/* Items per A4 Page + Sender Prefix */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.itemsPerPageLabel}
                  </label>
                  <select
                    value={docxOptions.itemsPerPage || 3}
                    onChange={(e) =>
                      updateDocxOption('itemsPerPage', Number(e.target.value))
                    }
                    className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-semibold"
                  >
                    <option value={3}>3 ({t.itemsPerPageThree})</option>
                    <option value={1}>1 Item</option>
                    <option value={2}>2 Items</option>
                    <option value={4}>4 Items</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {t.senderPrefixLabel}
                  </label>
                  <input
                    type="text"
                    value={
                      docxOptions.senderLabelPrefix !== undefined
                        ? docxOptions.senderLabelPrefix
                        : 'سائل: '
                    }
                    onChange={(e) =>
                      updateDocxOption('senderLabelPrefix', e.target.value)
                    }
                    className="w-full bg-white border border-emerald-300 rounded-lg px-2.5 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-right"
                    dir="rtl"
                    placeholder="سائل: "
                  />
                </div>
              </div>
            </div>

            {/* Checkboxes: Sender at bottom & Zero gap */}
            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs border-t border-emerald-200/50">
              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={docxOptions.senderAtBottom !== false}
                  onChange={(e) =>
                    updateDocxOption('senderAtBottom', e.target.checked)
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>{t.senderAtBottomLabel}</span>
              </label>

              <label className="flex items-center space-x-2 text-slate-700 cursor-pointer font-medium select-none">
                <input
                  type="checkbox"
                  checked={docxOptions.zeroGapSender !== false}
                  onChange={(e) =>
                    updateDocxOption('zeroGapSender', e.target.checked)
                  }
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span className="text-emerald-950 font-semibold">
                  {t.zeroGapLabel}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-normal">
                  Active
                </span>
              </label>
            </div>

            {/* Dynamic Page Numbering & 3-Items Count Reset Controls */}
            <div className="pt-2.5 border-t border-emerald-200/60 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-emerald-950">
                  {t.dynamicPageNumberingSection}
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono font-medium">
                  Dynamic Fields
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <label className="flex items-start space-x-2 text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docxOptions.resetItemCountPerPage !== false}
                    onChange={(e) =>
                      updateDocxOption('resetItemCountPerPage', e.target.checked)
                    }
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {t.resetItemCountPerPageLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {t.resetItemCountPerPageHint}
                    </span>
                  </div>
                </label>

                <label className="flex items-start space-x-2 text-slate-700 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={docxOptions.includeItemNumberInHeader !== false}
                    onChange={(e) =>
                      updateDocxOption('includeItemNumberInHeader', e.target.checked)
                    }
                    className="w-4 h-4 mt-0.5 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <div>
                    <span className="font-semibold text-slate-800 block">
                      {t.includeItemNumberInHeaderLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 block leading-tight">
                      {lang === 'ur'
                        ? 'مثال: فتوی نمبر: ۱ (۱/۳)، فتوی نمبر: ۲ (۲/۳)'
                        : lang === 'my'
                        ? 'ဥပမာ: ဖသ်ဝါနံပါတ်: ၁ (၁/၃)၊ ၂ (၂/၃)'
                        : 'e.g. Fatwa #1 (1/3), #2 (2/3)'}
                    </span>
                  </div>
                </label>
              </div>

              {/* Word Footer Page Numbering Settings */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 bg-white/70 p-2.5 rounded-lg border border-emerald-200/70">
                <label className="flex items-center space-x-2 text-slate-700 cursor-pointer select-none font-medium">
                  <input
                    type="checkbox"
                    checked={docxOptions.enablePageNumbering !== false}
                    onChange={(e) =>
                      updateDocxOption('enablePageNumbering', e.target.checked)
                    }
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                  />
                  <span>{t.enableWordPageNumbering}</span>
                </label>

                {docxOptions.enablePageNumbering !== false && (
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] text-slate-500 font-medium">
                      {t.pageNumberFormatLabel}:
                    </span>
                    <select
                      value={docxOptions.pageNumberFormat || 'page_of_total'}
                      onChange={(e) =>
                        updateDocxOption(
                          'pageNumberFormat',
                          e.target.value as 'page_of_total' | 'simple_dash'
                        )
                      }
                      className="bg-white border border-emerald-300 rounded-md px-2 py-0.5 text-[11px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    >
                      <option value="page_of_total">{t.pageNumberFormatFull}</option>
                      <option value="simple_dash">{t.pageNumberFormatSimple}</option>
                    </select>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Sender Filter & Fast Cleaning Toggles */}
      <div className="pt-4 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Sender Filter */}
        <div>
          <label className="text-xs font-semibold text-slate-700 flex items-center mb-1.5">
            <Filter className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
            {t.filterSenderLabel}
          </label>
          <div className="relative">
            <select
              id="sender-filter-select"
              value={cleanOptions.selectedSender}
              onChange={(e) => updateCleanOption('selectedSender', e.target.value)}
              className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 pr-8 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 appearance-none font-medium"
            >
              <option value="all">{t.allSenders}</option>
              {senders.map((s, idx) => (
                <option key={idx} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* Cleaning Checkboxes */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-slate-700 block mb-1">
            {t.cleaningOptions}
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={cleanOptions.removeSystemMessages}
                onChange={(e) =>
                  updateCleanOption('removeSystemMessages', e.target.checked)
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>{t.removeSysMsg}</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={cleanOptions.removeMediaNotices}
                onChange={(e) =>
                  updateCleanOption('removeMediaNotices', e.target.checked)
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>{t.removeMediaNotices}</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={cleanOptions.removeEmptyLines}
                onChange={(e) =>
                  updateCleanOption('removeEmptyLines', e.target.checked)
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>{t.removeEmptyLines}</span>
            </label>

            <label className="flex items-center space-x-2 text-slate-600 cursor-pointer hover:text-slate-900 select-none">
              <input
                type="checkbox"
                checked={cleanOptions.mergeConsecutiveSender}
                onChange={(e) =>
                  updateCleanOption('mergeConsecutiveSender', e.target.checked)
                }
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <span>{t.mergeConsecutive}</span>
            </label>
          </div>
        </div>
      </div>

      {/* 3. Word Document Formatting Details */}
      <div className="pt-4 border-t border-slate-100">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center mb-3">
          <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
          {t.docSettings}
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs sm:text-sm">
          {/* Doc Title */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.docTitleLabel}
            </label>
            <input
              type="text"
              id="docx-title-input"
              value={docxOptions.docTitle}
              onChange={(e) => updateDocxOption('docTitle', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="WhatsApp Export"
            />
          </div>

          {/* Font Family (Urdu Nastaleeq, Myanmar Unicode, & English) */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.fontFamilyLabel}
            </label>
            <select
              id="docx-font-select"
              value={docxOptions.fontFamily}
              onChange={(e) => updateDocxOption('fontFamily', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
            >
              <option value="'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', serif">
                Jameel Noori Nastaleeq (جمیل نوری نستعلیق)
              </option>
              <option value="Pyidaungsu, Arial">Pyidaungsu (မြန်မာ ယူနီကုဒ်)</option>
              <option value="Calibri">Calibri (Standard)</option>
              <option value="Arial">Arial</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Georgia">Georgia</option>
            </select>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.fontSizeLabel}
            </label>
            <select
              id="docx-size-select"
              value={docxOptions.fontSizePt}
              onChange={(e) => updateDocxOption('fontSizePt', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={11}>11 pt (Compact)</option>
              <option value={12}>12 pt (Standard Word)</option>
              <option value={14}>14 pt (Large)</option>
              <option value={16}>16 pt (Extra Large)</option>
            </select>
          </div>

          {/* Line Spacing */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              {t.lineSpacingLabel}
            </label>
            <select
              id="docx-spacing-select"
              value={docxOptions.lineSpacing}
              onChange={(e) => updateDocxOption('lineSpacing', Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1.15}>1.15 (Default)</option>
              <option value={1.5}>1.5 (Comfortable)</option>
              <option value={2.0}>2.0 (Double Space)</option>
            </select>
          </div>
        </div>

        {/* Extra Toggles */}
        <div className="flex flex-wrap items-center gap-4 mt-3 pt-2 text-xs">
          <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              id="docx-include-title-toggle"
              checked={docxOptions.includeTitleInDoc}
              onChange={(e) =>
                updateDocxOption('includeTitleInDoc', e.target.checked)
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>{t.includeTitleLabel}</span>
          </label>

          <label className="flex items-center space-x-2 text-slate-600 cursor-pointer">
            <input
              type="checkbox"
              id="docx-add-divider-toggle"
              checked={docxOptions.addMessageDivider}
              onChange={(e) =>
                updateDocxOption('addMessageDivider', e.target.checked)
              }
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
            />
            <span>{t.addDividerLabel}</span>
          </label>
        </div>

        {/* 4. Font Preview Sample (Shows live rendering of chosen Word font) */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex items-center flex-wrap gap-2">
              <span className="flex items-center text-xs font-bold uppercase tracking-wider text-slate-700">
                <Eye className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                {t.fontPreviewLabel}
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                <Type className="w-3 h-3 mr-1 text-blue-600" />
                {fontDisplayName}
              </span>
            </div>

            {/* Spec Badges */}
            <div className="flex items-center flex-wrap gap-1.5 text-[11px]">
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                {docxOptions.fontSizePt} pt
              </span>
              <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-mono font-medium">
                {docxOptions.lineSpacing}x space
              </span>
              <span
                className={`px-2 py-0.5 rounded font-medium ${
                  isRtl
                    ? 'bg-amber-50 text-amber-800 border border-amber-200/80'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
                }`}
              >
                {isRtl ? 'RTL (دائیں سے بائیں)' : 'LTR (Left-to-Right)'}
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-500 mb-2.5">
            {t.fontPreviewHint}
          </p>

          {/* Sample Text Selector Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 mb-2.5 text-xs">
            <button
              type="button"
              onClick={() => setSampleScript('auto')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sampleScript === 'auto'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              ✨ Auto ({isNastaleeq ? 'اردو' : isMyanmar ? 'မြန်မာ' : 'Default'})
            </button>
            <button
              type="button"
              onClick={() => setSampleScript('ur')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sampleScript === 'ur'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.fontPreviewQuickUrdu}
            </button>
            <button
              type="button"
              onClick={() => setSampleScript('my')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sampleScript === 'my'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.fontPreviewQuickMyanmar}
            </button>
            <button
              type="button"
              onClick={() => setSampleScript('en')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                sampleScript === 'en'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.fontPreviewQuickEn}
            </button>
            <button
              type="button"
              onClick={() => setSampleScript('custom')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center ${
                sampleScript === 'custom'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Edit3 className="w-3 h-3 mr-1" />
              {lang === 'ur'
                ? 'اپنی تحریر'
                : lang === 'my'
                ? 'စိတ်ကြိုက်စာသား'
                : 'Custom'}
            </button>
          </div>

          {/* Realistic Word Paper Preview Box */}
          <div className="border border-blue-200/80 rounded-xl bg-white shadow-xs overflow-hidden">
            {/* Paper Header / Ruler bar */}
            <div className="bg-slate-50 border-b border-slate-100 px-3.5 py-1.5 flex items-center justify-between text-[11px] text-slate-500">
              <span className="flex items-center font-medium text-slate-600">
                <FileText className="w-3 h-3 mr-1.5 text-blue-500" />
                Microsoft Word (.docx) Paper Simulation
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {docxOptions.fontFamily.split(',')[0].replace(/'/g, '')} • {docxOptions.fontSizePt}pt
              </span>
            </div>

            {/* Document Content View */}
            <div className="p-4 sm:p-5 bg-white transition-all min-h-[110px]">
              {/* Optional Title rendered in chosen font */}
              {docxOptions.includeTitleInDoc && (
                <div
                  className="font-bold text-slate-900 border-b border-slate-100 pb-2 mb-3 text-center transition-all"
                  style={{
                    fontFamily: docxOptions.fontFamily,
                    fontSize: `${Math.round(docxOptions.fontSizePt * 1.35)}pt`,
                    direction: isRtl ? 'rtl' : 'ltr',
                    lineHeight: isNastaleeq ? '2.0' : '1.3',
                  }}
                >
                  {docxOptions.docTitle.trim() || 'WhatsApp Export'}
                </div>
              )}

              {/* Sample Body Text */}
              {sampleScript === 'custom' ? (
                <div>
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value)}
                    placeholder={t.fontPreviewEditPrompt}
                    rows={3}
                    className="w-full p-2.5 rounded-lg border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50 resize-y"
                    style={{
                      fontFamily: docxOptions.fontFamily,
                      fontSize: `${docxOptions.fontSizePt}pt`,
                      lineHeight:
                        isNastaleeq && isRtl
                          ? Math.max(docxOptions.lineSpacing, 2.0)
                          : docxOptions.lineSpacing,
                      direction: isRtl ? 'rtl' : 'ltr',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  />
                  <p className="text-[11px] text-slate-400 mt-1 italic">
                    {t.fontPreviewEditPrompt}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div
                    className="text-slate-800 transition-all select-text"
                    style={{
                      fontFamily: docxOptions.fontFamily,
                      fontSize: `${docxOptions.fontSizePt}pt`,
                      lineHeight:
                        isNastaleeq && effectiveScript === 'ur'
                          ? Math.max(docxOptions.lineSpacing, 2.1)
                          : docxOptions.lineSpacing,
                      direction: isRtl ? 'rtl' : 'ltr',
                      textAlign: isRtl ? 'right' : 'left',
                    }}
                  >
                    {sampleTexts[effectiveScript as 'ur' | 'my' | 'en'] ||
                      sampleTexts.en}
                  </div>

                  {/* If message divider toggle is on, show divider + reply sample */}
                  {docxOptions.addMessageDivider && (
                    <div className="pt-2">
                      <div className="border-b border-slate-200/80 mb-2" />
                      <div
                        className="text-slate-700 transition-all select-text"
                        style={{
                          fontFamily: docxOptions.fontFamily,
                          fontSize: `${docxOptions.fontSizePt}pt`,
                          lineHeight:
                            isNastaleeq && effectiveScript === 'ur'
                              ? Math.max(docxOptions.lineSpacing, 2.1)
                              : docxOptions.lineSpacing,
                          direction: isRtl ? 'rtl' : 'ltr',
                          textAlign: isRtl ? 'right' : 'left',
                        }}
                      >
                        {sampleSecondTexts[effectiveScript as 'ur' | 'my' | 'en'] ||
                          sampleSecondTexts.en}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Footnote explanation about font embedding in Word */}
            <div className="bg-slate-50/70 border-t border-slate-100 px-3.5 py-2 text-[11px] text-slate-500 flex items-center justify-between">
              <span className="flex items-center">
                <Sparkles className="w-3 h-3 mr-1 text-amber-500 shrink-0" />
                {isNastaleeq
                  ? lang === 'ur'
                    ? 'جمیل نوری نستعلیق خطاطی ورڈ فائل میں خودکار محفوظ ہوگی۔'
                    : 'Jameel Noori Nastaleeq calligraphy will be embedded into your .docx styles.'
                  : isMyanmar
                  ? lang === 'my'
                    ? 'ပြည်ထောင်စု ယူနီကုဒ် ဖောင့်ဖြင့် Word စာရွက်ပေါ်တွင် စနစ်တကျ ပေါ်လာပါမည်။'
                    : 'Pyidaungsu Unicode font will format Myanmar consonants and tones in Word.'
                  : 'Selected font will be applied to all paragraphs in the exported Word file.'}
              </span>
              <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                Live Sync
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
