import React, { useState, useRef, useCallback } from 'react';
import { Database, Lock, Eye, EyeOff, AlertCircle, Loader2 } from 'lucide-react';
import { validateCode } from '../services/codeValidation';

interface LockScreenProps {
  onAuthenticated: (code: string) => void;
  onOwnerTrigger: () => void;
}

export const LockScreen: React.FC<LockScreenProps> = ({ onOwnerTrigger }) => {
  const [code, setCode] = useState('');
  const [showCode, setShowCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [logoClickCount, setLogoClickCount] = useState(0);
  const logoClickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleLogoClick = useCallback(() => {
    const next = logoClickCount + 1;
    setLogoClickCount(next);
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (next >= 7) {
      setLogoClickCount(0);
      onOwnerTrigger();
      return;
    }
    logoClickTimer.current = setTimeout(() => setLogoClickCount(0), 3000);
  }, [logoClickCount, onOwnerTrigger]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase().replace(/\s/g, '');
    if (!trimmed) return;

    setLoading(true);
    setError('');

    try {
      const result = validateCode(trimmed);

      if (!result.valid) {
        setError(result.error || 'كود التفعيل غير صالح.');
        setLoading(false);
        return;
      }

      // Save session permanently in localStorage, then reload so init picks it up cleanly
      localStorage.setItem('appSession', JSON.stringify({
        code: trimmed.replace(/-/g, ''),
        expiresAt: result.expiresAt,
        validatedAt: Date.now(),
      }));

      window.location.reload();
    } catch {
      setError('حدث خطأ أثناء التحقق. أعد المحاولة.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#0d1117] flex items-center justify-center z-50 dir-rtl">
      {/* Ambient glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#1f6feb]/5 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#a371f7]/4 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md mx-4">
        <div className="bg-[#161b22] border border-[#30363d] rounded-2xl overflow-hidden shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#1f6feb]/20 to-[#a371f7]/10 border-b border-[#30363d] px-8 py-6 text-center">
            <button
              onClick={handleLogoClick}
              className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#1f6feb] to-[#388bfd] flex items-center justify-center text-white shadow-lg shadow-blue-500/30 mx-auto mb-4 select-none focus:outline-none"
              tabIndex={-1}
            >
              <Database className="w-8 h-8" />
            </button>
            <h1 className="text-2xl font-bold text-[#58a6ff] tracking-tight">
              مركز البيانات العالمي
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">Enterprise Hub V5</p>
          </div>

          {/* Lock icon */}
          <div className="flex justify-center pt-6">
            <div className="w-12 h-12 rounded-full bg-[#21262d] border border-[#30363d] flex items-center justify-center">
              <Lock className="w-5 h-5 text-[#8b949e]" />
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
            <div>
              <p className="text-center text-[#c9d1d9] font-semibold text-base mb-1">
                أدخل كود تفعيل البرنامج
              </p>
              <p className="text-center text-[#8b949e] text-xs mb-5">
                يتطلب الوصول إلى هذا النظام كود تفعيل صالح
              </p>

              <div className="relative">
                <input
                  type={showCode ? 'text' : 'password'}
                  value={code}
                  onChange={(e) => {
                    setCode(e.target.value.toUpperCase());
                    setError('');
                  }}
                  placeholder="أدخل الكود هنا..."
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 text-[#c9d1d9] text-center text-lg font-mono tracking-[0.3em] placeholder:text-[#484f58] placeholder:tracking-normal focus:outline-none focus:border-[#1f6feb] focus:ring-1 focus:ring-[#1f6feb]/50 transition-all"
                  dir="ltr"
                />
                <button
                  type="button"
                  onClick={() => setShowCode(!showCode)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8b949e] hover:text-[#c9d1d9] transition-colors"
                >
                  {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 bg-[#da3633]/10 border border-[#da3633]/30 rounded-xl px-4 py-3 text-[#ff7b72] text-sm">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !code.trim()}
              className="w-full bg-[#1f6feb] hover:bg-[#388bfd] disabled:bg-[#21262d] disabled:text-[#484f58] text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري التحقق...</span>
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>دخول النظام</span>
                </>
              )}
            </button>
          </form>

          <div className="border-t border-[#21262d] px-8 py-4 text-center">
            <p className="text-[#484f58] text-[11px]">
              ⚠️ الوصول غير المصرّح به ممنوع ومحظور قانونياً
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
