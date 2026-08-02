import React from 'react';
import { Database, PhoneCall, Files, HardDrive, Smartphone, MapPin, Globe } from 'lucide-react';

interface StatsGridProps {
  totalRecords: number;
  zainCount: number;
  asiaCount: number;
  korekCount: number;
  localDbCount?: number;
  globalDbCount?: number;
  filesCount: number;
  storageUsageText?: string;
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalRecords,
  zainCount,
  asiaCount,
  korekCount,
  localDbCount = 0,
  globalDbCount = 0,
  filesCount,
  storageUsageText = '0 MB'
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mb-6">
      {/* Total Records */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#58a6ff]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">إجمالي السجلات</span>
          <Database className="w-3.5 h-3.5 text-[#58a6ff]" />
        </div>
        <div className="text-lg font-bold text-[#58a6ff] font-mono">
          {totalRecords.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* AsiaCell Count */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#f85149]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">آسيا سيل</span>
          <Smartphone className="w-3.5 h-3.5 text-[#f85149]" />
        </div>
        <div className="text-lg font-bold text-[#f85149] font-mono">
          {asiaCount.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* Zain Count */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#e3b341]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">زين العراق</span>
          <PhoneCall className="w-3.5 h-3.5 text-[#e3b341]" />
        </div>
        <div className="text-lg font-bold text-[#e3b341] font-mono">
          {zainCount.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* Korek Count */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#a371f7]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">كورك تليكوم</span>
          <Smartphone className="w-3.5 h-3.5 text-[#a371f7]" />
        </div>
        <div className="text-lg font-bold text-[#a371f7] font-mono">
          {korekCount.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* Local DBs Count */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#388bfd]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">القواعد المحلية</span>
          <MapPin className="w-3.5 h-3.5 text-[#388bfd]" />
        </div>
        <div className="text-lg font-bold text-[#388bfd] font-mono">
          {localDbCount.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* Global DBs Count */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#a371f7]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">القواعد العالمية</span>
          <Globe className="w-3.5 h-3.5 text-[#a371f7]" />
        </div>
        <div className="text-lg font-bold text-[#a371f7] font-mono">
          {globalDbCount.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* Files Count */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#2ea043]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">الملفات المخزنة</span>
          <Files className="w-3.5 h-3.5 text-[#2ea043]" />
        </div>
        <div className="text-lg font-bold text-[#2ea043] font-mono">
          {filesCount.toLocaleString('ar-IQ')}
        </div>
      </div>

      {/* Storage Volume */}
      <div className="bg-[#21262d] border border-[#30363d] rounded-xl p-3 flex flex-col justify-between hover:border-[#d29922]/50 transition-colors">
        <div className="flex justify-between items-center text-[#8b949e] mb-1">
          <span className="text-[11px] font-medium">سعة التخزين</span>
          <HardDrive className="w-3.5 h-3.5 text-[#d29922]" />
        </div>
        <div className="text-base font-bold text-[#c9d1d9] font-mono truncate">
          {storageUsageText}
        </div>
      </div>
    </div>
  );
};

