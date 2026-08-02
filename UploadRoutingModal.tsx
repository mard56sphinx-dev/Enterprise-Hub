import React, { useState } from 'react';
import { FolderUp, Plus, MapPin, Globe, CheckCircle2, X } from 'lucide-react';
import { ScopeType } from '../types/database';

interface UploadRoutingModalProps {
  files: File[];
  categories: string[];
  countries: string[];
  scope: ScopeType;
  selectedCountry: string;
  onConfirm: (
    targetDatabase: string,
    scope: ScopeType,
    country: string
  ) => void;
  onCancel: () => void;
  onAddNewCategory: (catName: string) => void;
}

export const UploadRoutingModal: React.FC<UploadRoutingModalProps> = ({
  files,
  categories,
  countries,
  scope: initialScope,
  selectedCountry: initialCountry,
  onConfirm,
  onCancel,
  onAddNewCategory
}) => {
  const [selectedDb, setSelectedDb] = useState(categories[0] || 'قاعدة بيانات العراق');
  const [scope, setScope] = useState<ScopeType>(initialScope);
  const [country, setCountry] = useState(initialCountry);
  const [newCatName, setNewCatName] = useState('');
  const [showAddCatInput, setShowAddCatInput] = useState(false);

  const handleCreateCategory = () => {
    if (newCatName.trim()) {
      onAddNewCategory(newCatName.trim());
      setSelectedDb(newCatName.trim());
      setNewCatName('');
      setShowAddCatInput(false);
    }
  };

  const handleConfirmUpload = () => {
    onConfirm(selectedDb, scope, country);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn space-y-4">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-[#30363d] flex justify-between items-center bg-[#0d1117]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1f6feb]/20 border border-[#1f6feb]/40 flex items-center justify-center text-[#58a6ff]">
              <FolderUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#c9d1d9]">
                تحديد وجهة إضافة البيانات
              </h3>
              <p className="text-xs text-[#8b949e]">
                سيتم توجيه عدد ({files.length}) ملف للتفكيك والحفظ الآلي
              </p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 text-[#8b949e] hover:text-white rounded-xl hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Question 1: Target Database */}
          <div className="space-y-2">
            <label className="block text-[#c9d1d9] font-bold text-sm">
              أين تريد إضافة هذا الملف؟
            </label>

            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto custom-scrollbar p-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedDb(cat)}
                  className={`p-2.5 rounded-xl border text-right transition-all font-semibold ${
                    selectedDb === cat
                      ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-[#58a6ff]'
                      : 'bg-[#0d1117] border-[#30363d] text-[#8b949e] hover:text-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{cat}</span>
                    {selectedDb === cat && <CheckCircle2 className="w-3.5 h-3.5 text-[#58a6ff]" />}
                  </div>
                </button>
              ))}
            </div>

            {/* Add New Category Custom Input */}
            {showAddCatInput ? (
              <div className="flex gap-2 pt-2">
                <input
                  type="text"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="اسم قاعدة البيانات الجديدة..."
                  className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#58a6ff] text-[#c9d1d9] rounded-xl px-3 py-2 text-xs focus:outline-none"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white rounded-xl font-bold"
                >
                  إضافة
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowAddCatInput(true)}
                className="w-full py-2 border border-dashed border-[#30363d] hover:border-[#58a6ff] rounded-xl text-[#58a6ff] hover:bg-[#1f6feb]/10 transition-all font-bold flex items-center justify-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة قاعدة بيانات جديدة</span>
              </button>
            )}
          </div>

          {/* Question 2: Scope & Country */}
          <div className="space-y-2 pt-2 border-t border-[#30363d]">
            <label className="block text-[#c9d1d9] font-bold text-sm">
              التصنيف الجغرافي والدولة:
            </label>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setScope('local');
                  setCountry('العراق');
                }}
                className={`flex-1 p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                  scope === 'local'
                    ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-[#58a6ff]'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span>محلي (العراق)</span>
              </button>

              <button
                type="button"
                onClick={() => setScope('global')}
                className={`flex-1 p-2.5 rounded-xl border font-bold flex items-center justify-center gap-2 ${
                  scope === 'global'
                    ? 'bg-[#a371f7]/20 border-[#a371f7] text-[#a371f7]'
                    : 'bg-[#0d1117] border-[#30363d] text-[#8b949e]'
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>عالمي</span>
              </button>
            </div>

            {scope === 'global' && (
              <div className="pt-2">
                <label className="block text-[#8b949e] mb-1">اختر الدولة المستهدفة:</label>
                <select
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full bg-[#0d1117] border border-[#30363d] text-[#c9d1d9] rounded-xl p-2.5 focus:outline-none"
                >
                  {countries
                    .filter((c) => c !== 'العراق')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#0d1117] border-t border-[#30363d] flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-xl font-semibold"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={handleConfirmUpload}
            className="px-6 py-2 bg-[#1f6feb] hover:bg-[#388bfd] text-white rounded-xl font-bold shadow-md shadow-blue-500/20"
          >
            بدء المعالجة والتوجيه
          </button>
        </div>
      </div>
    </div>
  );
};
