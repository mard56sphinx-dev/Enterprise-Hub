import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ExtractedRecord, CategoryType } from '../types/database';
import { Search, Download, Eye, Smartphone, PhoneCall, Filter, RefreshCw } from 'lucide-react';
import * as XLSX from 'xlsx';

interface VirtualTableProps {
  records: ExtractedRecord[];
  isLoading: boolean;
  onRefresh: () => void;
  onSelectRecord: (record: ExtractedRecord) => void;
}

const ROW_HEIGHT = 48; // Constant row height in pixels

export const VirtualTable: React.FC<VirtualTableProps> = ({
  records,
  isLoading,
  onRefresh,
  onSelectRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<CategoryType | 'all'>('all');
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerHeight, setContainerHeight] = useState(500);

  // ResizeObserver to set height dynamically
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerHeight(entry.contentRect.height || 500);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Filter records based on category and search query
  const filteredRecords = useMemo(() => {
    let result = records;

    if (selectedCategory !== 'all') {
      result = result.filter((r) => r.category === selectedCategory);
    }

    if (searchTerm.trim()) {
      const q = searchTerm.trim().toLowerCase();
      result = result.filter((r) =>
        r.searchIndex.some((term) => term.includes(q))
      );
    }

    return result;
  }, [records, selectedCategory, searchTerm]);

  // Virtual Scroll Calculations
  const totalRows = filteredRecords.length;
  const totalHeight = totalRows * ROW_HEIGHT;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 3);
  const endIndex = Math.min(
    totalRows,
    Math.ceil((scrollTop + containerHeight) / ROW_HEIGHT) + 3
  );

  const visibleRows = useMemo(() => {
    return filteredRecords.slice(startIndex, endIndex).map((record, idx) => ({
      record,
      originalIndex: startIndex + idx,
      topPosition: (startIndex + idx) * ROW_HEIGHT
    }));
  }, [filteredRecords, startIndex, endIndex]);

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop);
  };

  // Dynamically extract column headers from visible records or first record
  const columnKeys = useMemo(() => {
    if (records.length === 0) return ['محتوى السجل'];
    const keysSet = new Set<string>();
    // Collect keys from sample
    records.slice(0, 50).forEach((r) => {
      Object.keys(r.data).forEach((k) => keysSet.add(k));
    });
    const keysArray = Array.from(keysSet);
    return keysArray.length > 0 ? keysArray.slice(0, 6) : ['محتوى السجل'];
  }, [records]);

  // Export filtered records to CSV or Excel
  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;
    const exportData = filteredRecords.map((r) => r.data);
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Records');
    XLSX.writeFile(wb, `Iraq_Data_Export_${new Date().toISOString().slice(0, 10)}.csv`);
  };

  const handleExportJSON = () => {
    if (filteredRecords.length === 0) return;
    const exportData = filteredRecords.map((r) => r.data);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Iraq_Data_Export_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-[500px]">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 mb-4">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8b949e]" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="ابحث بالاسم، الرقم، أو الكلمة المفتاحية (بحث لحظي فائق السرعة)..."
            className="w-full pl-4 pr-10 py-2.5 bg-[#21262d] border border-[#30363d] rounded-xl text-sm text-[#c9d1d9] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#8b949e] hover:text-white bg-[#30363d] px-2 py-0.5 rounded-md"
            >
              مسح
            </button>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'all'
                ? 'bg-[#1f6feb] border-[#388bfd] text-white'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white'
            }`}
          >
            الكل ({records.length.toLocaleString('ar-IQ')})
          </button>

          <button
            onClick={() => setSelectedCategory('zain')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedCategory === 'zain'
                ? 'bg-[#e3b341]/20 border-[#e3b341] text-[#e3b341]'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#e3b341]'
            }`}
          >
            <PhoneCall className="w-3 h-3 text-[#e3b341]" />
            <span>زين العراق</span>
          </button>

          <button
            onClick={() => setSelectedCategory('asia')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedCategory === 'asia'
                ? 'bg-[#f85149]/20 border-[#f85149] text-[#f85149]'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#f85149]'
            }`}
          >
            <Smartphone className="w-3 h-3 text-[#f85149]" />
            <span>آسيا سيل</span>
          </button>

          <button
            onClick={() => setSelectedCategory('korek')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border flex items-center gap-1.5 ${
              selectedCategory === 'korek'
                ? 'bg-[#a371f7]/20 border-[#a371f7] text-[#a371f7]'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-[#a371f7]'
            }`}
          >
            <Smartphone className="w-3 h-3 text-[#a371f7]" />
            <span>كورك</span>
          </button>

          <button
            onClick={() => setSelectedCategory('other')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all border ${
              selectedCategory === 'other'
                ? 'bg-[#8b949e]/20 border-[#8b949e] text-[#c9d1d9]'
                : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white'
            }`}
          >
            أخرى
          </button>
        </div>

        {/* Action Buttons (Export / Refresh) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            title="تحديث البيانات"
            className="p-2.5 bg-[#21262d] border border-[#30363d] rounded-xl text-[#8b949e] hover:text-white hover:bg-[#30363d] transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#238636] hover:bg-[#2ea043] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>تصدير CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            disabled={filteredRecords.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1f6feb] hover:bg-[#388bfd] disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Results Header Summary */}
      <div className="flex justify-between items-center px-1 mb-2 text-xs text-[#8b949e]">
        <span>
          عرض <strong className="text-[#58a6ff]">{filteredRecords.length.toLocaleString('ar-IQ')}</strong> من أصل{' '}
          <strong className="text-[#c9d1d9]">{records.length.toLocaleString('ar-IQ')}</strong> سجل
        </span>

        {selectedCategory !== 'all' && (
          <span className="flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#58a6ff]" /> تصفية نشطة
          </span>
        )}
      </div>

      {/* Virtualized Table Container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 relative overflow-auto border border-[#30363d] rounded-xl bg-[#0d1117] min-h-[450px] max-h-[600px] shadow-inner custom-scrollbar"
      >
        {/* Table Header Sticky */}
        <div className="sticky top-0 z-20 bg-[#161b22] border-b border-[#30363d] flex items-center font-bold text-xs text-[#8b949e] min-w-max shadow-sm">
          <div className="w-14 p-3 text-center border-l border-[#30363d]">#</div>
          <div className="w-28 p-3 text-center border-l border-[#30363d]">الشبكة</div>
          {columnKeys.map((key) => (
            <div
              key={key}
              className="flex-1 min-w-[160px] p-3 border-l border-[#30363d] truncate text-right text-[#58a6ff]"
            >
              {key}
            </div>
          ))}
          <div className="w-16 p-3 text-center">عرض</div>
        </div>

        {/* Empty State */}
        {filteredRecords.length === 0 && !isLoading && (
          <div className="flex flex-col items-center justify-center py-20 text-[#8b949e] space-y-2">
            <Search className="w-10 h-10 stroke-1 text-[#30363d]" />
            <p className="text-sm font-medium">لا توجد سجلات مطابقة لنطاق البحث أو التصفية.</p>
            <p className="text-xs text-[#8b949e]/70">
              تأكد من رفع الملفات في تبويب "إدارة الملفات والرفع" أولاً.
            </p>
          </div>
        )}

        {/* Virtual Scroll Canvas Height Spacer */}
        <div style={{ height: `${totalHeight}px`, position: 'relative', width: '100%' }}>
          {visibleRows.map(({ record, originalIndex, topPosition }) => {
            const dataVals = Object.values(record.data);
            return (
              <div
                key={record.id || originalIndex}
                onClick={() => onSelectRecord(record)}
                style={{
                  position: 'absolute',
                  top: `${topPosition + 40}px`, // offset for sticky header
                  height: `${ROW_HEIGHT}px`,
                  left: 0,
                  right: 0
                }}
                className="flex items-center border-b border-[#30363d]/60 hover:bg-[#1c2128] cursor-pointer transition-colors text-xs text-[#c9d1d9] min-w-max"
              >
                {/* Index Number */}
                <div className="w-14 p-3 text-center font-mono text-[#8b949e] border-l border-[#30363d]/40">
                  {originalIndex + 1}
                </div>

                {/* Network Carrier Badge */}
                <div className="w-28 p-2 text-center border-l border-[#30363d]/40 flex justify-center">
                  {record.category === 'zain' && (
                    <span className="px-2 py-0.5 rounded-md bg-[#e3b341]/15 border border-[#e3b341]/40 text-[#e3b341] text-[10px] font-bold">
                      زين العراق
                    </span>
                  )}
                  {record.category === 'asia' && (
                    <span className="px-2 py-0.5 rounded-md bg-[#f85149]/15 border border-[#f85149]/40 text-[#f85149] text-[10px] font-bold">
                      آسيا سيل
                    </span>
                  )}
                  {record.category === 'korek' && (
                    <span className="px-2 py-0.5 rounded-md bg-[#a371f7]/15 border border-[#a371f7]/40 text-[#a371f7] text-[10px] font-bold">
                      كورك
                    </span>
                  )}
                  {record.category === 'international' && (
                    <span className="px-2 py-0.5 rounded-md bg-[#388bfd]/15 border border-[#388bfd]/40 text-[#388bfd] text-[10px] font-bold">
                      دولي
                    </span>
                  )}
                  {record.category === 'other' && (
                    <span className="px-2 py-0.5 rounded-md bg-[#30363d] text-[#8b949e] text-[10px]">
                      عام
                    </span>
                  )}
                </div>

                {/* Column Values */}
                {columnKeys.map((key, i) => {
                  const val = record.data[key] ?? dataVals[i] ?? '';
                  const valStr = val !== null && val !== undefined ? String(val) : '';
                  return (
                    <div
                      key={key + i}
                      className="flex-1 min-w-[160px] p-3 border-l border-[#30363d]/40 truncate text-right font-mono"
                    >
                      {valStr}
                    </div>
                  );
                })}

                {/* View Modal Trigger */}
                <div className="w-16 p-2 text-center flex justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectRecord(record);
                    }}
                    className="p-1.5 text-[#8b949e] hover:text-[#58a6ff] hover:bg-[#30363d] rounded-lg transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
