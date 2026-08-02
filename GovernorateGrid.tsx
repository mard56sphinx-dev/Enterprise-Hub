import React, { useState, useEffect } from 'react';
import { MapPin, Globe2, Compass, Layers, Sparkles } from 'lucide-react';
import { getGovernorates } from '../services/db';

interface GovernorateGridProps {
  country: string;
  onSelectGovernorate: (governorate: string) => void;
  onOpenDeepSearch: () => void;
}

const DEFAULT_IRAQ_GOVERNORATES = [
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

export const GovernorateGrid: React.FC<GovernorateGridProps> = ({
  country,
  onSelectGovernorate,
  onOpenDeepSearch
}) => {
  const [governorates, setGovernorates] = useState<string[]>([]);

  useEffect(() => {
    let isMounted = true;
    async function fetchGovs() {
      try {
        const list = await getGovernorates(country);
        if (isMounted) {
          if (list.length > 0) {
            setGovernorates(list.map(g => g.name));
          } else if (country === 'العراق') {
            setGovernorates(DEFAULT_IRAQ_GOVERNORATES);
          } else {
            setGovernorates([`محافظة 1 (${country})`, `محافظة 2 (${country})`, `محافظة 3 (${country})`]);
          }
        }
      } catch (err) {
        if (isMounted) {
          setGovernorates(country === 'العراق' ? DEFAULT_IRAQ_GOVERNORATES : []);
        }
      }
    }
    fetchGovs();
    return () => { isMounted = false; };
  }, [country]);

  return (
    <div className="space-y-6">
      {/* Search Header Banner */}
      <div className="bg-gradient-to-r from-[#161b22] via-[#1f293d] to-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-transparent to-[#1f6feb]/10 pointer-events-none" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Compass className="w-5 h-5 text-[#58a6ff]" />
              <h2 className="text-lg font-bold text-[#c9d1d9]">
                استعلام بيانات المحافظات - [{country}]
              </h2>
            </div>
            <p className="text-xs text-[#8b949e]">
              اختر المحافظة المطلوبة أو ابحث في كافة المحافظات للوصول للأسماء والسجلات الديموغرافية
            </p>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#0d1117]/80 rounded-xl border border-[#30363d] text-xs font-mono text-[#58a6ff]">
            <Globe2 className="w-3.5 h-3.5" />
            <span>النطاق النشط: {country}</span>
          </div>
        </div>
      </div>

      {/* Main Action Buttons Stack */}
      <div className="max-w-xl mx-auto space-y-3">
        {/* 1. Primary Button: Search All Governorates */}
        <button
          onClick={() => onSelectGovernorate('جميع المحافظات')}
          className="w-full py-4 px-6 bg-gradient-to-r from-[#1f6feb] to-[#388bfd] hover:from-[#388bfd] hover:to-[#58a6ff] text-white rounded-2xl font-bold text-base shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all flex items-center justify-center gap-3 border border-[#58a6ff]/30 group"
        >
          <Layers className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>البحث في جميع المحافظات</span>
        </button>

        {/* 2. Deep Search Button directly BELOW "Search All Governorates" */}
        <button
          onClick={onOpenDeepSearch}
          className="w-full py-3.5 px-6 bg-[#21262d] hover:bg-[#30363d] text-[#a371f7] hover:text-white border-2 border-[#a371f7]/50 hover:border-[#a371f7] rounded-2xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-3 group"
        >
          <Sparkles className="w-5 h-5 text-[#a371f7] group-hover:rotate-12 transition-transform" />
          <span>البحث العميق (تصفية متعددة المعايير)</span>
        </button>
      </div>

      {/* Governorate Grid Buttons */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-semibold text-[#8b949e] mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-[#58a6ff]" />
          <span>اختر محافظة محددة للاستعلام السريع:</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {governorates.map((gov) => (
            <button
              key={gov}
              onClick={() => onSelectGovernorate(gov)}
              className="p-3.5 bg-[#0d1117] hover:bg-[#1f6feb]/15 border border-[#30363d] hover:border-[#58a6ff] text-[#c9d1d9] hover:text-[#58a6ff] rounded-xl text-xs font-bold transition-all shadow-sm flex flex-col items-center justify-center gap-1.5 group"
            >
              <MapPin className="w-4 h-4 text-[#8b949e] group-hover:text-[#58a6ff] transition-colors" />
              <span className="truncate w-full text-center">{gov}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
