import React, { useState, useEffect } from 'react';
import { History, Search, Trash2, Download, ShieldCheck, FileText } from 'lucide-react';
import { AuditLog } from '../types/database';
import { db } from '../services/db';

export const AuditJournal: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filterText, setFilterText] = useState('');
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const allLogs = await db.auditLogs.reverse().toArray();
      setLogs(allLogs);
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const handleClearLogs = async () => {
    if (window.confirm('هل أنت تأكيد من رغبتك في مسح كافة سجلات الحركات والنشاطات؟')) {
      await db.auditLogs.clear();
      setLogs([]);
    }
  };

  const handleExportLogs = () => {
    const text = logs
      .map((l) => `[${l.timestamp}] [${l.action}] ${l.details}`)
      .join('\n');

    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `مسودة_الحركات_${new Date().toISOString().substring(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(filterText.toLowerCase()) ||
      l.details.toLowerCase().includes(filterText.toLowerCase()) ||
      l.timestamp.includes(filterText)
  );

  const getTypeBadge = (type: AuditLog['type']) => {
    switch (type) {
      case 'upload':
        return <span className="px-2 py-0.5 rounded bg-[#238636]/20 text-[#3fb950] border border-[#238636]/40 font-bold text-[10px]">رفع ملف</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded bg-[#da3633]/20 text-[#f85149] border border-[#da3633]/40 font-bold text-[10px]">حذف</span>;
      case 'search':
        return <span className="px-2 py-0.5 rounded bg-[#1f6feb]/20 text-[#58a6ff] border border-[#1f6feb]/40 font-bold text-[10px]">استعلام</span>;
      case 'family':
        return <span className="px-2 py-0.5 rounded bg-[#a371f7]/20 text-[#a371f7] border border-[#a371f7]/40 font-bold text-[10px]">جلب عائلة</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-[#30363d] text-[#c9d1d9] font-bold text-[10px]">نظام</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#161b22] via-[#241a3d] to-[#161b22] border border-[#a371f7]/40 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="w-5 h-5 text-[#a371f7]" />
            <h2 className="text-lg font-bold text-[#c9d1d9]">
              مسودة الحركات والنشاطات (System Audit Journal)
            </h2>
          </div>
          <p className="text-xs text-[#8b949e]">
            سجل زمني دقيق وموثق لجميع عمليات البحث، الاستعلامات، إضافات البيانات، وحذف الملفات
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#c9d1d9] hover:text-white rounded-xl text-xs font-semibold transition-all disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>تصدير المسودة</span>
          </button>

          <button
            onClick={handleClearLogs}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#da3633]/15 hover:bg-[#da3633]/25 border border-[#da3633]/40 text-[#f85149] rounded-xl text-xs font-bold transition-all disabled:opacity-50"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>مسح المسودة</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-4 shadow-lg flex items-center gap-3">
        <Search className="w-4 h-4 text-[#8b949e]" />
        <input
          type="text"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          placeholder="تصفية السجلات حسب نوع الحركة أو النص..."
          className="w-full bg-transparent text-xs text-[#c9d1d9] focus:outline-none placeholder-[#8b949e]"
        />
      </div>

      {/* Audit Log Entries List */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-2xl p-5 shadow-lg space-y-3">
        {loading ? (
          <p className="text-xs text-[#8b949e] text-center py-8">جاري تحميل سجل النشاطات...</p>
        ) : filteredLogs.length > 0 ? (
          <div className="space-y-2.5 max-h-[600px] overflow-y-auto custom-scrollbar pr-1">
            {filteredLogs.map((log) => (
              <div
                key={log.id}
                className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl text-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 hover:border-[#a371f7]/40 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getTypeBadge(log.type)}</div>
                  <div>
                    <div className="font-bold text-[#c9d1d9]">{log.action}</div>
                    <div className="text-[#8b949e] text-[11px] mt-0.5">{log.details}</div>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-[#8b949e] whitespace-nowrap self-end sm:self-center bg-[#161b22] px-2 py-1 rounded border border-[#30363d]">
                  {log.timestamp}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-[#8b949e] space-y-2">
            <FileText className="w-8 h-8 mx-auto opacity-40 text-[#a371f7]" />
            <p className="text-sm">لا توجد حركات مسجلة حالياً في المسودة</p>
          </div>
        )}
      </div>
    </div>
  );
};
