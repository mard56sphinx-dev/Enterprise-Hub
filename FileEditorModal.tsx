import React, { useState, useEffect } from 'react';
import {
  FileText,
  X,
  Plus,
  Trash2,
  Save,
  Search,
  Check,
  AlertCircle,
  Loader2,
  Layers,
  Phone,
  User,
  MapPin
} from 'lucide-react';
import { StoredFile, ExtractedRecord } from '../types/database';
import { db, updateFileRecords } from '../services/db';

interface FileEditorModalProps {
  file: StoredFile;
  onClose: () => void;
  onSaved: () => void;
}

export const FileEditorModal: React.FC<FileEditorModalProps> = ({
  file,
  onClose,
  onSaved
}) => {
  const [records, setRecords] = useState<ExtractedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [modifiedRecords, setModifiedRecords] = useState<Map<number, ExtractedRecord>>(new Map());
  const [newRecords, setNewRecords] = useState<ExtractedRecord[]>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    async function loadRecords() {
      if (!file.id) return;
      setLoading(true);
      try {
        const fetched = await db.records
          .where('fileId')
          .equals(file.id)
          .limit(300)
          .toArray();
        setRecords(fetched);
      } catch (err) {
        console.error('Error loading file records:', err);
      } finally {
        setLoading(false);
      }
    }
    loadRecords();
  }, [file.id]);

  // Filter records based on search query
  const filteredRecords = records.filter((rec) => {
    if (deletedIds.includes(rec.id!)) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    const name = `${rec.firstName || ''} ${rec.secondName || ''} ${rec.thirdName || ''}`.toLowerCase();
    const phone = (rec.detectedPhone || '').toLowerCase();
    const gov = (rec.governorate || '').toLowerCase();
    const fam = (rec.familyId || '').toLowerCase();
    return name.includes(q) || phone.includes(q) || gov.includes(q) || fam.includes(q);
  });

  const handleFieldChange = (id: number, field: keyof ExtractedRecord, value: string) => {
    const existing = modifiedRecords.get(id) || records.find((r) => r.id === id);
    if (!existing) return;

    const updated: ExtractedRecord = { ...existing, [field]: value };

    // Update names if fullName changed
    if (field === 'firstName') {
      const parts = value.split(/\s+/);
      updated.firstName = parts[0] || '';
      updated.secondName = parts[1] || '';
      updated.thirdName = parts.slice(2).join(' ') || '';
    }

    const updatedMap = new Map(modifiedRecords);
    updatedMap.set(id, updated);
    setModifiedRecords(updatedMap);

    // Update local state for display
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? updated : r))
    );
  };

  const handleMarkDeleted = (id: number) => {
    setDeletedIds((prev) => [...prev, id]);
  };

  const handleAddNewRow = () => {
    const tempId = -Date.now();
    const newRec: ExtractedRecord = {
      id: tempId,
      fileId: file.id || 0,
      category: 'other',
      targetDatabase: file.targetDatabase,
      scope: file.scope,
      country: file.country,
      firstName: 'اسم جديد',
      secondName: '',
      thirdName: '',
      detectedPhone: '',
      governorate: 'بغداد',
      searchIndex: ['اسم', 'جديد', 'بغداد'],
      data: {}
    };

    setNewRecords((prev) => [newRec, ...prev]);
    setRecords((prev) => [newRec, ...prev]);
  };

  const handleSaveChanges = async () => {
    if (!file.id) return;
    setSaving(true);
    setStatusMessage(null);

    try {
      // Prepare records to put in Dexie
      const recordsToPut: ExtractedRecord[] = [];

      // Modified records
      modifiedRecords.forEach((rec) => {
        if (!deletedIds.includes(rec.id!)) {
          // Re-build searchIndex
          const terms = new Set<string>();
          if (rec.firstName) terms.add(rec.firstName.toLowerCase());
          if (rec.secondName) terms.add(rec.secondName.toLowerCase());
          if (rec.thirdName) terms.add(rec.thirdName.toLowerCase());
          if (rec.detectedPhone) terms.add(rec.detectedPhone.replace(/\D/g, ''));
          if (rec.governorate) terms.add(rec.governorate.toLowerCase());
          if (rec.familyId) terms.add(rec.familyId.toLowerCase());

          rec.searchIndex = Array.from(terms);
          recordsToPut.push(rec);
        }
      });

      // New records (remove temporary negative id before inserting)
      newRecords.forEach((rec) => {
        if (!deletedIds.includes(rec.id!)) {
          const { id, ...cleanRec } = rec;
          const terms = new Set<string>();
          if (rec.firstName) terms.add(rec.firstName.toLowerCase());
          if (rec.detectedPhone) terms.add(rec.detectedPhone.replace(/\D/g, ''));
          if (rec.governorate) terms.add(rec.governorate.toLowerCase());
          cleanRec.searchIndex = Array.from(terms);
          recordsToPut.push(cleanRec as ExtractedRecord);
        }
      });

      await updateFileRecords(file.id, recordsToPut, deletedIds.filter((id) => id > 0));

      setStatusMessage({ text: 'تم حفظ كافة التعديلات والسجلات بنجاح في قاعدة البيانات', type: 'success' });
      setTimeout(() => {
        onSaved();
        onClose();
      }, 1200);
    } catch (err: any) {
      console.error('Error saving file changes:', err);
      setStatusMessage({ text: 'حدث خطأ أثناء حفظ التعديلات: ' + err.message, type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-5xl h-[85vh] shadow-2xl flex flex-col overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#1f6feb]/15 border border-[#1f6feb]/30 flex items-center justify-center text-[#58a6ff]">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                محرر ومعدل الملفات التفاعلي: {file.fileName}
              </h3>
              <p className="text-xs text-[#8b949e]">
                قاعدة البيانات: {file.targetDatabase} | الدولة: {file.country} | السجلات الحالية: {file.recordCount.toLocaleString('ar-IQ')}
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

        {/* Toolbar & Filter Bar */}
        <div className="p-4 bg-[#161b22] border-b border-[#30363d] flex flex-wrap justify-between items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8b949e]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="تصفية السجلات باسم، هاتف، رقم عائلة..."
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl pr-9 pl-4 py-2 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddNewRow}
              className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
            >
              <Plus className="w-4 h-4" />
              <span>إضافة سجل جديد</span>
            </button>
          </div>
        </div>

        {statusMessage && (
          <div
            className={`px-4 py-2.5 text-xs font-bold flex items-center gap-2 ${
              statusMessage.type === 'success'
                ? 'bg-[#238636]/20 border-b border-[#238636]/40 text-[#3fb950]'
                : 'bg-[#da3633]/20 border-b border-[#da3633]/40 text-[#f85149]'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <Check className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Table Body */}
        <div className="flex-1 overflow-auto custom-scrollbar p-4 bg-[#0d1117]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-[#8b949e]">
              <Loader2 className="w-8 h-8 animate-spin text-[#58a6ff]" />
              <span className="text-xs font-bold">جاري تحميل سجلات الملف...</span>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-[#8b949e] space-y-2">
              <Layers className="w-10 h-10 opacity-30" />
              <p className="text-xs font-medium">لا توجد سجلات مطابقة للعرض أو التعديل</p>
            </div>
          ) : (
            <div className="overflow-x-auto border border-[#30363d] rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#161b22] text-[#8b949e] border-b border-[#30363d] font-bold">
                  <tr>
                    <th className="p-3 w-10">#</th>
                    <th className="p-3 min-w-[180px]">الاسم الكامل / الأول</th>
                    <th className="p-3 min-w-[130px]">رقم الهاتف</th>
                    <th className="p-3 min-w-[120px]">المحافظة</th>
                    <th className="p-3 min-w-[110px]">القضاء</th>
                    <th className="p-3 min-w-[110px]">رقم العائلة</th>
                    <th className="p-3 min-w-[110px]">المهنة/الوظيفة</th>
                    <th className="p-3 w-16 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]">
                  {filteredRecords.map((rec, index) => (
                    <tr
                      key={rec.id || index}
                      className="hover:bg-[#161b22]/80 transition-colors"
                    >
                      <td className="p-2.5 font-mono text-[11px] text-[#8b949e] text-center">
                        {index + 1}
                      </td>

                      {/* Name Editable */}
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-[#58a6ff]" />
                          <input
                            type="text"
                            value={rec.firstName || ''}
                            onChange={(e) =>
                              handleFieldChange(rec.id!, 'firstName', e.target.value)
                            }
                            className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#58a6ff] rounded-lg px-2 py-1 text-xs text-[#c9d1d9] font-medium"
                          />
                        </div>
                      </td>

                      {/* Phone Editable */}
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#3fb950]" />
                          <input
                            type="text"
                            value={rec.detectedPhone || ''}
                            onChange={(e) =>
                              handleFieldChange(rec.id!, 'detectedPhone', e.target.value)
                            }
                            className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#3fb950] rounded-lg px-2 py-1 text-xs font-mono text-[#3fb950]"
                          />
                        </div>
                      </td>

                      {/* Governorate Editable */}
                      <td className="p-2">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#f0883e]" />
                          <input
                            type="text"
                            value={rec.governorate || ''}
                            onChange={(e) =>
                              handleFieldChange(rec.id!, 'governorate', e.target.value)
                            }
                            className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#f0883e] rounded-lg px-2 py-1 text-xs text-[#c9d1d9]"
                          />
                        </div>
                      </td>

                      {/* District Editable */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={rec.district || ''}
                          onChange={(e) =>
                            handleFieldChange(rec.id!, 'district', e.target.value)
                          }
                          className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#58a6ff] rounded-lg px-2 py-1 text-xs text-[#c9d1d9]"
                        />
                      </td>

                      {/* Family ID Editable */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={rec.familyId || ''}
                          onChange={(e) =>
                            handleFieldChange(rec.id!, 'familyId', e.target.value)
                          }
                          className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#a371f7] rounded-lg px-2 py-1 text-xs font-mono text-[#a371f7]"
                        />
                      </td>

                      {/* Occupation Editable */}
                      <td className="p-2">
                        <input
                          type="text"
                          value={rec.occupation || ''}
                          onChange={(e) =>
                            handleFieldChange(rec.id!, 'occupation', e.target.value)
                          }
                          className="w-full bg-[#161b22] border border-[#30363d] focus:border-[#58a6ff] rounded-lg px-2 py-1 text-xs text-[#c9d1d9]"
                        />
                      </td>

                      {/* Actions */}
                      <td className="p-2 text-center">
                        <button
                          onClick={() => handleMarkDeleted(rec.id!)}
                          title="حذف هذا السجل"
                          className="p-1.5 text-[#f85149] hover:bg-[#f85149]/20 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Footer Bar */}
        <div className="p-4 bg-[#161b22] border-t border-[#30363d] flex justify-between items-center">
          <div className="text-xs text-[#8b949e]">
            {deletedIds.length > 0 && (
              <span className="text-[#f85149] font-bold ml-3">
                السجلات المعلمة للحذف: {deletedIds.length}
              </span>
            )}
            {modifiedRecords.size > 0 && (
              <span className="text-[#388bfd] font-bold ml-3">
                السجلات المعدلة: {modifiedRecords.size}
              </span>
            )}
            {newRecords.length > 0 && (
              <span className="text-[#3fb950] font-bold">
                السجلات المضافة: {newRecords.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-xl text-xs font-semibold"
            >
              إلغاء الأمر
            </button>

            <button
              onClick={handleSaveChanges}
              disabled={saving}
              className="px-6 py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'جاري التحديث...' : 'حفظ التعديلات'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
