import React from 'react';
import { ProcessingMetrics, QueueItem } from '../types/database';
import { formatBytes, formatDuration } from '../services/db';
import { queueManager } from '../services/queueManager';
import {
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  HardDrive,
  Layers,
  FileCode,
  Pause,
  Play,
  X
} from 'lucide-react';

interface ProgressPanelProps {
  metrics: ProcessingMetrics | null;
  queueItems: QueueItem[];
}

export const ProgressPanel: React.FC<ProgressPanelProps> = ({
  metrics,
  queueItems
}) => {
  if (queueItems.length === 0) return null;

  return (
    <div className="bg-[#0d1117] border border-[#30363d] rounded-xl p-4 mb-6 shadow-xl">
      {metrics && (
        <div className="mb-4">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
            <div className="flex items-center gap-2">
              <Loader2 className="w-5 h-5 text-[#58a6ff] animate-spin" />
              <span className="font-bold text-[#58a6ff] text-base">
                {metrics.statusText}
              </span>
            </div>
            <span className="text-xl font-bold font-mono text-[#2ea043]">
              {metrics.percent}%
            </span>
          </div>

          {/* Progress Bar Fill 0% to 100% */}
          <div className="w-full h-3.5 bg-[#21262d] rounded-full overflow-hidden border border-[#30363d]">
            <div
              className="h-full bg-gradient-to-r from-[#238636] via-[#2ea043] to-[#3fb950] transition-all duration-200"
              style={{ width: `${metrics.percent}%` }}
            />
          </div>

          {/* Detailed Real-time Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 text-xs">
            <div className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#8b949e]">
                <HardDrive className="w-3.5 h-3.5" />
                <span>حجم البايتات:</span>
              </div>
              <span className="font-mono text-[#c9d1d9] font-bold">
                {formatBytes(metrics.processedBytes)} / {formatBytes(metrics.totalBytes)}
              </span>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#8b949e]">
                <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span>السجلات المستخرجة:</span>
              </div>
              <span className="font-mono text-[#58a6ff] font-bold">
                {metrics.extractedRecords.toLocaleString('ar-IQ')}
              </span>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#8b949e]">
                <Clock className="w-3.5 h-3.5 text-[#e3b341]" />
                <span>الوقت المستغرق:</span>
              </div>
              <span className="font-mono text-[#e3b341] font-bold">
                {formatDuration(metrics.elapsedSeconds * 1000)}
              </span>
            </div>

            <div className="bg-[#161b22] border border-[#30363d] p-2.5 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[#8b949e]">
                <FileCode className="w-3.5 h-3.5 text-[#a371f7]" />
                <span>حالة قائمة الانتظار:</span>
              </div>
              <span className="font-mono text-[#a371f7] font-bold">
                {metrics.activeItemIndex + 1} من {metrics.queueLength} ملفات
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Queue Items List with Live Controls */}
      <div className="mt-3 pt-3 border-t border-[#30363d]/60">
        <h4 className="text-xs font-semibold text-[#8b949e] mb-2">
          قائمة ملفات الانتظار ({queueItems.length}):
        </h4>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {queueItems.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center justify-between text-xs p-2.5 rounded-xl border ${
                item.status === 'processing'
                  ? 'bg-[#1f6feb]/10 border-[#1f6feb]/40 text-[#58a6ff]'
                  : item.status === 'completed'
                  ? 'bg-[#238636]/10 border-[#238636]/30 text-[#3fb950]'
                  : item.status === 'paused'
                  ? 'bg-[#e3b341]/10 border-[#e3b341]/30 text-[#e3b341]'
                  : item.status === 'error'
                  ? 'bg-[#da3633]/10 border-[#da3633]/30 text-[#f85149]'
                  : 'bg-[#21262d] border-[#30363d] text-[#8b949e]'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="font-mono text-[10px] w-5 text-[#8b949e]">
                  #{idx + 1}
                </span>

                {item.status === 'processing' && (
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#58a6ff]" />
                )}
                {item.status === 'completed' && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#3fb950]" />
                )}
                {item.status === 'paused' && (
                  <Pause className="w-3.5 h-3.5 text-[#e3b341]" />
                )}
                {item.status === 'error' && (
                  <AlertTriangle className="w-3.5 h-3.5 text-[#f85149]" />
                )}
                {item.status === 'pending' && (
                  <Clock className="w-3.5 h-3.5 text-[#8b949e]" />
                )}

                <span className="font-medium truncate text-[#c9d1d9]">
                  {item.file.name}
                </span>
                <span className="font-mono text-[11px] text-[#8b949e]">
                  ({formatBytes(item.file.size)})
                </span>
              </div>

              <div className="flex items-center gap-2">
                {item.status === 'completed' && (
                  <span className="font-mono text-[11px] text-[#3fb950]">
                    تم استخراج {item.extractedRecordsCount.toLocaleString('ar-IQ')}{' '}
                    سجل ({item.parseDurationText})
                  </span>
                )}
                {item.status === 'error' && (
                  <span className="font-mono text-[11px] text-[#f85149]">
                    {item.errorMessage || 'خطأ'}
                  </span>
                )}
                {item.status === 'paused' && (
                  <span className="font-mono text-[11px] text-[#e3b341]">
                    متوقف مؤقتاً
                  </span>
                )}
                {item.status === 'pending' && (
                  <span className="font-mono text-[11px] text-[#8b949e]">
                    قيد الانتظار...
                  </span>
                )}

                {/* Queue Control Buttons */}
                <div className="flex items-center gap-1 mr-2 border-r border-[#30363d] pr-2">
                  {item.status === 'processing' && (
                    <button
                      onClick={() => queueManager.pauseItem(item.id)}
                      title="إيقاف مؤقت"
                      className="p-1 text-[#e3b341] hover:bg-[#e3b341]/20 rounded transition-colors"
                    >
                      <Pause className="w-3.5 h-3.5" />
                    </button>
                  )}

                  {item.status === 'paused' && (
                    <button
                      onClick={() => queueManager.resumeItem(item.id)}
                      title="استئناف"
                      className="p-1 text-[#3fb950] hover:bg-[#3fb950]/20 rounded transition-colors"
                    >
                      <Play className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => queueManager.cancelItem(item.id)}
                    title="إلغاء وحذف من القائمة"
                    className="p-1 text-[#f85149] hover:bg-[#f85149]/20 rounded transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
