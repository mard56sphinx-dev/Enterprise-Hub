import React, { useState, useEffect, useRef } from 'react';
import {
  Settings,
  Globe,
  Plus,
  Trash2,
  Database,
  Upload,
  FileSpreadsheet,
  FileCode,
  Archive,
  FileText,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  CheckCircle2,
  Server,
  Edit3
} from 'lucide-react';
import { StoredFile, CountryRecord, GovernorateRecord, DatabaseCategory } from '../types/database';
import { FileEditorModal } from './FileEditorModal';
import {
  getCountries,
  addCountry,
  deleteCountry,
  getGovernorates,
  addGovernorate,
  deleteGovernorate,
  db
} from '../services/db';

interface SystemSettingsProps {
  files: StoredFile[];
  onUploadSelect: (files: File[]) => void;
  onRequestDelete: (file: StoredFile) => void;
  isPersisted: boolean;
  onRequestPersistence: () => void;
}

export const SystemSettings: React.FC<SystemSettingsProps> = ({
  files,
  onUploadSelect,
  onRequestDelete,
  isPersisted,
  onRequestPersistence
}) => {
  const [activeSection, setActiveSection] = useState<'countries' | 'files' | 'persistence'>('countries');

  // Country & Sector Management State
  const [countriesList, setCountriesList] = useState<CountryRecord[]>([]);
  const [selectedCountryObj, setSelectedCountryObj] = useState<string>('العراق');
  const [governoratesList, setGovernoratesList] = useState<GovernorateRecord[]>([]);
  const [categoriesList, setCategoriesList] = useState<DatabaseCategory[]>([]);
  const [editingFile, setEditingFile] = useState<StoredFile | null>(null);

  // Form Inputs
  const [newCountryName, setNewCountryName] = useState('');
  const [newCountryCode, setNewCountryCode] = useState('');
  const [newGovName, setNewGovName] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshData = async () => {
    try {
      const cList = await getCountries();
      setCountriesList(cList);

      if (selectedCountryObj) {
        const gList = await getGovernorates(selectedCountryObj);
        setGovernoratesList(gList);

        const cats = await db.categories.where('country').equals(selectedCountryObj).toArray();
        setCategoriesList(cats);
      }
    } catch (err) {
      console.error('Error refreshing settings data:', err);
    }
  };

  useEffect(() => {
    refreshData();
  }, [selectedCountryObj]);

  const handleAddCountrySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountryName.trim()) return;
    await addCountry(newCountryName.trim(), newCountryCode.trim());
    setNewCountryName('');
    setNewCountryCode('');
    await refreshData();
  };

  const handleDeleteCountryClick = async (id: number) => {
    if (window.confirm('هل أنت تأكيد من رغبتك في حذف هذه الدولة وكافة المحافظات التابعة لها؟')) {
      await deleteCountry(id);
      await refreshData();
    }
  };

  const handleAddGovSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGovName.trim()) return;
    await addGovernorate(selectedCountryObj, newGovName.trim());
    setNewGovName('');
    await refreshData();
  };

  const handleDeleteGovClick = async (id: number) => {
    await deleteGovernorate(id);
    await refreshData();
  };

  const handleAddCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    await db.categories.add({
      name: newCategoryName.trim(),
      scope: selectedCountryObj === 'العراق' ? 'local' : 'global',
      country: selectedCountryObj,
      isSystem: false
    });
    setNewCategoryName('');
    await refreshData();
  };

  const handleDeleteCategoryClick = async (id: number) => {
    await db.categories.delete(id);
    await refreshData();
  };

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (ext === 'xlsx' || ext === 'xls' || ext === 'csv') {
      return <FileSpreadsheet className="w-4 h-4 text-[#2ea043]" />;
    }
    if (ext === 'json') {
      return <FileCode className="w-4 h-4 text-[#a371f7]" />;
    }
    if (ext === 'zip') {
      return <Archive className="w-4 h-4 text-[#e3b341]" />;
    }
    return <FileText className="w-4 h-4 text-[#58a6ff]" />;
  };

  return (
    <div className="space-y-6">
      {/* Settings Navigation Header Banner */}
      <div className="bg-gradient-to-r from-[#161b22] via-[#1c2333] to-[#161b22] border border-[#388bfd]/40 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Settings className="w-5 h-5 text-[#58a6ff]" />
            <h2 className="text-lg font-bold text-[#c9d1d9]">
              إعدادات البرنامج والمنظومة (Central System Settings)
            </h2>
          </div>
          <p className="text-xs text-[#8b949e]">
            إدارة الشاملة لقواعد البيانات، إنشاء الدول والقطاعات، استيراد الملفات الضخمة وتحديد صلاحيات التخزين
          </p>
        </div>

        {/* Settings Navigation Tabs */}
        <div className="flex bg-[#0d1117] p-1 rounded-xl border border-[#30363d]">
          <button
            onClick={() => setActiveSection('countries')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'countries'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>الدول والقطاعات والمحافظات</span>
          </button>

          <button
            onClick={() => setActiveSection('files')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'files'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-[#3fb950]" />
            <span>الملفات المخزنة والرفع ({files.length})</span>
          </button>

          <button
            onClick={() => setActiveSection('persistence')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSection === 'persistence'
                ? 'bg-[#1f6feb] text-white shadow-sm'
                : 'text-[#8b949e] hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5 text-[#e3b341]" />
            <span>حالة الذاكرة التخزينية</span>
          </button>
        </div>
      </div>

      {/* SECTION 1: Country & Sector Blueprint Engine */}
      {activeSection === 'countries' && (
        <div className="space-y-6">
          {/* Create New Country Blueprint Card */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-[#30363d]">
              <h3 className="text-sm font-bold text-[#58a6ff] flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#a371f7]" />
                <span>إنشاء دولة جديدة وتحديد الخصائص الهيكلية (Country Blueprint)</span>
              </h3>
            </div>

            <form onSubmit={handleAddCountrySubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={newCountryName}
                onChange={(e) => setNewCountryName(e.target.value)}
                placeholder="اسم الدولة الجديدة (مثال: سوريا، مصر، الأردن...)"
                className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none"
              />
              <input
                type="text"
                value={newCountryCode}
                onChange={(e) => setNewCountryCode(e.target.value)}
                placeholder="رمز الدولة (اختياري: SY, EG...)"
                className="w-full sm:w-36 bg-[#0d1117] border border-[#30363d] focus:border-[#a371f7] text-[#c9d1d9] text-xs rounded-xl px-3.5 py-2.5 focus:outline-none font-mono"
              />
              <button
                type="submit"
                className="px-5 py-2.5 bg-[#a371f7] hover:bg-[#8957e5] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>إنشاء دولة جديدة</span>
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs text-[#8b949e]">الدول النشطة في المنظومة:</span>
              {countriesList.map((c) => (
                <div
                  key={c.id || c.name}
                  onClick={() => setSelectedCountryObj(c.name)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold border cursor-pointer transition-all flex items-center gap-2 ${
                    selectedCountryObj === c.name
                      ? 'bg-[#1f6feb]/20 border-[#1f6feb] text-[#58a6ff]'
                      : 'bg-[#0d1117] border-[#30363d] text-[#c9d1d9] hover:border-[#8b949e]'
                  }`}
                >
                  <span>{c.name}</span>
                  {c.isDefault && <span className="text-[9px] text-[#3fb950] font-mono">(افتراضي)</span>}
                  {!c.isDefault && c.id && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCountryClick(c.id!);
                      }}
                      className="text-[#f85149] hover:text-white transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Country Configuration Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sector / Category DB Manager for Selected Country */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#30363d]">
                <h4 className="text-xs font-bold text-[#3fb950] flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  <span>قطاعات وقواعد بيانات [{selectedCountryObj}]</span>
                </h4>
                <span className="text-[10px] text-[#8b949e] font-mono">
                  {categoriesList.length} قطاعات
                </span>
              </div>

              <form onSubmit={handleAddCategorySubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder={`إضافة قطاع/قاعدة جديدة لـ ${selectedCountryObj}...`}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#3fb950] text-[#c9d1d9] text-xs rounded-xl px-3 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </form>

              <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                {categoriesList.map((cat) => (
                  <div
                    key={cat.id || cat.name}
                    className="p-2.5 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs flex justify-between items-center"
                  >
                    <span className="font-bold text-[#c9d1d9]">{cat.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#8b949e]">
                        {cat.scope === 'local' ? 'محلي' : 'عالمي'}
                      </span>
                      {!cat.isSystem && cat.id && (
                        <button
                          onClick={() => handleDeleteCategoryClick(cat.id!)}
                          className="text-[#f85149] hover:text-white transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Governorates Manager for Selected Country */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#30363d]">
                <h4 className="text-xs font-bold text-[#e3b341] flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>قائمة المحافظات لـ [{selectedCountryObj}]</span>
                </h4>
                <span className="text-[10px] text-[#8b949e] font-mono">
                  {governoratesList.length} محافظة
                </span>
              </div>

              <form onSubmit={handleAddGovSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={newGovName}
                  onChange={(e) => setNewGovName(e.target.value)}
                  placeholder={`إضافة محافظة جديدة لـ ${selectedCountryObj}...`}
                  className="flex-1 bg-[#0d1117] border border-[#30363d] focus:border-[#e3b341] text-[#c9d1d9] text-xs rounded-xl px-3 py-2 focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#d29922] hover:bg-[#e3b341] text-black font-bold text-xs rounded-xl transition-all flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </form>

              <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto custom-scrollbar">
                {governoratesList.map((g) => (
                  <div
                    key={g.id || g.name}
                    className="p-2 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs flex justify-between items-center"
                  >
                    <span className="font-semibold text-[#c9d1d9]">{g.name}</span>
                    {g.id && (
                      <button
                        onClick={() => handleDeleteGovClick(g.id!)}
                        className="text-[#8b949e] hover:text-[#f85149] transition-colors p-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: Stored Files & Universal Ingestion Engine */}
      {activeSection === 'files' && (
        <div className="space-y-6">
          {/* File Upload Box */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#30363d] hover:border-[#58a6ff] bg-[#0d1117] rounded-2xl p-8 text-center cursor-pointer transition-all hover:bg-[#161b22] group shadow-inner"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".csv,.xlsx,.xls,.json,.txt,.zip,.sql,.xml"
              onChange={(e) => {
                if (e.target.files) onUploadSelect(Array.from(e.target.files));
              }}
              className="hidden"
            />

            <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-[#1f6feb]/10 group-hover:bg-[#1f6feb]/20 text-[#58a6ff] flex items-center justify-center transition-all shadow-sm">
              <Upload className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-[#c9d1d9] group-hover:text-[#58a6ff] transition-colors mb-1">
              استيراد ورفع الملفات الضخمة (CSV, XLSX, XLS, JSON, TXT, ZIP, SQL, XML)
            </h3>
            <p className="text-xs text-[#8b949e]">
              اضغط هنا لاختيار الملفات أو اسحبها وأسقطها هنا — تفكيك وتوزيع تلقائي فوري بحسب الدولة والقطاع
            </p>
          </div>

          {/* Stored Files Table */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-lg">
            <div className="px-5 py-4 border-b border-[#30363d] flex justify-between items-center">
              <h3 className="font-bold text-[#58a6ff] text-base flex items-center gap-2">
                <Database className="w-4 h-4 text-[#3fb950]" />
                <span>الملفات وقواعد البيانات المخزنة</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-[#21262d] text-[#8b949e] border border-[#30363d] font-mono">
                  {files.length} ملفات
                </span>
              </h3>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] font-semibold">
                  <tr>
                    <th className="p-3.5">اسم الملف</th>
                    <th className="p-3.5">قاعدة البيانات / القطاع</th>
                    <th className="p-3.5 font-mono">الدولة / النطاق</th>
                    <th className="p-3.5 font-mono">الحجم</th>
                    <th className="p-3.5 font-mono">تاريخ الرفع</th>
                    <th className="p-3.5 font-mono">السجلات</th>
                    <th className="p-3.5 text-center">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#30363d]/50">
                  {files.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-[#8b949e]">
                        لا توجد ملفات مخزنة حالياً في ذاكرة التطبيق
                      </td>
                    </tr>
                  ) : (
                    files.map((file) => (
                      <tr key={file.id} className="hover:bg-[#1c2128] transition-colors text-[#c9d1d9]">
                        <td className="p-3.5 font-bold text-[#58a6ff] flex items-center gap-2 max-w-[200px] truncate">
                          {getFileIcon(file.fileName)}
                          <span className="truncate">{file.fileName}</span>
                        </td>
                        <td className="p-3.5 font-bold text-[#3fb950]">{file.targetDatabase}</td>
                        <td className="p-3.5 font-mono text-[#a371f7]">{file.country} ({file.scope === 'global' ? 'عالمي' : 'محلي'})</td>
                        <td className="p-3.5 font-mono text-[#8b949e]">{file.fileSize}</td>
                        <td className="p-3.5 font-mono text-[#8b949e]">{file.uploadTimestamp}</td>
                        <td className="p-3.5 font-mono font-bold text-[#2ea043]">
                          {(file.recordCount || 0).toLocaleString('ar-IQ')} سجل
                        </td>
                        <td className="p-3.5 text-center flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingFile(file)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-[#1f6feb]/15 border border-[#1f6feb]/40 text-[#58a6ff] hover:bg-[#1f6feb] hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>تعديل السجلات</span>
                          </button>

                          <button
                            onClick={() => onRequestDelete(file)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#da3633]/15 border border-[#da3633]/40 text-[#f85149] hover:bg-[#da3633] hover:text-white rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>حذف</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: Offline Storage & IndexedDB Persistence Status */}
      {activeSection === 'persistence' && (
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-6 shadow-lg space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#30363d]">
            <div className="w-12 h-12 rounded-2xl bg-[#238636]/20 border border-[#238636]/40 flex items-center justify-center text-[#3fb950]">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#c9d1d9]">
                حالة التخزين والذاكرة دائمياً (100% Offline IndexedDB Engine)
              </h3>
              <p className="text-xs text-[#8b949e]">
                يعمل التطبيق بالكامل داخل متصفحك دون الحاجة لاتصال خوادم خارجية
              </p>
            </div>
          </div>

          <div className="p-4 bg-[#0d1117] rounded-xl border border-[#30363d] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              {isPersisted ? (
                <ShieldCheck className="w-6 h-6 text-[#3fb950]" />
              ) : (
                <ShieldAlert className="w-6 h-6 text-[#d29922]" />
              )}
              <div>
                <div className="text-xs font-bold text-[#c9d1d9]">
                  {isPersisted ? 'التخزين الدائم مفعّل (Persistent Storage Active)' : 'التخزين القياسي (Temporary Storage)'}
                </div>
                <div className="text-[11px] text-[#8b949e] mt-0.5">
                  {isPersisted
                    ? 'بياناتك وقواعد بياناتك محمية بشكل كامل ولن يتم مسحها تلقائياً من قبل المتصفح'
                    : 'يمكنك تفعيل التخزين الدائم لضمان بقاء البيانات عند مسح ذاكرة المؤقتة للمتصفح'}
                </div>
              </div>
            </div>

            {!isPersisted && (
              <button
                onClick={onRequestPersistence}
                className="px-4 py-2 bg-[#238636] hover:bg-[#2ea043] text-white font-bold text-xs rounded-xl transition-all shadow-md flex items-center gap-2 whitespace-nowrap"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>طلب التخزين الدائم</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Live In-App File Editor Modal */}
      {editingFile && (
        <FileEditorModal
          file={editingFile}
          onClose={() => setEditingFile(null)}
          onSaved={() => {
            setEditingFile(null);
            refreshData();
          }}
        />
      )}
    </div>
  );
};
