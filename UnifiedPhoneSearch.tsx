import React, { useState } from 'react';
import { PhoneCall, Search, Loader2, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';
import { ExtractedRecord } from '../types/database';
import { searchByPhone, normalizeArabicDigits } from '../services/db';
import { ResultCard } from './ResultCard';

interface UnifiedPhoneSearchProps {
  country: string;
}

export const UnifiedPhoneSearch: React.FC<UnifiedPhoneSearchProps> = ({ country }) => {
  const [rawPhone, setRawPhone] = useState('');
  const [normalizedPhone, setNormalizedPhone] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ExtractedRecord[]>([]);
  const [searchSummary, setSearchSummary] = useState<{
    phone: string;
    count: number;
  } | null>(null);

  // Real-time Automatic Number Normalization
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    setRawPhone(rawVal);

    // Convert Arabic-Indic (٠-٩) to Latin (0-9) & strip non-digits
    const converted = normalizeArabicDigits(rawVal).replace(/\D/g, '');
    setNormalizedPhone(converted);
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!normalizedPhone) return;

    setIsSearching(true);
    setSearchSummary(null);

    try {
      const { records, matchCount } = await searchByPhone(normalizedPhone);
      setResults(records);
      setSearchSummary({ phone: normalizedPhone, count: matchCount });
    } catch (err) {
      console.error('Phone search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#161b22] via-[#2d2312] to-[#161b22] border border-[#d29922]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PhoneCall className="w-5 h-5 text-[#e3b341]" />
              <h2 className="text-lg font-bold text-[#c9d1d9]">
                البحث الموحد عن أرقام الهواتف (Zain, AsiaCell, Korek)
              </h2>
            </div>
            <p className="text-xs text-[#8b949e]">
              إدخال موحد مع تحويل تلقائي فوري للأرقام العربية (٠١٢٣٤٥٦٧٨٩) إلى الأرقام القياسية (0123456789)
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1 bg-[#d29922]/10 border border-[#d29922]/30 text-[#e3b341] rounded-xl text-xs font-mono font-bold">
            <Zap className="w-3.5 h-3.5" />
            <span>معالج الأرقام الذكي نشط</span>
          </div>
        </div>
      </div>

      {/* Input Box */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg space-y-3">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <PhoneCall className="w-4 h-4 text-[#8b949e] absolute right-3.5 top-3.5" />
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={rawPhone}
              onChange={handleInputChange}
              placeholder="أدخل رقم الهاتف (مثال: 07701234567 أو ٠٧٧٠١٢٣٤٥٦٧)"
              className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#e3b341] text-[#c9d1d9] placeholder-[#8b949e] text-sm rounded-xl pr-10 pl-4 py-3 focus:outline-none transition-all font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={isSearching || !normalizedPhone}
            className="px-8 py-3 bg-[#e3b341] hover:bg-[#f0b72f] disabled:opacity-50 text-black font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
          >
            {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>استعلام موحد</span>
          </button>
        </form>

        {/* Real-time Normalization Feedback */}
        {rawPhone && (
          <div className="flex items-center gap-2 text-xs text-[#8b949e] font-mono px-1">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>الرقم المحول المعالج للبحث: </span>
            <span className="text-[#e3b341] font-bold">{normalizedPhone || 'في انتظار الإدخال'}</span>
          </div>
        )}

        {/* Active Query Banner */}
        {isSearching && (
          <div className="p-3 bg-[#e3b341]/10 border border-[#e3b341]/30 rounded-xl text-xs text-[#e3b341] flex items-center gap-2 animate-pulse">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>جاري الاستعلام عن الرقم [{normalizedPhone}] عبر شبكات زين وآسيا سيل وكورك وقواعد البيانات...</span>
          </div>
        )}

        {/* Completion Summary Toast */}
        {searchSummary && !isSearching && (
          <div className="p-3 bg-[#238636]/15 border border-[#238636]/40 rounded-xl text-xs text-[#3fb950] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                تم الانتهاء والنتائج التي طلعت للرقم <strong>[{searchSummary.phone}]</strong> (عدد السجلات المطابقة: {searchSummary.count.toLocaleString('ar-IQ')})
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results List View */}
      <div className="space-y-4">
        {results.length > 0 ? (
          results.map((rec) => (
            <ResultCard key={rec.id} record={rec} country={country} />
          ))
        ) : (
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-12 text-center text-[#8b949e] space-y-2">
            <PhoneCall className="w-8 h-8 mx-auto opacity-50 text-[#e3b341]" />
            <p className="text-sm">
              {searchSummary
                ? 'لم يتم العثور على سجل مرتبط برقم الهاتف هذا'
                : 'أدخل رقم الهاتف للبحث الفوري في كافة شبكات الاتصال وقواعد البيانات'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
