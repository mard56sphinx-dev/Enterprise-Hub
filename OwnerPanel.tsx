import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldCheck, Plus, Trash2, ToggleLeft, ToggleRight,
  Copy, Check, RefreshCw, KeyRound, Clock, AlertCircle,
  Eye, EyeOff, CalendarClock,
} from 'lucide-react';
import {
  generateCode, getManagedCodes, addManagedCode, updateManagedCode,
  deleteManagedCode, blockCode, unblockCode, ManagedCode,
} from '../services/codeValidation';
import { getOwnerSecret, setOwnerSecret, SYMBOL_PALETTE_EXPORT } from './OwnerLoginModal';

const SYMBOLS = SYMBOL_PALETTE_EXPORT;

type DurationKey = '1d' | '1w' | '1m' | '3m' | 'custom';
const DURATIONS: { key: DurationKey; label: string; ms: number }[] = [
  { key: '1d', label: 'يوم',    ms: 86400000 },
  { key: '1w', label: 'أسبوع', ms: 7  * 86400000 },
  { key: '1m', label: 'شهر',   ms: 30 * 86400000 },
  { key: '3m', label: '3 أشهر', ms: 90 * 86400000 },
  { key: 'custom', label: 'مخصص', ms: 0 },
];

function getDurationMs(key: DurationKey, customDays: string): number {
  const found = DURATIONS.find(d => d.key === key);
  if (key === 'custom') return Math.max(1, parseInt(customDays) || 7) * 86400000;
  return found?.ms ?? 7 * 86400000;
}

function formatExpiry(ms: number): string {
  const now = Date.now();
  if (ms < now) return 'منتهية الصلاحية';
  const diff = ms - now;
  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000)  / 60000);
  if (days > 0) return `${days} يوم و${hours} ساعة`;
  return `${hours} ساعة و${mins} دقيقة`;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleDateString('ar-IQ', { year: 'numeric', month: 'short', day: 'numeric' });
}

export const OwnerPanel: React.FC = () => {
  const [codes, setCodes] = useState<ManagedCode[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [label, setLabel]     = useState('');
  const [duration, setDuration] = useState<DurationKey>('1w');
  const [customDays, setCustomDays] = useState('30');
  const [previewCode, setPreviewCode] = useState('');
  const [copied, setCopied]   = useState<string | null>(null);
  const [msg, setMsg]         = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  // Extend modal
  const [extendTarget, setExtendTarget] = useState<ManagedCode | null>(null);
  const [extDuration, setExtDuration]   = useState<DurationKey>('1m');
  const [extCustomDays, setExtCustomDays] = useState('30');

  // Secret change
  const [showSecretPanel, setShowSecretPanel] = useState(false);
  const [newSecret, setNewSecret]         = useState('');
  const [confirmSecret, setConfirmSecret] = useState('');
  const [showCurrentSecret, setShowCurrentSecret] = useState(false);

  const load = useCallback(() => setCodes(getManagedCodes()), []);
  useEffect(() => { load(); }, [load]);

  const showMsg = (text: string, type: 'ok' | 'err' = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3500);
  };

  // ── Create code ──────────────────────────────────────────────────────────

  const handleGenerate = () => {
    const expiresAt = Date.now() + getDurationMs(duration, customDays);
    setPreviewCode(generateCode(expiresAt));
  };

  const handleCreate = () => {
    if (!label.trim()) { showMsg('أدخل وصفاً للكود', 'err'); return; }
    if (!previewCode)  { showMsg('اضغط "توليد" أولاً', 'err'); return; }
    const expiresAt = Date.now() + getDurationMs(duration, customDays);
    const raw = previewCode.replace(/-/g, '');
    addManagedCode({ code: previewCode, raw, label: label.trim(), createdAt: Date.now(), expiresAt, isBlocked: false });
    showMsg(`✓ تم إنشاء الكود: ${previewCode}`);
    setLabel(''); setPreviewCode(''); setDuration('1w'); setCustomDays('30');
    setShowCreate(false);
    load();
  };

  // ── Toggle block ─────────────────────────────────────────────────────────

  const handleToggle = (c: ManagedCode) => {
    const next = !c.isBlocked;
    if (next) blockCode(c.raw); else unblockCode(c.raw);
    updateManagedCode(c.id, { isBlocked: next });
    showMsg(next ? `✗ تم تعطيل الكود: ${c.code}` : `✓ تم تفعيل الكود: ${c.code}`);
    load();
  };

  // ── Delete ───────────────────────────────────────────────────────────────

  const handleDelete = (c: ManagedCode) => {
    if (!confirm(`هل تريد حذف الكود "${c.code}" نهائياً؟`)) return;
    deleteManagedCode(c.id);
    showMsg(`تم حذف الكود: ${c.code}`);
    load();
  };

  // ── Extend subscription ──────────────────────────────────────────────────

  const handleExtend = () => {
    if (!extendTarget) return;
    // New expiry starts from the later of (current expiry, now) + extension
    const base = Math.max(extendTarget.expiresAt, Date.now());
    const expiresAt = base + getDurationMs(extDuration, extCustomDays);
    const newCode = generateCode(expiresAt);
    const raw     = newCode.replace(/-/g, '');
    addManagedCode({
      code: newCode,
      raw,
      label: `${extendTarget.label} — تمديد`,
      createdAt: Date.now(),
      expiresAt,
      isBlocked: false,
    });
    showMsg(`✓ تم إنشاء كود التمديد: ${newCode}`);
    setExtendTarget(null);
    load();
  };

  // ── Copy ─────────────────────────────────────────────────────────────────

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
    setCopied(text);
    setTimeout(() => setCopied(null), 2000);
  };

  // ── Save secret ───────────────────────────────────────────────────────────

  const handleSaveSecret = () => {
    if (newSecret.length < 3)           { showMsg('الرمز السري يجب أن يكون 3 رموز على الأقل', 'err'); return; }
    if (newSecret !== confirmSecret)    { showMsg('الرمزان غير متطابقان', 'err'); return; }
    setOwnerSecret(newSecret);
    setNewSecret(''); setConfirmSecret(''); setShowSecretPanel(false);
    showMsg('✓ تم تحديث الرمز السري بنجاح');
  };

  // ── Status badge ─────────────────────────────────────────────────────────

  const statusBadge = (c: ManagedCode) => {
    if (c.isBlocked)          return <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#da3633]/15 border border-[#da3633]/30 text-[#ff7b72]">معطّل</span>;
    if (c.expiresAt < Date.now()) return <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#d29922]/15 border border-[#d29922]/30 text-[#d29922]">منتهي</span>;
    return <span className="px-2 py-0.5 text-[10px] rounded-full bg-[#238636]/15 border border-[#238636]/30 text-[#3fb950]">فعّال</span>;
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Toast */}
      {msg && (
        <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-xl border text-sm font-medium flex items-center gap-2 ${
          msg.type === 'ok'
            ? 'bg-[#238636]/20 border-[#238636]/40 text-[#3fb950]'
            : 'bg-[#da3633]/20 border-[#da3633]/40 text-[#ff7b72]'
        }`}>
          {msg.type === 'ok' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
          {msg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#a371f7]" />
          <h2 className="text-lg font-bold text-[#c9d1d9]">لوحة تحكم المالك</h2>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#a371f7]/20 border border-[#a371f7]/30 text-[#a371f7] font-mono">OWNER</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={load}
            className="p-2 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-white transition-all">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => setShowSecretPanel(!showSecretPanel)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#a371f7]/10 hover:bg-[#a371f7]/20 border border-[#a371f7]/30 text-[#a371f7] text-xs font-semibold transition-all">
            <KeyRound className="w-3.5 h-3.5" />
            تغيير الرمز السري
          </button>
          <button onClick={() => { setShowCreate(!showCreate); setPreviewCode(''); }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-bold transition-all">
            <Plus className="w-3.5 h-3.5" />
            كود جديد
          </button>
        </div>
      </div>

      {/* Change Secret Panel */}
      {showSecretPanel && (
        <div className="bg-[#161b22] border border-[#a371f7]/30 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#a371f7] flex items-center gap-2">
            <KeyRound className="w-4 h-4" />
            تغيير الرمز السري لوصول المالك
          </h3>
          <div className="flex items-center gap-2 text-xs text-[#8b949e] bg-[#0d1117] rounded-lg px-3 py-2 border border-[#30363d]">
            <span>الرمز الحالي:</span>
            <span className="font-mono tracking-widest text-base">
              {showCurrentSecret ? getOwnerSecret() : getOwnerSecret().replace(/./g, '●')}
            </span>
            <button onClick={() => setShowCurrentSecret(!showCurrentSecret)} className="text-[#8b949e] hover:text-white ml-auto">
              {showCurrentSecret ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
          <p className="text-xs text-[#8b949e]">اختر الرمز السري الجديد:</p>
          <div className="grid grid-cols-10 gap-1">
            {SYMBOLS.map(sym => (
              <button key={sym} onClick={() => setNewSecret(p => p + sym)}
                className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg py-1.5 text-base text-[#c9d1d9] transition-all hover:scale-105 font-bold">
                {sym}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-lg tracking-widest text-center text-[#c9d1d9] min-h-[44px] flex items-center justify-center">
              {newSecret || <span className="text-[#484f58] text-sm tracking-normal">الرمز الجديد</span>}
            </div>
            <button onClick={() => setNewSecret(p => p.slice(0,-1))} className="px-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white transition-all text-xs">⌫</button>
            <button onClick={() => setNewSecret('')} className="px-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white transition-all text-xs">مسح</button>
          </div>
          <p className="text-xs text-[#8b949e]">أعد إدخال الرمز للتأكيد:</p>
          <div className="grid grid-cols-10 gap-1">
            {SYMBOLS.map(sym => (
              <button key={`c-${sym}`} onClick={() => setConfirmSecret(p => p + sym)}
                className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-lg py-1.5 text-base text-[#c9d1d9] transition-all hover:scale-105 font-bold">
                {sym}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <div className={`flex-1 bg-[#0d1117] border rounded-lg px-3 py-2 text-lg tracking-widest text-center min-h-[44px] flex items-center justify-center ${
              confirmSecret && confirmSecret === newSecret ? 'border-[#238636]/50 text-[#3fb950]' :
              confirmSecret && confirmSecret !== newSecret ? 'border-[#da3633]/50 text-[#ff7b72]' :
              'border-[#30363d] text-[#c9d1d9]'
            }`}>
              {confirmSecret || <span className="text-[#484f58] text-sm tracking-normal">تأكيد الرمز</span>}
            </div>
            <button onClick={() => setConfirmSecret(p => p.slice(0,-1))} className="px-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white transition-all text-xs">⌫</button>
            <button onClick={() => setConfirmSecret('')} className="px-3 bg-[#21262d] border border-[#30363d] rounded-lg text-[#8b949e] hover:text-white transition-all text-xs">مسح</button>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleSaveSecret}
              disabled={newSecret.length < 3 || newSecret !== confirmSecret}
              className="flex-1 bg-[#a371f7] hover:bg-[#b989ff] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-bold py-2 rounded-xl text-sm transition-all">
              حفظ الرمز السري الجديد
            </button>
            <button onClick={() => { setShowSecretPanel(false); setNewSecret(''); setConfirmSecret(''); }}
              className="px-5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-sm transition-all">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Create Code Panel */}
      {showCreate && (
        <div className="bg-[#161b22] border border-[#238636]/30 rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold text-[#3fb950] flex items-center gap-2">
            <Plus className="w-4 h-4" />
            إنشاء كود تفعيل جديد
          </h3>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">وصف الكود (للمستخدم)</label>
            <input
              value={label} onChange={e => setLabel(e.target.value)}
              placeholder="مثال: مستخدم أحمد - وحدة البحث"
              className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-sm text-[#c9d1d9] placeholder:text-[#484f58] focus:outline-none focus:border-[#1f6feb] transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">مدة الصلاحية</label>
            <div className="grid grid-cols-5 gap-1.5">
              {DURATIONS.map(({ key, label: lbl }) => (
                <button key={key} onClick={() => setDuration(key)}
                  className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                    duration === key
                      ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                      : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white hover:border-[#8b949e]'
                  }`}>
                  {lbl}
                </button>
              ))}
            </div>
            {duration === 'custom' && (
              <div className="mt-2 flex items-center gap-2">
                <input type="number" min="1" max="3650"
                  value={customDays} onChange={e => setCustomDays(e.target.value)}
                  className="w-24 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] text-center focus:outline-none focus:border-[#1f6feb] transition-all"
                  dir="ltr" />
                <span className="text-sm text-[#8b949e]">يوم</span>
              </div>
            )}
          </div>
          <div>
            <label className="block text-xs text-[#8b949e] mb-1.5">الكود المولّد</label>
            <div className="flex gap-2">
              <div className="flex-1 bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-2.5 text-center font-mono tracking-[0.2em] text-[#58a6ff] text-sm min-h-[42px] flex items-center justify-center" dir="ltr">
                {previewCode || <span className="text-[#484f58] tracking-normal text-xs">اضغط "توليد" لإنشاء كود</span>}
              </div>
              <button onClick={handleGenerate}
                className="px-4 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl text-xs text-[#c9d1d9] font-semibold whitespace-nowrap transition-all flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                توليد
              </button>
              {previewCode && (
                <button onClick={() => handleCopy(previewCode)}
                  className="px-3 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl text-[#8b949e] hover:text-white transition-all">
                  {copied === previewCode ? <Check className="w-4 h-4 text-[#3fb950]" /> : <Copy className="w-4 h-4" />}
                </button>
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={handleCreate} disabled={!previewCode || !label.trim()}
              className="flex-1 bg-[#238636] hover:bg-[#2ea043] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4" />
              إنشاء الكود وحفظه
            </button>
            <button onClick={() => { setShowCreate(false); setPreviewCode(''); }}
              className="px-5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-sm transition-all">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {/* Extend subscription modal */}
      {extendTarget && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 dir-rtl">
          <div className="bg-[#161b22] border border-[#1f6feb]/40 rounded-2xl w-full max-w-sm mx-4 p-6 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-[#58a6ff] flex items-center gap-2">
              <CalendarClock className="w-4 h-4" />
              تمديد اشتراك — {extendTarget.label}
            </h3>
            <p className="text-xs text-[#8b949e]">
              انتهاء الكود الحالي: <span className="text-[#c9d1d9]">{formatDate(extendTarget.expiresAt)}</span>
            </p>
            <div>
              <label className="block text-xs text-[#8b949e] mb-1.5">مدة التمديد (تُضاف بعد انتهاء الكود الحالي)</label>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATIONS.filter(d => d.key !== 'custom').map(({ key, label: lbl }) => (
                  <button key={key} onClick={() => setExtDuration(key)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${
                      extDuration === key
                        ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                        : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white'
                    }`}>
                    {lbl}
                  </button>
                ))}
              </div>
              <button onClick={() => setExtDuration('custom')}
                className={`mt-1.5 w-full py-2 rounded-lg text-xs font-semibold border transition-all ${
                  extDuration === 'custom'
                    ? 'bg-[#1f6feb] border-[#1f6feb] text-white'
                    : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white'
                }`}>
                مخصص
              </button>
              {extDuration === 'custom' && (
                <div className="mt-2 flex items-center gap-2">
                  <input type="number" min="1" max="3650"
                    value={extCustomDays} onChange={e => setExtCustomDays(e.target.value)}
                    className="w-24 bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] text-center focus:outline-none focus:border-[#1f6feb] transition-all"
                    dir="ltr" />
                  <span className="text-sm text-[#8b949e]">يوم</span>
                </div>
              )}
            </div>
            <p className="text-xs text-[#8b949e] bg-[#0d1117] border border-[#30363d] rounded-lg px-3 py-2">
              سيتم توليد <span className="text-[#58a6ff]">كود جديد</span> يعمل على أي جهاز. أرسله للمستخدم ليستخدمه بدلاً من الكود الحالي.
            </p>
            <div className="flex gap-2">
              <button onClick={handleExtend}
                className="flex-1 bg-[#1f6feb] hover:bg-[#388bfd] text-white font-bold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
                <CalendarClock className="w-4 h-4" />
                توليد كود التمديد
              </button>
              <button onClick={() => setExtendTarget(null)}
                className="px-5 bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-white rounded-xl text-sm transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Codes list */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-[#30363d] flex items-center justify-between">
          <span className="text-sm font-semibold text-[#c9d1d9]">أكواد التفعيل ({codes.length})</span>
          <Clock className="w-4 h-4 text-[#8b949e]" />
        </div>

        {codes.length === 0 ? (
          <div className="py-12 text-center text-[#8b949e] text-sm">
            لا توجد أكواد. أنشئ أول كود باستخدام الزر أعلاه.
          </div>
        ) : (
          <div className="divide-y divide-[#21262d]">
            {codes.map(c => (
              <div key={c.id} className="px-4 py-3 hover:bg-[#1c2128] transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="text-sm font-medium text-[#c9d1d9] truncate">{c.label}</span>
                      {statusBadge(c)}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono tracking-widest text-[#58a6ff] text-xs" dir="ltr">{c.code}</span>
                      <span className="text-[#484f58]">•</span>
                      <span className="text-xs text-[#8b949e] flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {c.expiresAt > Date.now()
                          ? `ينتهي بعد ${formatExpiry(c.expiresAt)} (${formatDate(c.expiresAt)})`
                          : `انتهى ${formatDate(c.expiresAt)}`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 flex-wrap">
                    {/* Copy */}
                    <button onClick={() => handleCopy(c.code)} title="نسخ الكود"
                      className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] text-[#8b949e] hover:text-white transition-all">
                      {copied === c.code ? <Check className="w-3.5 h-3.5 text-[#3fb950]" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>

                    {/* Extend */}
                    <button onClick={() => { setExtendTarget(c); setExtDuration('1m'); setExtCustomDays('30'); }}
                      title="تمديد الاشتراك"
                      className="p-1.5 rounded-lg bg-[#1f6feb]/10 hover:bg-[#1f6feb]/25 border border-[#1f6feb]/30 text-[#58a6ff] hover:text-white transition-all">
                      <CalendarClock className="w-3.5 h-3.5" />
                    </button>

                    {/* Toggle block */}
                    <button onClick={() => handleToggle(c)}
                      title={c.isBlocked ? 'تفعيل الكود' : 'تعطيل الكود'}
                      className={`p-1.5 rounded-lg border transition-all ${
                        !c.isBlocked
                          ? 'bg-[#238636]/15 border-[#238636]/30 text-[#3fb950] hover:bg-[#238636]/30'
                          : 'bg-[#21262d] border-[#30363d] text-[#8b949e] hover:text-white hover:bg-[#30363d]'
                      }`}>
                      {!c.isBlocked ? <ToggleRight className="w-3.5 h-3.5" /> : <ToggleLeft className="w-3.5 h-3.5" />}
                    </button>

                    {/* Delete */}
                    <button onClick={() => handleDelete(c)} title="حذف الكود"
                      className="p-1.5 rounded-lg bg-[#21262d] hover:bg-[#da3633]/20 border border-[#30363d] hover:border-[#da3633]/40 text-[#8b949e] hover:text-[#ff7b72] transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
