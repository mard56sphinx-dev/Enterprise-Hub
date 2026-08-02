import React, { useState } from 'react';
import {
  ShieldAlert,
  Zap,
  Phone,
  User,
  Users,
  MapPin,
  Briefcase,
  Copy,
  Download,
  Check,
  ChevronDown,
  ChevronUp,
  CreditCard,
  Building2,
  FileSpreadsheet
} from 'lucide-react';
import { IntelligenceDossier, fetchFamilyMembers } from '../services/db';
import { ExtractedRecord } from '../types/database';

interface UnifiedDossierCardProps {
  dossier: IntelligenceDossier;
  country?: string;
}

export const UnifiedDossierCard: React.FC<UnifiedDossierCardProps> = ({
  dossier,
  country = 'العراق'
}) => {
  const [copied, setCopied] = useState(false);
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({
    '📞 سجلات الاتصالات والهواتف': true,
    '🪪 السجل المدني والهوية الموحدة': true
  });
  const [familyMembers, setFamilyMembers] = useState<ExtractedRecord[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [showFamily, setShowFamily] = useState(false);

  const toggleSector = (sectorName: string) => {
    setExpandedSectors((prev) => ({
      ...prev,
      [sectorName]: !prev[sectorName]
    }));
  };

  const handleCopyDossier = () => {
    let text = `==================================================\n`;
    text += `⚡ مركز الاستخبارات والبيانات - الملف الشامل\n`;
    text += `==================================================\n`;
    text += `مصطلح الاستعلام: ${dossier.queryTerm}\n`;
    text += `الاسم الكامل: ${dossier.fullName || 'غير معروف'}\n`;
    text += `رقم الهاتف الرئيسي: ${dossier.phone || 'غير مسجل'}\n`;
    text += `رقم العائلة: ${dossier.familyId || 'غير مسجل'}\n`;
    text += `المحافظة: ${dossier.governorate || 'غير مسجلة'}\n`;
    text += `إجمالي السجلات والربط: ${dossier.totalMatches} نتائج\n`;
    text += `==================================================\n\n`;

    dossier.groups.forEach((group) => {
      text += `--- ${group.sectorName} (${group.records.length} سجلات) ---\n`;
      group.records.forEach((rec, idx) => {
        text += `[${idx + 1}] ${rec.firstName || ''} ${rec.secondName || ''} ${rec.thirdName || ''} | هاتف: ${rec.detectedPhone || '-'} | قاعدة: ${rec.targetDatabase || '-'}\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExportTXT = () => {
    let text = `==================================================\n`;
    text += `⚡ مركز الاستخبارات والبيانات - الملف الشامل\n`;
    text += `==================================================\n`;
    text += `مصطلح الاستعلام: ${dossier.queryTerm}\n`;
    text += `الاسم الكامل: ${dossier.fullName || 'غير معروف'}\n`;
    text += `رقم الهاتف الرئيسي: ${dossier.phone || 'غير مسجل'}\n`;
    text += `رقم العائلة: ${dossier.familyId || 'غير مسجل'}\n`;
    text += `إجمالي السجلات: ${dossier.totalMatches}\n\n`;

    dossier.groups.forEach((group) => {
      text += `=== ${group.sectorName} ===\n`;
      group.records.forEach((rec, idx) => {
        text += `[سجل ${idx + 1}]: ${rec.firstName || ''} ${rec.secondName || ''} ${rec.thirdName || ''}\n`;
        text += `  • الهاتف: ${rec.detectedPhone || '-'}\n`;
        text += `  • المحافظة/القضاء: ${rec.governorate || '-'} / ${rec.district || '-'}\n`;
        text += `  • قاعدة البيانات: ${rec.targetDatabase || '-'}\n`;
      });
      text += `\n`;
    });

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `dossier_${dossier.queryTerm.replace(/\s+/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFetchFamily = async () => {
    if (!dossier.familyId) return;
    if (showFamily) {
      setShowFamily(false);
      return;
    }
    setLoadingFamily(true);
    try {
      const members = await fetchFamilyMembers(dossier.familyId, country);
      setFamilyMembers(members);
      setShowFamily(true);
    } catch (err) {
      console.error('Error fetching family:', err);
    } finally {
      setLoadingFamily(false);
    }
  };

  return (
    <div className="bg-[#161b22] border-2 border-[#a371f7]/50 rounded-2xl p-6 shadow-2xl space-y-5 relative overflow-hidden animate-fadeIn">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#a371f7]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-[#30363d]">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#a371f7]/20 border border-[#a371f7]/40 flex items-center justify-center text-[#a371f7] shadow-md">
            <Zap className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-[#a371f7]/20 text-[#a371f7] text-[10px] font-bold border border-[#a371f7]/40">
                ⚡ الملف الاستخباري الموحد (البحث المكثف)
              </span>
            </div>
            <h3 className="text-lg font-bold text-white mt-1 tracking-tight">
              {dossier.fullName || `ملف الاستعلام: ${dossier.queryTerm}`}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyDossier}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] rounded-xl text-xs font-bold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#388bfd]" />}
            <span>{copied ? 'تم نسخ الملف' : 'نسخ Dossier'}</span>
          </button>

          <button
            onClick={handleExportTXT}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#238636]/20 hover:bg-[#238636]/30 border border-[#238636]/50 text-[#3fb950] rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>سحب TXT</span>
          </button>
        </div>
      </div>

      {/* Primary Key Summary Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] flex items-center gap-2.5">
          <User className="w-4 h-4 text-[#58a6ff]" />
          <div>
            <span className="text-[#8b949e] block text-[10px]">الاسم الكامل</span>
            <span className="text-[#c9d1d9] font-bold">{dossier.fullName || '-'}</span>
          </div>
        </div>

        <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] flex items-center gap-2.5">
          <Phone className="w-4 h-4 text-[#3fb950]" />
          <div>
            <span className="text-[#8b949e] block text-[10px]">الهاتف الرئيسي</span>
            <span className="text-[#3fb950] font-mono font-bold">{dossier.phone || '-'}</span>
          </div>
        </div>

        <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] flex items-center gap-2.5">
          <Users className="w-4 h-4 text-[#a371f7]" />
          <div>
            <span className="text-[#8b949e] block text-[10px]">رقم العائلة</span>
            <span className="text-[#a371f7] font-mono font-bold">{dossier.familyId || '-'}</span>
          </div>
        </div>

        <div className="bg-[#0d1117] p-3 rounded-xl border border-[#30363d] flex items-center gap-2.5">
          <MapPin className="w-4 h-4 text-[#f0883e]" />
          <div>
            <span className="text-[#8b949e] block text-[10px]">المحافظة</span>
            <span className="text-[#c9d1d9] font-bold">{dossier.governorate || '-'}</span>
          </div>
        </div>
      </div>

      {/* Family Tree Fetch Trigger */}
      {dossier.familyId && (
        <div className="pt-1">
          <button
            onClick={handleFetchFamily}
            disabled={loadingFamily}
            className="w-full py-2.5 bg-[#0d1117] hover:bg-[#21262d] border border-[#a371f7]/40 text-[#a371f7] rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <Users className="w-4 h-4 text-[#a371f7]" />
            <span>{loadingFamily ? 'جاري الاستعلام عن العائلة...' : `استعلام شجرة العائلة والمرتبطين برقم (${dossier.familyId})`}</span>
            {showFamily ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showFamily && (
            <div className="mt-3 p-4 bg-[#0d1117] rounded-xl border border-[#a371f7]/50 space-y-2">
              <h5 className="text-xs font-bold text-[#a371f7] mb-2">
                أفراد العائلة المسجلين بنفس الرقم ({familyMembers.length}):
              </h5>
              {familyMembers.length === 0 ? (
                <p className="text-xs text-[#8b949e]">لم يتم العثور على أفراد عائلة إضافيين</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {familyMembers.map((m, idx) => (
                    <div
                      key={m.id || idx}
                      className="p-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs flex justify-between items-center"
                    >
                      <div>
                        <div className="font-bold text-[#c9d1d9]">
                          {m.firstName} {m.secondName} {m.thirdName}
                        </div>
                        <div className="text-[10px] text-[#8b949e]">
                          مواليد: {m.birthYear || '-'} | الوظيفة: {m.occupation || '-'}
                        </div>
                      </div>
                      {m.detectedPhone && (
                        <span className="text-[10px] font-mono text-[#3fb950]">
                          {m.detectedPhone}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Sector Breakdown Accordions */}
      <div className="space-y-3 pt-2">
        <h4 className="text-xs font-bold text-[#8b949e] flex items-center gap-1.5">
          <FileSpreadsheet className="w-4 h-4 text-[#58a6ff]" />
          <span>القطاعات وقواعد البيانات المرتبطة ({dossier.groups.length} قطاعات):</span>
        </h4>

        {dossier.groups.map((group) => {
          const isExpanded = expandedSectors[group.sectorName] ?? true;

          return (
            <div
              key={group.sectorName}
              className="bg-[#0d1117] border border-[#30363d] rounded-xl overflow-hidden"
            >
              <button
                onClick={() => toggleSector(group.sectorName)}
                className="w-full p-3 bg-[#161b22] hover:bg-[#21262d] flex justify-between items-center text-xs font-bold text-[#c9d1d9] transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span>{group.sectorName}</span>
                  <span className="px-2 py-0.5 bg-[#21262d] border border-[#30363d] rounded-full text-[10px] font-mono text-[#58a6ff]">
                    {group.records.length} سجلات
                  </span>
                </div>
                {isExpanded ? <ChevronUp className="w-4 h-4 text-[#8b949e]" /> : <ChevronDown className="w-4 h-4 text-[#8b949e]" />}
              </button>

              {isExpanded && (
                <div className="p-3 divide-y divide-[#30363d]/50 space-y-3">
                  {group.records.map((rec, idx) => (
                    <div key={rec.id || idx} className="pt-2 first:pt-0 space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[#58a6ff]">
                          {rec.firstName} {rec.secondName} {rec.thirdName}
                        </span>
                        <span className="px-2 py-0.5 bg-[#238636]/15 text-[#3fb950] border border-[#238636]/30 text-[10px] font-mono rounded-md">
                          {rec.targetDatabase || 'قاعدة بيانات'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-[#8b949e] font-mono">
                        <div>
                          <span>هاتف: </span>
                          <span className="text-[#3fb950] font-bold">{rec.detectedPhone || '-'}</span>
                        </div>
                        <div>
                          <span>عائلة: </span>
                          <span className="text-[#a371f7]">{rec.familyId || '-'}</span>
                        </div>
                        <div>
                          <span>المحافظة: </span>
                          <span className="text-[#c9d1d9]">{rec.governorate || '-'}</span>
                        </div>
                        <div>
                          <span>المهنة: </span>
                          <span className="text-[#c9d1d9]">{rec.occupation || '-'}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
