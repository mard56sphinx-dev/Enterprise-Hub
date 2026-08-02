import React, { useState } from 'react';
import { Search, X, Loader2, MapPin, CheckCircle2 } from 'lucide-react';
import { ExtractedRecord } from '../types/database';
import { searchByGovernorate } from '../services/db';
import { ResultCard } from './ResultCard';

interface GovernorateSearchModalProps {
  governorate: string;
  country: string;
  onClose: () => void;
}

export const GovernorateSearchModal: React.FC<GovernorateSearchModalProps> = ({
  governorate,
  country,
  onClose
}) => {
  const [queryName, setQueryName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ExtractedRecord[]>([]);
  const [searchSummary, setSearchSummary] = useState<{
    query: string;
    count: number;
  } | null>(null);

  const placeholderText =
    governorate === 'جميع المحافظات'
      ? 'أكتب الاسم الثلاثي'
      : `أكتب الاسم الثلاثي - ${governorate}`;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!queryName.trim()) return;

    setIsSearching(true);
    setSearchSummary(null);

    try {
      const { records, matchCount } = await searchByGovernorate(
        queryName,
        governorate,
        country
      );
      setResults(records);
      setSearchSummary({ query: queryName.trim(), count: matchCount });
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1f6feb]/20 border border-[#1f6feb]/40 flex items-center justify-center text-[#58a6ff]">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#c9d1d9]">
                استعلام المحافظة: <span className="text-[#58a6ff]">{governorate}</span>
              </h3>
              <p className="text-xs text-[#8b949e]">
                قاعدة البيانات المستهدفة: {country}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-[#8b949e] hover:text-white rounded-xl hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Form */}
        <div className="p-4 sm:p-5 bg-[#161b22] border-b border-[#30363d]">
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8b949e] absolute right-3.5 top-3.5" />
              <input
                type="text"
                value={queryName}
                onChange={(e) => setQueryName(e.target.value)}
                placeholder={placeholderText}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] text-[#c9d1d9] placeholder-[#8b949e] text-sm rounded-xl pr-10 pl-4 py-3 focus:outline-none transition-all"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !queryName.trim()}
              className="px-6 py-3 bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white font-bold text-sm rounded-xl transition-all shadow-md shadow-blue-500/20 flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>بحث</span>
            </button>
          </form>

          {/* Active Search Status Banner */}
          {isSearching && (
            <div className="mt-3 p-3 bg-[#1f6feb]/10 border border-[#1f6feb]/30 rounded-xl text-xs text-[#58a6ff] flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري البحث في قاعدة بيانات [{country} - {governorate}]...</span>
            </div>
          )}

          {/* Completion Summary Toast */}
          {searchSummary && !isSearching && (
            <div className="mt-3 p-3 bg-[#238636]/15 border border-[#238636]/40 rounded-xl text-xs text-[#3fb950] flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  تم الانتهاء والنتائج التي طلعت: <strong>[{searchSummary.query}]</strong> (عدد الأسماء المشابهة: {searchSummary.count.toLocaleString('ar-IQ')})
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Results List View */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {results.length > 0 ? (
            results.map((rec) => (
              <ResultCard key={rec.id} record={rec} country={country} />
            ))
          ) : (
            <div className="text-center py-12 text-[#8b949e] space-y-2">
              <Search className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm">
                {searchSummary
                  ? 'لم يتم العثور على نتائج مطابقة لهذا الاسم'
                  : 'أدخل الاسم الثلاثي في الحقل أعلاه لبدء الاستعلام'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
