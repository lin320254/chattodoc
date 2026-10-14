import React, { useRef, useState } from 'react';
import { Clipboard, Upload, Trash2, Sparkles, FileText, CheckCircle2 } from 'lucide-react';
import { Lang, translations } from '../utils/i18n';

interface RawInputSectionProps {
  lang: Lang;
  rawText: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  onLoadSample: () => void;
  detectedFormatLabel?: string;
}

export const RawInputSection: React.FC<RawInputSectionProps> = ({
  lang,
  rawText,
  onChangeText,
  onClear,
  onLoadSample,
  detectedFormatLabel,
}) => {
  const t = translations[lang];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pasteNotice, setPasteNotice] = useState(false);

  const handlePasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        onChangeText(text);
        setPasteNotice(true);
        setTimeout(() => setPasteNotice(false), 2000);
      }
    } catch {
      // Fallback: prompt or focus textarea
      const el = document.getElementById('whatsapp-raw-textarea');
      el?.focus();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    readFile(file);
  };

  const readFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        onChangeText(content);
      }
    };
    reader.readAsText(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      readFile(file);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-full overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
        <div className="flex items-center space-x-2">
          <FileText className="w-4 h-4 text-emerald-600" />
          <h2 className="text-sm font-bold text-slate-800 tracking-tight">
            {t.inputHeader}
          </h2>
          {detectedFormatLabel && (
            <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-100 text-emerald-800">
              {detectedFormatLabel}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5 sm:space-x-2">
          <button
            type="button"
            id="paste-clipboard-btn"
            onClick={handlePasteFromClipboard}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            title="Paste from clipboard"
          >
            {pasteNotice ? (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
            ) : (
              <Clipboard className="w-3.5 h-3.5 mr-1" />
            )}
            {t.pasteBtn}
          </button>

          <button
            type="button"
            id="upload-file-btn"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-lg text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 transition-colors"
            title="Upload .txt chat file"
          >
            <Upload className="w-3.5 h-3.5 mr-1 text-slate-500" />
            <span className="hidden xs:inline">.txt</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".txt,text/plain"
            className="hidden"
          />

          {rawText && (
            <button
              type="button"
              id="clear-input-btn"
              onClick={onClear}
              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
              title={t.clearBtn}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Textarea container with dropzone */}
      <div
        className={`relative flex-1 p-3 transition-colors ${
          isDragging ? 'bg-emerald-50/50' : 'bg-white'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <textarea
          id="whatsapp-raw-textarea"
          value={rawText}
          onChange={(e) => onChangeText(e.target.value)}
          placeholder={t.inputPlaceholder}
          className="w-full h-full min-h-[300px] lg:min-h-[460px] p-2 text-sm text-slate-800 placeholder-slate-400 bg-transparent border-0 resize-none focus:outline-none focus:ring-0 leading-relaxed"
          style={{
            fontFamily: "'Jameel Noori Nastaleeq', 'Noto Nastaliq Urdu', 'Noto Sans Myanmar', 'Pyidaungsu', monospace",
            direction: lang === 'ur' ? 'rtl' : 'ltr',
          }}
          spellCheck={false}
        />

        {/* Empty state hint */}
        {!rawText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
              <Clipboard className="w-6 h-6" />
            </div>
            <p className="text-sm font-medium text-slate-700 max-w-xs mb-1">
              {t.emptyNotice}
            </p>
            <p className="text-xs text-slate-400 max-w-xs mb-4">
              {t.dragDropText}
            </p>
            <button
              type="button"
              onClick={onLoadSample}
              className="pointer-events-auto inline-flex items-center px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1.5" />
              {t.loadSampleBtn}
            </button>
          </div>
        )}
      </div>

      {/* Footer bar */}
      <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-500 flex justify-between items-center">
        <span>
          {rawText.length > 0
            ? `${rawText.length.toLocaleString()} characters • ${rawText.split('\n').length} lines`
            : 'Ready for input'}
        </span>
        <span className="text-slate-400">
          Supports iOS, Android, and Web WhatsApp
        </span>
      </div>
    </div>
  );
};
