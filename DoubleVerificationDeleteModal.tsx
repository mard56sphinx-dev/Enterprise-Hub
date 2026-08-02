import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { StoredFile } from '../types/database';

interface DoubleVerificationDeleteModalProps {
  file: StoredFile;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DoubleVerificationDeleteModal: React.FC<DoubleVerificationDeleteModalProps> = ({
  file,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#161b22] border border-[#da3633]/60 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-fadeIn space-y-4">
        {/* Header */}
        <div className="p-4 border-b border-[#30363d] flex justify-between items-center bg-[#da3633]/10">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#da3633]/20 border border-[#da3633]/40 flex items-center justify-center text-[#f85149]">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#f85149]">
                تأكيد الحذف النهائي للملف
              </h3>
              <p className="text-xs text-[#8b949e]">خطوة التحقق الثانية والأخيرة</p>
            </div>
          </div>

          <button
            onClick={onCancel}
            className="p-2 text-[#8b949e] hover:text-white rounded-xl hover:bg-[#30363d] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* File Details Warning Box */}
        <div className="p-5 space-y-3 text-xs text-[#c9d1d9]">
          <p className="leading-relaxed">
            هل أنت متأكد تماماً من رغبتك في حذف هذا الملف نهائياً وكافة السجلات المستخرجة منه؟
          </p>

          <div className="p-3 bg-[#0d1117] border border-[#30363d] rounded-xl space-y-1.5 font-mono text-[11px]">
            <div>
              <span className="text-[#8b949e]">اسم الملف: </span>
              <span className="text-[#58a6ff] font-bold">{file.fileName}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">قاعدة البيانات المستهدفة: </span>
              <span className="text-[#3fb950] font-bold">{file.targetDatabase || 'العراق'}</span>
            </div>
            <div>
              <span className="text-[#8b949e]">عدد السجلات المسجلة: </span>
              <span className="text-[#a371f7] font-bold">
                {file.recordCount.toLocaleString('ar-IQ')} سجل
              </span>
            </div>
            <div>
              <span className="text-[#8b949e]">حجم الملف: </span>
              <span className="text-[#c9d1d9]">{file.fileSize}</span>
            </div>
          </div>

          <p className="text-[11px] text-[#f85149] font-bold bg-[#da3633]/10 p-2.5 rounded-lg border border-[#da3633]/30">
            تنبيه: هذا الإجراء لا يمكن التراجع عنه وسيمسح كافة السجلات المرتبطة من التخزين المحلي.
          </p>
        </div>

        {/* Footer Buttons */}
        <div className="p-4 bg-[#0d1117] border-t border-[#30363d] flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-[#21262d] hover:bg-[#30363d] text-[#c9d1d9] rounded-xl text-xs font-semibold"
          >
            إلغاء الأمر
          </button>

          <button
            onClick={onConfirm}
            className="px-6 py-2 bg-[#da3633] hover:bg-[#f85149] text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            <span>تأكيد الحذف النهائي</span>
          </button>
        </div>
      </div>
    </div>
  );
};
