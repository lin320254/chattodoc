import React from 'react';
import { Clock, MessageSquare, Users, FileText } from 'lucide-react';
import { Lang, translations } from '../utils/i18n';

interface StatsBannerProps {
  lang: Lang;
  timestampsRemoved: number;
  messagesCount: number;
  sendersCount: number;
  rawLines: number;
}

export const StatsBanner: React.FC<StatsBannerProps> = ({
  lang,
  timestampsRemoved,
  messagesCount,
  sendersCount,
  rawLines,
}) => {
  const t = translations[lang];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {/* Timestamps Stripped */}
      <div className="bg-white border border-emerald-200/80 rounded-xl p-3.5 shadow-xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-emerald-900 tracking-tight">
            {timestampsRemoved}
          </div>
          <div className="text-xs text-emerald-700/80 font-medium truncate">
            {t.statsTimestampsRemoved}
          </div>
        </div>
      </div>

      {/* Clean Messages Count */}
      <div className="bg-white border border-blue-200/80 rounded-xl p-3.5 shadow-xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <MessageSquare className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-blue-900 tracking-tight">
            {messagesCount}
          </div>
          <div className="text-xs text-blue-700/80 font-medium truncate">
            {t.statsMessagesCount}
          </div>
        </div>
      </div>

      {/* Senders Found */}
      <div className="bg-white border border-amber-200/80 rounded-xl p-3.5 shadow-xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-amber-900 tracking-tight">
            {sendersCount}
          </div>
          <div className="text-xs text-amber-700/80 font-medium truncate">
            {t.statsSendersCount}
          </div>
        </div>
      </div>

      {/* Raw Lines Processed */}
      <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs flex items-center space-x-3">
        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
          <FileText className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <div className="text-xl font-bold text-slate-900 tracking-tight">
            {rawLines}
          </div>
          <div className="text-xs text-slate-600 font-medium truncate">
            {t.statsLinesCount}
          </div>
        </div>
      </div>
    </div>
  );
};
