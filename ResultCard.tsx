import React, { useState } from 'react';
import {
  Users,
  Copy,
  Download,
  Phone,
  Check,
  ChevronDown,
  ChevronUp,
  Briefcase,
  MapPin,
  Calendar,
  CreditCard
} from 'lucide-react';
import { ExtractedRecord } from '../types/database';
import { fetchFamilyMembers } from '../services/db';

interface ResultCardProps {
  record: ExtractedRecord;
  country?: string;
}

export const ResultCard: React.FC<ResultCardProps> = ({ record, country = 'العراق' }) => {
  const [copied, setCopied] = useState(false);
  const [familyMembers, setFamilyMembers] = useState<ExtractedRecord[]>([]);
  const [loadingFamily, setLoadingFamily] = useState(false);
  const [showFamily, setShowFamily] = useState(false);

  const familyId =
    record.familyId ||
    record.data?.['familyId'] ||
    record.data?.['رقم العائلة'] ||
    record.data?.['family_id'];

  const firstName =
    record.firstName ||
    record.data?.['firstName'] ||
    record.data?.['الاسم الأول'] ||
    record.data?.['col_1'] ||
    '-';

  const secondName =
    record.secondName ||
    record.data?.['secondName'] ||
    record.data?.['الاسم الثاني'] ||
    record.data?.['col_2'] ||
    '-';

  const thirdName =
    record.thirdName ||
    record.data?.['thirdName'] ||
    record.data?.['الاسم الثالث'] ||
    record.data?.['col_3'] ||
    '-';

  const fullName = `${firstName} ${secondName} ${thirdName}`.trim();

  const birthYear =
    record.birthYear ||
    record.data?.['birthYear'] ||
    record.data?.['سنة الولادة'] ||
    '-';

  const age =
    record.age || record.data?.['age'] || record.data?.['العمر'] || '-';

  const occupation =
    record.occupation ||
    record.data?.['occupation'] ||
    record.data?.['الوظيفة'] ||
    '-';

  const governorate =
    record.governorate ||
    record.data?.['governorate'] ||
    record.data?.['المحافظة'] ||
    '-';

  const district =
    record.district ||
    record.data?.['district'] ||
    record.data?.['القضاء'] ||
    '-';

  const neighborhood =
    record.neighborhood ||
    record.data?.['neighborhood'] ||
    record.data?.['المحلة'] ||
    '-';

  const alley =
    record.alley || record.data?.['alley'] || record.data?.['الزقاق'] || '-';

  const house =
    record.house || record.data?.['house'] || record.data?.['الدار'] || '-';

  const phone = record.detectedPhone || record.data?.['phone'] || '-';

  // Format record text representation
  const formatRecordText = (rec: ExtractedRecord) => {
    return `========================================
مركز بيانات العراق - تفاصيل السجل
========================================
الاسم الكامل: ${fullName}
رقم العائلة: ${familyId || 'غير متوفر'}
سنة الولادة: ${birthYear} (العمر: ${age})
الوظيفة: ${occupation}
المحافظة: ${governorate}
القضاء: ${district} | المحلة: ${neighborhood} | الزقاق: ${alley} | الدار: ${house}
رقم الهاتف: ${phone}
قاعدة البيانات: ${rec.targetDatabase || 'العراق'}
========================================`;
  };

  // 1. Fetch Family Handler
  const handleFetchFamily = async () => {
    if (!familyId) return;
    if (showFamily) {
      setShowFamily(false);
      return;
    }

    setLoadingFamily(true);
    try {
      const members = await fetchFamilyMembers(familyId, country);
      setFamilyMembers(members);
      setShowFamily(true);
    } catch (err) {
      console.error('Error fetching family members:', err);
    } finally {
      setLoadingFamily(false);
    }
  };

  // 2. Copy Info Handler
  const handleCopyInfo = () => {
    const text = formatRecordText(record);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 3. Export TXT Handler
  const handleExportTXT = () => {
    let content = formatRecordText(record);

    if (familyMembers.length > 0) {
      content += `\n\n=== أفراد العائلة المرتبطين (${familyMembers.length}) ===\n`;
      familyMembers.forEach((m, idx) => {
        content += `\n[فرد ${idx + 1}]: ${m.firstName || ''} ${m.secondName || ''} ${m.thirdName || ''} | سنة: ${m.birthYear || '-'} | الوظيفة: ${m.occupation || '-'}`;
      });
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `سجل_${fullName.replace(/\s+/g, '_')}_${familyId || 'record'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg space-y-4 hover:border-[#58a6ff]/40 transition-all">
      {/* Card Header & Primary Demographic Overview */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-[#30363d]/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#1f6feb]/15 border border-[#1f6feb]/30 flex items-center justify-center text-[#58a6ff]">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-[#c9d1d9] tracking-tight">
              {fullName}
            </h4>
            <div className="flex flex-wrap items-center gap-2 mt-0.5 text-xs text-[#8b949e]">
              <span className="text-[#388bfd] font-mono font-semibold">
                رقم العائلة: {familyId || 'غير مسجل'}
              </span>
              <span>•</span>
              <span className="text-[#8b949e]">{record.targetDatabase || 'قاعدة البيانات'}</span>
            </div>
          </div>
        </div>

        {phone !== '-' && (
          <div className="flex items-center gap-1.5 px-3 py-1 bg-[#238636]/15 border border-[#238636]/40 text-[#3fb950] rounded-xl text-xs font-mono font-bold">
            <Phone className="w-3.5 h-3.5" />
            <span>{phone}</span>
          </div>
        )}
      </div>

      {/* Grid of Key Fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
        <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
          <span className="text-[#8b949e] block text-[10px] mb-0.5 flex items-center gap-1">
            <Calendar className="w-3 h-3 text-[#388bfd]" />
            سنة الولادة / العمر
          </span>
          <span className="text-[#c9d1d9] font-medium">
            {birthYear} {age !== '-' ? `(${age} سنة)` : ''}
          </span>
        </div>

        <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
          <span className="text-[#8b949e] block text-[10px] mb-0.5 flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-[#a371f7]" />
            الوظيفة
          </span>
          <span className="text-[#c9d1d9] font-medium">{occupation}</span>
        </div>

        <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
          <span className="text-[#8b949e] block text-[10px] mb-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-[#f0883e]" />
            المحافظة / القضاء
          </span>
          <span className="text-[#c9d1d9] font-medium">
            {governorate} / {district}
          </span>
        </div>

        <div className="bg-[#0d1117] p-2.5 rounded-xl border border-[#30363d]/60">
          <span className="text-[#8b949e] block text-[10px] mb-0.5 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-[#3fb950]" />
            العنوان التفصيلي
          </span>
          <span className="text-[#c9d1d9] font-medium">
            م: {neighborhood} | ز: {alley} | د: {house}
          </span>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
        {/* 1. Fetch Family Button */}
        {familyId ? (
          <button
            onClick={handleFetchFamily}
            disabled={loadingFamily}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              showFamily
                ? 'bg-[#a371f7]/20 border-[#a371f7] text-[#a371f7]'
                : 'bg-[#21262d] hover:bg-[#30363d] border-[#30363d] text-[#c9d1d9] hover:text-white'
            }`}
          >
            <Users className="w-4 h-4 text-[#a371f7]" />
            <span>{loadingFamily ? 'جاري الاستعلام...' : 'جلب العائلة'}</span>
            {showFamily ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        ) : (
          <div className="text-[11px] text-[#8b949e]">رقم العائلة غير مسجل</div>
        )}

        <div className="flex items-center gap-2">
          {/* 2. Copy Info Button */}
          <button
            onClick={handleCopyInfo}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white rounded-xl text-xs font-semibold transition-all"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5 text-[#388bfd]" />}
            <span>{copied ? 'تم النسخ' : 'نسخ المعلومات'}</span>
          </button>

          {/* 3. Export TXT Button */}
          <button
            onClick={handleExportTXT}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#238636]/20 hover:bg-[#238636]/30 border border-[#238636]/50 text-[#3fb950] rounded-xl text-xs font-bold transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>سحب TXT</span>
          </button>
        </div>
      </div>

      {/* Render Nested Family Members View */}
      {showFamily && (
        <div className="mt-4 p-4 bg-[#0d1117] rounded-xl border border-[#a371f7]/40 space-y-3 animate-fadeIn">
          <div className="flex justify-between items-center pb-2 border-b border-[#30363d]">
            <h5 className="text-xs font-bold text-[#a371f7] flex items-center gap-2">
              <Users className="w-4 h-4" />
              <span>أفراد العائلة المسجلين (رقم: {familyId})</span>
            </h5>
            <span className="text-[10px] text-[#8b949e]">
              العدد الإجمالي: {familyMembers.length} فرد
            </span>
          </div>

          {familyMembers.length === 0 ? (
            <p className="text-xs text-[#8b949e] py-2 text-center">
              لم يتم العثور على أفراد إضافيين مسجلين بنفس رقم العائلة
            </p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
              {familyMembers.map((member, idx) => (
                <div
                  key={member.id || idx}
                  className="p-2.5 bg-[#161b22] border border-[#30363d] rounded-lg text-xs flex justify-between items-center"
                >
                  <div>
                    <span className="font-bold text-[#c9d1d9]">
                      {member.firstName || ''} {member.secondName || ''} {member.thirdName || ''}
                    </span>
                    <div className="text-[10px] text-[#8b949e]">
                      مواليد: {member.birthYear || '-'} | الوظيفة: {member.occupation || '-'}
                    </div>
                  </div>
                  {member.detectedPhone && (
                    <span className="text-[10px] font-mono text-[#3fb950]">
                      {member.detectedPhone}
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
