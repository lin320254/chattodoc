import React from 'react';
import { WhatsAppMessage } from '../types';
import { Lang, translations } from '../utils/i18n';
import { Check, ShieldAlert, Image } from 'lucide-react';

interface BreakdownTableProps {
  lang: Lang;
  messages: WhatsAppMessage[];
}

export const BreakdownTable: React.FC<BreakdownTableProps> = ({
  lang,
  messages,
}) => {
  const t = translations[lang];

  if (messages.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-400 text-sm italic">
        {t.emptyNotice}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
      <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-700">
        <span>Parsed WhatsApp Items ({messages.length})</span>
        <span className="text-slate-500 font-normal">
          Showing timestamp removal details
        </span>
      </div>

      <div className="overflow-x-auto max-h-[560px]">
        <table className="w-full text-left border-collapse text-xs">
          <thead className="bg-slate-100/70 text-slate-600 sticky top-0 border-b border-slate-200">
            <tr>
              <th className="py-2.5 px-3 font-semibold w-12 text-center">#</th>
              <th className="py-2.5 px-3 font-semibold w-36">Original Time</th>
              <th className="py-2.5 px-3 font-semibold w-32">Sender</th>
              <th className="py-2.5 px-3 font-semibold">Clean Text Content</th>
              <th className="py-2.5 px-3 font-semibold w-24 text-center">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {messages.map((m, idx) => (
              <tr
                key={m.id || idx}
                className="hover:bg-slate-50/80 transition-colors"
              >
                <td className="py-2 px-3 text-slate-400 text-center font-mono">
                  {idx + 1}
                </td>
                <td className="py-2 px-3 text-slate-500 font-mono text-[11px]">
                  {m.timestamp ? (
                    <span className="line-through text-rose-500 bg-rose-50 px-1 py-0.5 rounded">
                      {m.timestamp}
                    </span>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
                <td className="py-2 px-3 font-medium text-slate-800">
                  {m.sender ? (
                    <span className="text-sky-700">{m.sender}</span>
                  ) : (
                    <span className="text-slate-400 italic">None</span>
                  )}
                </td>
                <td className="py-2 px-3 text-slate-800 whitespace-pre-wrap font-sans">
                  {m.content}
                </td>
                <td className="py-2 px-3 text-center">
                  {m.isSystemMessage ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                      <ShieldAlert className="w-2.5 h-2.5 mr-0.5" />
                      System
                    </span>
                  ) : m.isMediaOmitted ? (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-purple-50 text-purple-700 border border-purple-200">
                      <Image className="w-2.5 h-2.5 mr-0.5" />
                      Media
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                      <Check className="w-2.5 h-2.5 mr-0.5" />
                      Clean
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
