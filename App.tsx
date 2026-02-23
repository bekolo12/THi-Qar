
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Header from './components/Header';
import EntryForm from './components/EntryForm';
import EntryTable from './components/EntryTable';
import SheetDataView from './components/SheetDataView';
import SettingsModal from './components/SettingsModal';
import Toast from './components/Toast';
import { Entry, ToastMessage } from './types';
import { translations, Language } from './translations';

const DEFAULT_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzMn3UoIq_4o-3yo5M47LiHuuzlt3OwMFEkOmzsm1JF1rxExMvXLipVQQRaaPR0HRu4/exec';
const DEFAULT_SECOND_SCRIPT_URL = 'https://script.google.com/macros/library/d/1LTuC6UVKtsr2To-0RXizn84YTGRpTMp6XtWli5mJ3i29Ia3r3M_RouHx/1';

const App: React.FC = () => {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [scriptUrl, setScriptUrl] = useState<string>(DEFAULT_SCRIPT_URL);
  const [secondScriptUrl, setSecondScriptUrl] = useState<string>(DEFAULT_SECOND_SCRIPT_URL);
  
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecondSettingsOpen, setIsSecondSettingsOpen] = useState(false);
  
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [language, setLanguage] = useState<Language>('en');
  
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);

  const [activeFilters, setActiveFilters] = useState({
    city: '',
    ring: '',
    fdt: '',
    activity: ''
  });

  const cleanData = useCallback((data: any[]) => {
    return data.map(row => ({
      ...row,
      city: (row.city || '').toString().trim().toLowerCase() === 'tikteet' ? 'Tikrit' : (row.city || '').toString().trim(),
      primaryBoq: row.primaryBoq || row['Primary BOQ'] || ''
    }));
  }, []);

  const fetchSheetData = useCallback(async (urlOverride?: string) => {
    const url = urlOverride || scriptUrl;
    if (!url || !url.includes('macros')) return;

    setIsSyncing(true);
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      
      if (result && result.data) {
        const cleaned = cleanData(result.data);
        setSheetData(cleaned);
        const time = new Date().toLocaleTimeString();
        setLastSynced(time);
        localStorage.setItem('sheet_data_cache', JSON.stringify(cleaned));
        localStorage.setItem('sheet_last_sync', time);
      } else if (result && result.error) {
        throw new Error(result.error);
      }
    } catch (e: any) {
      console.error("Fetch failed:", e);
      const msg = e.message === "Failed to fetch" 
        ? "Sync Failed: Ensure Script is deployed to 'Anyone'"
        : `Sync Error: ${e.message}`;
      showToast(msg, 'error');
    } finally {
      setIsSyncing(false);
    }
  }, [scriptUrl, cleanData]);

  const filteredSheetData = useMemo(() => {
    return sheetData.filter(row => {
      const normalize = (val: any) => (val || '').toString().trim().toLowerCase();
      
      const matchCity = !activeFilters.city || normalize(row.city) === normalize(activeFilters.city);
      const matchRing = !activeFilters.ring || normalize(row.ring) === normalize(activeFilters.ring);
      const matchFdt = !activeFilters.fdt || normalize(row.fdt) === normalize(activeFilters.fdt);
      const matchActivity = !activeFilters.activity || normalize(row.activity) === normalize(activeFilters.activity);
      
      return matchCity && matchRing && matchFdt && matchActivity;
    });
  }, [sheetData, activeFilters]);

  useEffect(() => {
    const savedEntries = localStorage.getItem('entries');
    if (savedEntries) {
      try {
        const parsed = JSON.parse(savedEntries);
        setEntries(cleanData(parsed) as Entry[]);
      } catch (e) {
        console.error("Error loading entries", e);
      }
    }

    const savedUrl = localStorage.getItem('googleScriptUrl');
    if (savedUrl) setScriptUrl(savedUrl);
    
    const savedSecondUrl = localStorage.getItem('secondGoogleScriptUrl');
    if (savedSecondUrl) setSecondScriptUrl(savedSecondUrl);

    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) setLanguage(savedLang);

    const cachedData = localStorage.getItem('sheet_data_cache');
    const cachedTime = localStorage.getItem('sheet_last_sync');
    if (cachedData) {
      try {
        const parsed = JSON.parse(cachedData);
        setSheetData(cleanData(parsed));
        setLastSynced(cachedTime);
      } catch (e) {
        console.error("Error loading cache", e);
      }
    }

    fetchSheetData(savedUrl || DEFAULT_SCRIPT_URL);
  }, [fetchSheetData, cleanData]);

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
    localStorage.setItem('language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('entries', JSON.stringify(entries));
  }, [entries]);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ id: Date.now(), message, type });
  };

  const handleSaveSettings = (url: string) => {
    if (!url.trim() || !url.includes('macros')) {
      showToast('Invalid URL', 'error');
      return;
    }
    setScriptUrl(url);
    localStorage.setItem('googleScriptUrl', url);
    setIsSettingsOpen(false);
    showToast(translations[language].toastSaved, 'success');
    fetchSheetData(url);
  };

  const handleSaveSecondSettings = (url: string) => {
    if (!url.trim() || !url.includes('macros')) {
      showToast('Invalid URL', 'error');
      return;
    }
    setSecondScriptUrl(url);
    localStorage.setItem('secondGoogleScriptUrl', url);
    setIsSecondSettingsOpen(false);
    showToast(translations[language].toastSaved, 'success');
  };

  const handleSubmit = async (data: Omit<Entry, 'id'>) => {
    const newEntry: Entry = { ...data, id: Date.now() };
    setEntries(prev => [...prev, newEntry]);
    showToast(translations[language].toastSuccess, 'success');

    const sheetPayload = JSON.stringify({ ...newEntry, "Timestamp": new Date().toISOString() });

    // Send to Primary
    try {
      if (scriptUrl.includes('/library/')) {
        console.warn("Primary URL appears to be a Library URL, not a Web App URL.");
        showToast("Primary URL is a Library link, not a Web App URL. Data may not send.", "error");
      }
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: sheetPayload
      });
    } catch (e) { 
      console.error("Primary cloud error:", e);
      showToast("Failed to send to Primary Cloud", "error");
    }

    // Send to Secondary if configured
    if (secondScriptUrl && secondScriptUrl.includes('macros')) {
      try {
        await fetch(secondScriptUrl, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: sheetPayload
        });
      } catch (e) { 
        console.error("Secondary cloud error:", e);
        showToast("Failed to send to Secondary Cloud", "error");
      }
    }
  };

  const handleDelete = (id: number) => {
    if (window.confirm(translations[language].confirmDelete)) {
      setEntries(prev => prev.filter(entry => entry.id !== id));
      showToast(translations[language].toastDeleted, 'info');
    }
  };

  const t = translations[language];

  return (
    <div className={`min-h-screen pb-20 ${language === 'ar' ? 'font-sans' : ''}`}>
      <Header 
        onOpenSettings={() => setIsSettingsOpen(true)} 
        onOpenSecondSettings={() => setIsSecondSettingsOpen(true)}
        language={language}
        setLanguage={setLanguage}
        t={t}
      />
      
      <main className="max-w-4xl mx-auto px-4 py-8">
        <EntryForm 
          onSubmit={handleSubmit} 
          sheetData={sheetData}
          onSync={() => fetchSheetData()}
          onFilterChange={setActiveFilters}
          isSyncing={isSyncing}
          lastSynced={lastSynced}
          t={t} 
          currentLang={language} 
        />
        
        <EntryTable 
          entries={entries} 
          onDelete={handleDelete} 
          t={t} 
          currentLang={language} 
        />

        <SheetDataView 
          data={filteredSheetData} 
          totalCount={sheetData.length}
          lastSynced={lastSynced} 
          isFiltered={!!(activeFilters.city || activeFilters.ring || activeFilters.fdt || activeFilters.activity)}
          t={t} 
        />
      </main>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        currentUrl={scriptUrl} 
        onSave={handleSaveSettings}
        t={t}
        mode="primary"
      />

      <SettingsModal 
        isOpen={isSecondSettingsOpen} 
        onClose={() => setIsSecondSettingsOpen(false)} 
        currentUrl={secondScriptUrl} 
        onSave={handleSaveSecondSettings}
        t={t}
        mode="secondary"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};

export default App;
