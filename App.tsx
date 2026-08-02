import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StoredFile, ExtractedRecord, QueueItem, ProcessingMetrics, ScopeType } from './types/database';
import {
  db,
  initStoragePersistence,
  deleteFileCascade,
  formatBytes,
  ensureDefaultCategories
} from './services/db';
import { queueManager } from './services/queueManager';

import { validateCode } from './services/codeValidation';

import { Header } from './components/Header';
import { StatsGrid } from './components/StatsGrid';
import { ProgressPanel } from './components/ProgressPanel';
import { GovernorateGrid } from './components/GovernorateGrid';
import { GovernorateSearchModal } from './components/GovernorateSearchModal';
import { DeepSearchModal } from './components/DeepSearchModal';
import { UnifiedPhoneSearch } from './components/UnifiedPhoneSearch';
import { AuditJournal } from './components/AuditJournal';
import { SystemSettings } from './components/SystemSettings';
import { UploadRoutingModal } from './components/UploadRoutingModal';
import { DoubleVerificationDeleteModal } from './components/DoubleVerificationDeleteModal';
import { LockScreen } from './components/LockScreen';
import { OwnerLoginModal } from './components/OwnerLoginModal';
import { OwnerPanel } from './components/OwnerPanel';

type TabType = 'search' | 'phone' | 'audit' | 'admin' | 'owner';

export default function App() {
  // Auth state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [showOwnerLogin, setShowOwnerLogin] = useState(false);

  const [activeTab, setActiveTab] = useState<TabType>('search');
  const [scope, setScope] = useState<ScopeType>('local');
  const [selectedCountry, setSelectedCountry] = useState('العراق');
  const [countries, setCountries] = useState(['العراق', 'سوريا', 'مصر', 'الأردن', 'المملكة العربية السعودية']);
  const [categories, setCategories] = useState<string[]>([]);
  const [isPersisted, setIsPersisted] = useState(false);
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [records, setRecords] = useState<ExtractedRecord[]>([]);
  const [isIntensiveSearch, setIsIntensiveSearch] = useState(false);

  // Queue state
  const [queueMetrics, setQueueMetrics] = useState<ProcessingMetrics | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);

  // Search Modals
  const [selectedGovForSearch, setSelectedGovForSearch] = useState<string | null>(null);
  const [showDeepSearch, setShowDeepSearch] = useState(false);

  // Upload Routing Modal
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[] | null>(null);

  // Delete Verification Modal
  const [fileToDelete, setFileToDelete] = useState<StoredFile | null>(null);

  // System Stats
  const [stats, setStats] = useState({
    totalRecords: 0,
    zainCount: 0,
    asiaCount: 0,
    korekCount: 0,
    localDbCount: 0,
    globalDbCount: 0,
    filesCount: 0,
    storageUsageText: '0 Bytes'
  });

  // ─── Session Validation ───────────────────────────────────────────
  // Synchronous — reads localStorage and uses self-validating code logic (no DB)
  const validateSession = useCallback((): boolean => {
    const raw = localStorage.getItem('appSession');
    if (!raw) return false;
    try {
      const session = JSON.parse(raw);
      const result = validateCode(session.code || '');
      if (!result.valid) { localStorage.removeItem('appSession'); return false; }
      return true;
    } catch {
      localStorage.removeItem('appSession');
      return false;
    }
  }, []);

  // Owner session: permanent flag in localStorage
  const validateOwnerSession = useCallback((): boolean => {
    return localStorage.getItem('ownerSession') === 'authenticated';
  }, []);

  // Initial auth check (now fully synchronous)
  useEffect(() => {
    if (validateOwnerSession()) {
      setIsAuthenticated(true);
      setIsOwner(true);
    } else {
      setIsAuthenticated(validateSession());
    }
    setAuthChecking(false);
  }, [validateSession, validateOwnerSession]);

  // Background session check every 30s — auto-kick if deactivated (owners exempt)
  useEffect(() => {
    if (!isAuthenticated || isOwner) return;
    const interval = setInterval(() => {
      if (!validateSession()) {
        setIsAuthenticated(false);
        setIsOwner(false);
        setActiveTab('search');
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated, isOwner, validateSession]);

  // ─── Load Database Data ───────────────────────────────────────────
  const loadDatabaseData = useCallback(async () => {
    try {
      await ensureDefaultCategories();

      const allCountries = await db.countries.toArray();
      if (allCountries.length > 0) {
        setCountries(allCountries.map((c) => c.name));
      }

      const allCategories = await db.categories.toArray();
      setCategories(allCategories.map((c) => c.name));

      const allFiles = await db.files.toArray();
      const allRecords = await db.records.toArray();

      setFiles(allFiles);
      setRecords(allRecords);

      let zain = 0, asia = 0, korek = 0, localDb = 0, globalDb = 0, totalBytes = 0;

      allFiles.forEach((f) => { totalBytes += f.fileSizeBytes || 0; });

      allRecords.forEach((r) => {
        if (r.category === 'zain') zain++;
        else if (r.category === 'asia') asia++;
        else if (r.category === 'korek') korek++;
        if (r.scope === 'local') localDb++;
        else if (r.scope === 'global') globalDb++;
      });

      setStats({
        totalRecords: allRecords.length,
        zainCount: zain,
        asiaCount: asia,
        korekCount: korek,
        localDbCount: localDb,
        globalDbCount: globalDb,
        filesCount: allFiles.length,
        storageUsageText: formatBytes(totalBytes)
      });
    } catch (err) {
      console.error('Error loading database data:', err);
    }
  }, []);

  // Initialize DB & Persistence after auth
  useEffect(() => {
    if (!isAuthenticated) return;
    const init = async () => {
      const persisted = await initStoragePersistence();
      setIsPersisted(persisted);
      await loadDatabaseData();
    };
    init();
  }, [isAuthenticated, loadDatabaseData]);

  const handleRequestPersistence = async () => {
    const p = await initStoragePersistence();
    setIsPersisted(p);
  };

  // Subscribe to Queue Manager
  useEffect(() => {
    if (!isAuthenticated) return;
    const unsubscribe = queueManager.subscribe((metrics, items) => {
      setQueueMetrics(metrics);
      setQueueItems(items);
      const hasCompletedRecently = items.some(
        (i) => i.status === 'completed' || i.status === 'error'
      );
      if (hasCompletedRecently) loadDatabaseData();
    });
    return unsubscribe;
  }, [isAuthenticated, loadDatabaseData]);

  // ─── Upload & Delete Handlers ─────────────────────────────────────
  const handleAddNewCategory = async (catName: string) => {
    try {
      await db.categories.add({ name: catName, scope, country: selectedCountry });
      await loadDatabaseData();
    } catch (err) {
      console.error('Failed to create custom category:', err);
    }
  };

  const handleUploadSelect = (selectedFiles: File[]) => {
    if (!selectedFiles || selectedFiles.length === 0) return;
    setPendingUploadFiles(selectedFiles);
  };

  const handleConfirmUploadRouting = (
    targetDatabase: string,
    targetScope: ScopeType,
    targetCountry: string
  ) => {
    if (pendingUploadFiles) {
      queueManager.enqueueFiles(pendingUploadFiles, targetDatabase, targetScope, targetCountry);
      setPendingUploadFiles(null);
      setActiveTab('admin');
    }
  };

  const handleConfirmDeleteFile = async () => {
    if (!fileToDelete || !fileToDelete.id) return;
    try {
      await deleteFileCascade(fileToDelete.id, fileToDelete.fileName);
      setFileToDelete(null);
      await loadDatabaseData();
    } catch (err) {
      console.error('Error deleting file:', err);
    }
  };

  // ─── Owner Access ─────────────────────────────────────────────────
  const handleOwnerTrigger = useCallback(() => {
    setShowOwnerLogin(true);
  }, []);

  const handleOwnerLoginSuccess = useCallback(() => {
    // Persist owner session permanently, then reload so init picks it up cleanly
    localStorage.setItem('ownerSession', 'authenticated');
    window.location.reload();
  }, []);

  // ─── Derived ──────────────────────────────────────────────────────
  const activeQueueCount = queueItems.filter(
    (i) => i.status === 'pending' || i.status === 'processing'
  ).length;

  // ─── Loading State ────────────────────────────────────────────────
  if (authChecking) {
    return (
      <div className="min-h-screen bg-[#0d1117] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#1f6feb] border-t-transparent rounded-full animate-spin" />
          <p className="text-[#8b949e] text-sm">جاري التحقق من الجلسة...</p>
        </div>
      </div>
    );
  }

  // ─── Lock Screen ──────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <>
        <LockScreen
          onAuthenticated={() => setIsAuthenticated(true)}
          onOwnerTrigger={handleOwnerTrigger}
        />
        {showOwnerLogin && (
          <OwnerLoginModal
            onSuccess={handleOwnerLoginSuccess}
            onCancel={() => setShowOwnerLogin(false)}
          />
        )}
      </>
    );
  }

  // ─── Main App ─────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9] flex flex-col font-sans dir-rtl select-none">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        scope={scope}
        setScope={setScope}
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        countries={countries}
        isPersisted={isPersisted}
        activeQueueCount={activeQueueCount}
        isIntensiveSearch={isIntensiveSearch}
        setIsIntensiveSearch={setIsIntensiveSearch}
        isOwner={isOwner}
        onOwnerTrigger={handleOwnerTrigger}
      />

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 flex flex-col">
        {/* Stats Grid — always visible */}
        <StatsGrid
          totalRecords={stats.totalRecords}
          zainCount={stats.zainCount}
          asiaCount={stats.asiaCount}
          korekCount={stats.korekCount}
          localDbCount={stats.localDbCount}
          globalDbCount={stats.globalDbCount}
          filesCount={stats.filesCount}
          storageUsageText={stats.storageUsageText}
        />

        {/* Queue Progress Panel */}
        <ProgressPanel metrics={queueMetrics} queueItems={queueItems} />

        {/* Tab 1: Governorate Search Grid */}
        {activeTab === 'search' && (
          <GovernorateGrid
            country={selectedCountry}
            onSelectGovernorate={(gov) => setSelectedGovForSearch(gov)}
            onOpenDeepSearch={() => setShowDeepSearch(true)}
          />
        )}

        {/* Tab 2: Unified Phone Number Search */}
        {activeTab === 'phone' && (
          <UnifiedPhoneSearch country={selectedCountry} />
        )}

        {/* Tab 3: System Audit Journal */}
        {activeTab === 'audit' && <AuditJournal />}

        {/* Tab 4: System Settings — owner only */}
        {activeTab === 'admin' && isOwner && (
          <SystemSettings
            files={files}
            onUploadSelect={handleUploadSelect}
            onRequestDelete={(file) => setFileToDelete(file)}
            isPersisted={isPersisted}
            onRequestPersistence={handleRequestPersistence}
          />
        )}

        {/* Tab 5: Owner Panel — owner only */}
        {activeTab === 'owner' && isOwner && <OwnerPanel />}
      </main>

      {/* Modals */}
      {selectedGovForSearch && (
        <GovernorateSearchModal
          governorate={selectedGovForSearch}
          country={selectedCountry}
          onClose={() => setSelectedGovForSearch(null)}
        />
      )}
      {showDeepSearch && (
        <DeepSearchModal
          country={selectedCountry}
          onClose={() => setShowDeepSearch(false)}
        />
      )}
      {pendingUploadFiles && (
        <UploadRoutingModal
          files={pendingUploadFiles}
          categories={categories}
          countries={countries}
          scope={scope}
          selectedCountry={selectedCountry}
          onConfirm={handleConfirmUploadRouting}
          onCancel={() => setPendingUploadFiles(null)}
          onAddNewCategory={handleAddNewCategory}
        />
      )}
      {fileToDelete && (
        <DoubleVerificationDeleteModal
          file={fileToDelete}
          onConfirm={handleConfirmDeleteFile}
          onCancel={() => setFileToDelete(null)}
        />
      )}

      {/* Owner Login Modal — accessible from header trigger */}
      {showOwnerLogin && (
        <OwnerLoginModal
          onSuccess={handleOwnerLoginSuccess}
          onCancel={() => setShowOwnerLogin(false)}
        />
      )}
    </div>
  );
}
