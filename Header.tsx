import React, { useRef, useCallback } from "react";
import {
  Database,
  Search,
  PhoneCall,
  History,
  Settings,
  ShieldCheck,
  ShieldAlert,
  Globe,
  MapPin,
  Zap,
  Crown,
} from "lucide-react";
import { ScopeType } from "../types/database";

type TabType = "search" | "phone" | "audit" | "admin" | "owner";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  scope: ScopeType;
  setScope: (scope: ScopeType) => void;
  selectedCountry: string;
  setSelectedCountry: (country: string) => void;
  countries: string[];
  isPersisted: boolean;
  activeQueueCount: number;
  isIntensiveSearch: boolean;
  setIsIntensiveSearch: (val: boolean) => void;
  isOwner: boolean;
  onOwnerTrigger: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  scope,
  setScope,
  selectedCountry,
  setSelectedCountry,
  countries,
  isPersisted,
  activeQueueCount,
  isIntensiveSearch,
  setIsIntensiveSearch,
  isOwner,
  onOwnerTrigger,
}) => {
  const logoClickCount = useRef(0);
  const logoClickTimer = useRef<any>(null);

  const handleLogoClick = useCallback(() => {
    logoClickCount.current += 1;
    if (logoClickTimer.current) clearTimeout(logoClickTimer.current);
    if (logoClickCount.current >= 7) {
      logoClickCount.current = 0;
      onOwnerTrigger();
      return;
    }
    logoClickTimer.current = setTimeout(() => {
      logoClickCount.current = 0;
    }, 3000);
  }, [onOwnerTrigger]);

  return (
    <header className="bg-[#0d1117] border-b border-[#30363d] px-4 py-3 sm:px-6 sm:py-4 flex flex-col lg:flex-row justify-between items-center gap-4">
      {/* Brand & Title */}
      <div className="flex items-center gap-3 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          {/* Logo — click 7x fast to trigger owner login */}
          <button
            onClick={handleLogoClick}
            className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1f6feb] to-[#388bfd] flex items-center justify-center text-white shadow-lg shadow-blue-500/20 select-none focus:outline-none"
            tabIndex={-1}
          >
            <Database className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-[#58a6ff] tracking-tight flex items-center gap-2">
              مركز البيانات العالمي
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#1f6feb]/20 text-[#388bfd] border border-[#1f6feb]/40 font-mono">
                Enterprise Hub V5
              </span>
            </h1>
            <p className="text-xs text-[#8b949e]">
              محلي وعالمي - معالجة البيانات الضخمة وبحث المحافظات والهواتف
            </p>
          </div>
        </div>

        {/* Persistence Indicator Mobile */}
        <div className="lg:hidden">
          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1 ${
              isPersisted
                ? "bg-[#238636]/15 border-[#238636]/40 text-[#3fb950]"
                : "bg-[#d29922]/15 border-[#d29922]/40 text-[#d29922]"
            }`}
          >
            {isPersisted ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <ShieldAlert className="w-3 h-3" />
            )}
            <span>{isPersisted ? "دائم" : "قياسي"}</span>
          </div>
        </div>
      </div>

      {/* Scope Switcher, Country Selector, & Intensive Search Toggle */}
      <div className="flex flex-wrap items-center gap-2 bg-[#161b22] p-1.5 rounded-xl border border-[#30363d]">
        <div className="flex bg-[#0d1117] p-1 rounded-lg border border-[#30363d]/60">
          <button
            onClick={() => {
              setScope("local");
              setSelectedCountry("العراق");
            }}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              scope === "local"
                ? "bg-[#1f6feb] text-white shadow-sm"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>محلي (العراق)</span>
          </button>

          <button
            onClick={() => setScope("global")}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold transition-all ${
              scope === "global"
                ? "bg-[#a371f7] text-white shadow-sm"
                : "text-[#8b949e] hover:text-white"
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>عالمي</span>
          </button>
        </div>

        {scope === "global" && (
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="bg-[#0d1117] border border-[#30363d]/60 rounded-lg px-2.5 py-1.5 text-xs text-[#c9d1d9] focus:outline-none focus:border-[#1f6feb] transition-colors"
          >
            {countries.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {/* Intensive Search Toggle */}
        <button
          onClick={() => setIsIntensiveSearch(!isIntensiveSearch)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
            isIntensiveSearch
              ? "bg-[#a371f7]/20 border-[#a371f7]/50 text-[#a371f7]"
              : "bg-transparent border-[#30363d]/60 text-[#8b949e] hover:text-white"
          }`}
        >
          <Zap
            className={`w-3.5 h-3.5 ${isIntensiveSearch ? "animate-pulse text-[#a371f7]" : ""}`}
          />
          <span>
            {isIntensiveSearch ? "⚡ البحث المكثف: مفعّل" : "البحث المكثف"}
          </span>
        </button>

        {/* Persistence Indicator Desktop */}
        <div className="hidden lg:flex">
          <div
            className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border flex items-center gap-1 ${
              isPersisted
                ? "bg-[#238636]/15 border-[#238636]/40 text-[#3fb950]"
                : "bg-[#d29922]/15 border-[#d29922]/40 text-[#d29922]"
            }`}
          >
            {isPersisted ? (
              <ShieldCheck className="w-3 h-3" />
            ) : (
              <ShieldAlert className="w-3 h-3" />
            )}
            <span>{isPersisted ? "تخزين قياسي" : "تخزين قياسي"}</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1 bg-[#161b22] p-1.5 rounded-xl border border-[#30363d]">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "search"
              ? "bg-[#1f6feb] text-white shadow-sm"
              : "text-[#c9d1d9] hover:text-white hover:bg-[#30363d]/50"
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span>استعلام المحافظات</span>
        </button>

        <button
          onClick={() => setActiveTab("phone")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "phone"
              ? "bg-[#1f6feb] text-white shadow-sm"
              : "text-[#c9d1d9] hover:text-white hover:bg-[#30363d]/50"
          }`}
        >
          <PhoneCall className="w-3.5 h-3.5 text-[#e3b341]" />
          <span>البحث الموحد للهواتف</span>
        </button>

        <button
          onClick={() => setActiveTab("audit")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
            activeTab === "audit"
              ? "bg-[#1f6feb] text-white shadow-sm"
              : "text-[#c9d1d9] hover:text-white hover:bg-[#30363d]/50"
          }`}
        >
          <History className="w-3.5 h-3.5 text-[#a371f7]" />
          <span>مسودة الحركات</span>
        </button>

        {/* Admin tab — owner only */}
        {isOwner && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap relative ${
              activeTab === "admin"
                ? "bg-[#1f6feb] text-white shadow-sm"
                : "text-[#c9d1d9] hover:text-white hover:bg-[#30363d]/50"
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-[#58a6ff]" />
            <span>إعدادات البرنامج</span>
            {activeQueueCount > 0 && (
              <span className="w-4 h-4 bg-[#238636] text-white text-[9px] rounded-full flex items-center justify-center animate-pulse">
                {activeQueueCount}
              </span>
            )}
          </button>
        )}

        {/* Owner Panel tab — owner only */}
        {isOwner && (
          <button
            onClick={() => setActiveTab("owner")}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === "owner"
                ? "bg-[#a371f7] text-white shadow-sm"
                : "text-[#a371f7]/70 hover:text-[#a371f7] hover:bg-[#a371f7]/10"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>لوحة التحكم</span>
          </button>
        )}
      </div>
    </header>
  );
};
