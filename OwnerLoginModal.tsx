import React, { useState, useCallback } from 'react';
import { ShieldCheck, X, Delete, AlertCircle, KeyRound } from 'lucide-react';

interface OwnerLoginModalProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const SYMBOL_PALETTE_EXPORT = [
  '★', '◆', '▲', '●', '■',
  '◉', '◇', '△', '◈', '⬡',
  '⊕', '⊗', '⊘', '◎', '♦',
  '▼', '◐', '◑', '◒', '◓',
];

const SYMBOL_PALETTE = SYMBOL_PALETTE_EXPORT;

const DEFAULT_OWNER_SECRET = '★◆▲●';
const LS_KEY = 'ownerSymbolSecret';

export function getOwnerSecret(): string {
  return localStorage.getItem(LS_KEY) || DEFAULT_OWNER_SECRET;
}

export function setOwnerSecret(secret: string): void {
  localStorage.setItem(LS_KEY, secret);
}

export const OwnerLoginModal: React.FC<OwnerLoginModalProps> = ({ onSuccess, onCancel }) => {
  const [entered, setEntered] = useState('');
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const addSymbol = useCallback((sym: string) => {
    setEntered(prev => prev + sym);
    setError('');
  }, []);

  const backspace = useCallback(() => {
    setEntered(prev => prev.slice(0, -1));
    setError('');
  }, []);

  const clear = useCallback(() => {
    setEntered('');
    setError('');
  }, []);

  const handleSubmit = useCallback(() => {
    const secret = getOwnerSecret();
    if (entered === secret) {
      onSuccess();
    } else {
      setError('رمز سري خاطئ. أعد المحاولة.');
      setShake(true);
      setEntered('');
      setTimeout(() => setShake(false), 600);
    }
  }, [entered, onSuccess]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 dir-rtl">
      <div
        className={`bg-[#161b22] border border-[#30363d] rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden transition-all ${shake ? 'animate-[shake_0.5s_ease]' : ''}`}
        style={shake ? { animation: 'shake 0.5s ease' } : {}}
      >
        <style>{`
          @keyframes shake {
            0%,100% { transform: translateX(0); }
            20% { transform: translateX(-8px); }
            40% { transform: translateX(8px); }
            60% { transform: translateX(-6px); }
            80% { transform: translateX(6px); }
          }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#30363d] bg-[#1c2128]">
          <div className="flex items-center gap-2">
            <KeyRound className="w-5 h-5 text-[#a371f7]" />
            <span className="font-bold text-[#c9d1d9] text-sm">وصول المالك — الرمز السري</span>
          </div>
          <button onClick={onCancel} className="text-[#8b949e] hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Code display */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-xl px-4 py-3 min-h-[52px] flex items-center justify-center">
            {entered ? (
              <span className="text-2xl tracking-widest text-[#c9d1d9] select-none">
                {entered.split('').map((_, i) => (
                  <span key={i} className="mx-0.5">◉</span>
                ))}
              </span>
            ) : (
              <span className="text-[#484f58] text-sm">اضغط على الرموز أدناه...</span>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 text-[#ff7b72] text-xs bg-[#da3633]/10 border border-[#da3633]/30 rounded-lg px-3 py-2">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Symbol keyboard */}
          <div className="grid grid-cols-5 gap-1.5">
            {SYMBOL_PALETTE.map((sym) => (
              <button
                key={sym}
                onClick={() => addSymbol(sym)}
                className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] hover:border-[#8b949e] rounded-lg py-2.5 text-lg text-[#c9d1d9] transition-all select-none font-bold hover:scale-105 active:scale-95"
              >
                {sym}
              </button>
            ))}
          </div>

          {/* Controls */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={clear}
              className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl py-2.5 text-xs text-[#8b949e] hover:text-white transition-all"
            >
              مسح الكل
            </button>
            <button
              onClick={handleSubmit}
              disabled={!entered}
              className="bg-[#a371f7] hover:bg-[#b989ff] disabled:bg-[#21262d] disabled:text-[#484f58] text-white rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              تأكيد
            </button>
            <button
              onClick={backspace}
              className="bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] rounded-xl py-2.5 flex items-center justify-center transition-all text-[#8b949e] hover:text-white"
            >
              <Delete className="w-4 h-4" />
            </button>
          </div>

          <p className="text-center text-[#484f58] text-[10px]">
            هذه البوابة حصرية للمالك فقط
          </p>
        </div>
      </div>
    </div>
  );
};
