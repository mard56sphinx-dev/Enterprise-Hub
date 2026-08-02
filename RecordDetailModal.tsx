import React from 'react';
import { ExtractedRecord } from '../types/database';
import { X, Smartphone, PhoneCall, Copy, Check } from 'lucide-react';

interface RecordDetailModalProps {
  record: ExtractedRecord | null;
  onClose: () => void;
}

export const RecordDetailModal: React.FC<RecordDetailModalProps> = ({
  record,
  onClose
}) => {
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null);

  if (!record) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl max-w-xl w-full p-6 shadow-2xl relative max-h-[90vh] flex flex-col">
        <button
          onClick={onClose}
          className="absolute left-4 top-4 text-[#8b949e] hover:text-white transition-colors p-1 rounded-lg hover:bg-[#30363d]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-base font-bold text-[#58a6ff]">
            تفاصيل السجل المستخرج (#{record.id})
          </h3>

          {record.category === 'zain' && (
            <span className="px-2.5 py-1 rounded-full bg-[#e3b341]/20 text-[#e3b341] border border-[#e3b341]/40 text-xs font-bold flex items-center gap-1">
              <PhoneCall className="w-3 h-3" /> زين العراق
            </span>
          )}
          {record.category === 'asia' && (
            <span className="px-2.5 py-1 rounded-full bg-[#f85149]/20 text-[#f85149] border border-[#f85149]/40 text-xs font-bold flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> آسيا سيل
            </span>
          )}
          {record.category === 'korek' && (
            <span className="px-2.5 py-1 rounded-full bg-[#a371f7]/20 text-[#a371f7] border border-[#a371f7]/40 text-xs font-bold flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> كورك تليكوم
            </span>
          )}
        </div>

        {record.detectedPhone && (
          <div className="bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-xl p-3 mb-4 flex justify-between items-center text-xs">
            <span className="text-[#8b949e]">الرقم المكتشف:</span>
            <span className="font-mono text-base font-bold text-[#58a6ff] dir-ltr">
              {record.detectedPhone}
            </span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
          {Object.entries(record.data).map(([key, value]) => {
            const valStr = value !== null && value !== undefined ? String(value) : '';
            return (
              <div
                key={key}
                className="bg-[#0d1117] border border-[#30363d] p-3 rounded-xl flex items-center justify-between text-xs gap-3"
              >
                <div className="truncate">
                  <div className="text-[#8b949e] font-semibold mb-0.5">{key}</div>
                  <div className="font-mono text-[#c9d1d9] break-all">{valStr}</div>
                </div>

                <button
                  onClick={() => handleCopy(valStr, key)}
                  className="p-1.5 text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#21262d] rounded-lg transition-colors flex-shrink-0"
                  title="نسخ القيمة"
                >
                  {copiedKey === key ? (
                    <Check className="w-4 h-4 text-[#3fb950]" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-[#30363d] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-xl text-xs font-bold transition-all"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
