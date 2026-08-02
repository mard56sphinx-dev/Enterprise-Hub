import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle2, Filter } from 'lucide-react';
import { ExtractedRecord, DeepSearchCriteria } from '../types/database';
import { searchDeep } from '../services/db';
import { ResultCard } from './ResultCard';

interface DeepSearchModalProps {
  country: string;
  onClose: () => void;
}

const IRAQ_GOVERNORATES = [
  'جميع المحافظات',
  'بغداد',
  'النجف',
  'نينوى',
  'البصرة',
  'أربيل',
  'السليمانية',
  'دهوك',
  'بابل',
  'كربلاء',
  'كركوك',
  'الأنبار',
  'ذي قار',
  'ديالي',
  'صلاح الدين',
  'القادسية',
  'ميسان',
  'المثنى',
  'واسط'
];

export const DeepSearchModal: React.FC<DeepSearchModalProps> = ({
  country,
  onClose
}) => {
  const [criteria, setCriteria] = useState<DeepSearchCriteria>({
    firstName: '',
    secondName: '',
    thirdName: '',
    age: '',
    birthYear: '',
    occupation: '',
    governorate: 'جميع المحافظات',
    district: ''
  });

  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<ExtractedRecord[]>([]);
  const [searchSummary, setSearchSummary] = useState<{
    count: number;
  } | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setSearchSummary(null);

    try {
      const { records, matchCount } = await searchDeep(criteria, country);
      setResults(records);
      setSearchSummary({ count: matchCount });
    } catch (err) {
      console.error('Deep search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleReset = () => {
    setCriteria({
      firstName: '',
      secondName: '',
      thirdName: '',
      age: '',
      birthYear: '',
      occupation: '',
      governorate: 'جميع المحافظات',
      district: ''
    });
    setResults([]);
    setSearchSummary(null);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#a371f7]/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fadeIn">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#a371f7]/20 border border-[#a371f7]/40 flex items-center justify-center text-[#a371f7]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#c9d1d9]">
                البحث العميق (تصفية هجينة متعددة المعايير)
              </h3>
              <p className="text-xs text-[#8b949e]">
                يمكنك إدخال أي تركيب من الخصائص (الاسم الأول، العمر، المحافظة، الوظيفة)
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

        {/* Multi-Criteria Form Grid */}
        <form onSubmit={handleSearch} className="p-4 sm:p-5 bg-[#161b22] border-b border-[#30363d] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-[#8b949e] mb-1 font-semibold">الاسم الأول</label>
              <input
                type="text"
                value={criteria.firstName}
                onChange={(e) => setCriteria({ ...criteria, firstName: e.target.value })}
                placeholder="أحمد"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8b949e] mb-1 font-semibold">اسم الأب (الثاني)</label>
              <input
                type="text"
                value={criteria.secondName}
                onChange={(e) => setCriteria({ ...criteria, secondName: e.target.value })}
                placeholder="علي"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8b949e] mb-1 font-semibold">اسم الجد (الثالث)</label>
              <input
                type="text"
                value={criteria.thirdName}
                onChange={(e) => setCriteria({ ...criteria, thirdName: e.target.value })}
                placeholder="حسين"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8b949e] mb-1 font-semibold">المحافظة</label>
              <select
                value={criteria.governorate}
                onChange={(e) => setCriteria({ ...criteria, governorate: e.target.value })}
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
              >
                {IRAQ_GOVERNORATES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[#8b949e] mb-1 font-semibold">العمر أو سنة الولادة</label>
              <input
                type="text"
                value={criteria.birthYear || criteria.age}
                onChange={(e) =>
                  setCriteria({
                    ...criteria,
                    birthYear: e.target.value,
                    age: e.target.value
                  })
                }
                placeholder="مثال: 1985 أو 38"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[#8b949e] mb-1 font-semibold">الوظيفة / المهنة</label>
              <input
                type="text"
                value={criteria.occupation}
                onChange={(e) => setCriteria({ ...criteria, occupation: e.target.value })}
                placeholder="معلم / موظف"
                className="w-full bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-xl text-xs font-semibold"
            >
              إعادة ضبط
            </button>

            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2 bg-[#a371f7] hover:bg-[#8a42f5] text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2"
            >
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Filter className="w-4 h-4" />}
              <span>تنفيذ البحث العميق</span>
            </button>
          </div>

          {/* Active Query Banner */}
          {isSearching && (
            <div className="p-3 bg-[#a371f7]/10 border border-[#a371f7]/30 rounded-xl text-xs text-[#a371f7] flex items-center gap-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>جاري الفحص المتقدم في قاعدة البيانات بتركيب المعايير...</span>
            </div>
          )}

          {/* Completion Summary Toast */}
          {searchSummary && !isSearching && (
            <div className="p-3 bg-[#238636]/15 border border-[#238636]/40 rounded-xl text-xs text-[#3fb950] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                تم الانتهاء والنتائج التي طلعت: (عدد الأسماء المشابهة: {searchSummary.count.toLocaleString('ar-IQ')})
              </span>
            </div>
          )}
        </form>

        {/* Results List View */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto custom-scrollbar space-y-4">
          {results.length > 0 ? (
            results.map((rec) => (
              <ResultCard key={rec.id} record={rec} country={country} />
            ))
          ) : (
            <div className="text-center py-12 text-[#8b949e] space-y-2">
              <Sparkles className="w-8 h-8 mx-auto opacity-50" />
              <p className="text-sm">
                {searchSummary
                  ? 'لم يتم العثور على سجلات تطابق كافة المعايير المحددة'
                  : 'حدد المعايير المطلوبة ثم انقر "تنفيذ البحث العميق"'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
