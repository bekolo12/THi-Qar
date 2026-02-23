
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ClipboardList, MapPin, CircleDot, Network, ListTodo, Send, Eraser, Database, X, RefreshCw, Check, Info } from 'lucide-react';
import { Entry } from '../types';
import { Language } from '../translations';

interface SheetRow {
  city: string;
  ring: string;
  fdt: string;
  activity: string;
  primaryBoq?: string | number;
  boq: string | number;
  completed: string | number;
  remaining: string | number;
  notes: string;
}

interface EntryFormProps {
  onSubmit: (entry: Omit<Entry, 'id'>) => Promise<void>;
  sheetData: SheetRow[];
  onSync: () => Promise<void>;
  onFilterChange: (filters: { city: string, ring: string, fdt: string, activity: string }) => void;
  isSyncing: boolean;
  lastSynced: string | null;
  t: any;
  currentLang: Language;
}

const ACTIVITY_OPTIONS = [
  "Poles",
  "Relocated Poles",
  "Excavation",
  "Reinstatement Concrete",
  "Reinstatement Asphalt",
  "Distribution HDPE Pipe",
  "Feeder HDPE Pipe",
  "HH Installation",
  "FDT Installation"
];

const EntryForm: React.FC<EntryFormProps> = ({ onSubmit, sheetData, onSync, onFilterChange, isSyncing, lastSynced, t, currentLang }) => {
  const today = new Date().toISOString().split('T')[0];

  const initialFormState = {
    city: '',
    ring: '',
    workType: '',
    fdt: '',
    activity: '',
    boq: '',
    completed: '',
    remaining: '',
    date: today,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);
  const [fdtType, setFdtType] = useState<'distribution' | 'feeder'>('distribution');
  const [showJson, setShowJson] = useState(false);

  // Cascading Dropdown Logic
  const cityOptions = useMemo(() => {
    return ["Al-Nasiriyah"];
  }, []);

  const ringOptions = useMemo(() => {
    if (!formData.city) return [];
    if (formData.city === "Al-Nasiriyah") {
      return ['R1'];
    }
    return [];
  }, [formData.city]);

  const fdtOptions = useMemo(() => {
    if (!formData.city || !formData.ring) return [];
    
    if (fdtType === 'feeder') {
      return ['Feeder'];
    }
    
    if (formData.city === "Al-Nasiriyah") {
      // Generate strings "1" through "20"
      return Array.from({ length: 20 }, (_, i) => (i + 1).toString());
    }

    return [];
  }, [formData.city, formData.ring, fdtType]);

  const activityOptions = useMemo(() => {
    if (fdtType === 'feeder') {
      return ["Feeder HDPE Pipe"];
    }
    return ACTIVITY_OPTIONS.filter(opt => opt !== "Feeder HDPE Pipe");
  }, [fdtType]);

  // Real-time Lookup Match
  const matchedRow = useMemo(() => {
    const normalize = (val: any) => (val || '').toString().trim().toLowerCase();
    if (!formData.city || !formData.ring || !formData.fdt || !formData.activity) return null;
    
    return sheetData.find(row => 
      normalize(row.city) === normalize(formData.city) && 
      normalize(row.ring) === normalize(formData.ring) && 
      normalize(row.fdt) === normalize(formData.fdt) && 
      normalize(row.activity) === normalize(formData.activity)
    );
  }, [formData.city, formData.ring, formData.fdt, formData.activity, sheetData]);

  // Update App-level filters whenever selections change
  useEffect(() => {
    onFilterChange({
      city: formData.city,
      ring: formData.ring,
      fdt: formData.fdt,
      activity: formData.activity
    });
  }, [formData.city, formData.ring, formData.fdt, formData.activity, onFilterChange]);

  // Auto-fill from spreadsheet match
  useEffect(() => {
    if (matchedRow) {
      setFormData(prev => ({
        ...prev,
        boq: (matchedRow.boq ?? '').toString(),
        completed: (matchedRow.completed ?? '').toString(),
        remaining: (matchedRow.remaining ?? '').toString()
      }));
    } else {
        setFormData(prev => ({
            ...prev,
            boq: prev.boq || '',
            completed: prev.completed || '',
            remaining: prev.remaining || ''
        }));
    }
  }, [matchedRow]);

  // Reactive remaining calculation
  useEffect(() => {
    const b = Number(formData.boq) || 0;
    const c = Number(formData.completed) || 0;
    const rem = b - c;
    setFormData(prev => {
      if (prev.remaining !== rem.toString()) {
        return { ...prev, remaining: rem.toString() };
      }
      return prev;
    });
  }, [formData.boq, formData.completed]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'city') { newState.ring = ''; newState.fdt = ''; newState.activity = ''; }
      if (name === 'ring') { newState.fdt = ''; newState.activity = ''; }
      if (name === 'fdt') { newState.activity = ''; }
      return newState;
    });
  };

  const handleFdtTypeChange = (type: 'distribution' | 'feeder') => {
    setFdtType(type);
    setFormData(prev => ({ ...prev, fdt: '', activity: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
        ...formData,
        boq: Number(formData.boq) || 0,
        completed: Number(formData.completed) || 0,
        remaining: Number(formData.remaining) || 0
    });
    setFormData({ ...initialFormState, date: formData.date }); 
  };

  const handleClear = () => {
    setFormData({...initialFormState, date: today});
    setFdtType('distribution');
  };

  return (
    <>
      <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <ClipboardList className="w-6 h-6" />
              Deployment Form
            </h2>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-blue-100 text-sm">Real-time Sheet Sync Active</p>
              {lastSynced && <span className="text-[10px] text-white/50 bg-black/20 px-1.5 py-0.5 rounded">Last: {lastSynced}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSync}
              disabled={isSyncing}
              className={`text-white flex items-center gap-2 text-xs transition-all px-3 py-1.5 rounded-full border border-white/20 shadow-sm ${
                isSyncing ? 'bg-white/10 opacity-50 cursor-not-allowed' : 'bg-white/5 hover:bg-white/10'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
            </button>
            <button
              type="button"
              onClick={() => setShowJson(true)}
              className="text-white/60 hover:text-white flex items-center gap-2 text-xs transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full border border-white/10 shadow-sm"
            >
              <Database className="w-3.5 h-3.5" />
              <span>Config</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-white/5 rounded-xl border border-white/10">
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium flex items-center gap-2"><MapPin className="w-4 h-4 text-cyan-400" />{t.city}</label>
              <select name="city" value={formData.city} onChange={handleChange} required className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400">
                <option value="">{t.selectCity}</option>
                {cityOptions.map(city => <option key={city} value={city} className="bg-slate-800">{city}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium flex items-center gap-2"><CircleDot className="w-4 h-4 text-cyan-400" />{t.ring}</label>
              <select name="ring" value={formData.ring} onChange={handleChange} required disabled={!formData.city} className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 disabled:opacity-30">
                <option value="">{t.selectRing}</option>
                {ringOptions.map(ring => <option key={ring} value={ring} className="bg-slate-800">{ring}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-end">
                <label className="text-white/90 text-sm font-medium flex items-center gap-2"><Network className="w-4 h-4 text-cyan-400" />{t.fdt}</label>
                <div className="flex bg-black/30 rounded-lg p-0.5 border border-white/10 mb-1">
                  <button type="button" onClick={() => handleFdtTypeChange('distribution')} className={`px-2 py-0.5 text-[10px] rounded ${fdtType === 'distribution' ? 'bg-cyan-500 text-white' : 'text-white/50'}`}>Dist.</button>
                  <button type="button" onClick={() => handleFdtTypeChange('feeder')} className={`px-2 py-0.5 text-[10px] rounded ${fdtType === 'feeder' ? 'bg-cyan-500 text-white' : 'text-white/50'}`}>Feeder</button>
                </div>
              </div>
              <select name="fdt" value={formData.fdt} onChange={handleChange} required disabled={!formData.ring} className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 disabled:opacity-30">
                <option value="">{fdtType === 'distribution' ? t.selectFdt : 'Select Feeder ID'}</option>
                {fdtOptions.map(opt => <option key={opt} value={opt} className="bg-slate-800">{opt}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium flex items-center gap-2"><ListTodo className="w-4 h-4 text-cyan-400" />{t.activity}</label>
              <select name="activity" value={formData.activity} onChange={handleChange} required disabled={!formData.fdt} className="w-full bg-slate-900/50 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-cyan-400 disabled:opacity-30">
                <option value="">{t.selectActivity}</option>
                {activityOptions.map(key => <option key={key} value={key} className="bg-slate-800">{t.activities[key as keyof typeof t.activities] || key}</option>)}
              </select>
            </div>
          </div>

          {matchedRow && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-xl p-4 animate-fade-in">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                  <Check className="w-3 h-3" /> Live Match Found
                </span>
                <span className="text-[10px] text-white/40">Reference Point</span>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-black/20 p-2 rounded text-center border border-white/5">
                  <p className="text-[10px] text-white/40 mb-0.5">Primary BOQ (H)</p>
                  <p className="text-lg font-bold text-cyan-400">{matchedRow.primaryBoq || '-'}</p>
                </div>
                <div className="bg-black/20 p-2 rounded text-center border border-white/5">
                  <p className="text-[10px] text-white/40 mb-0.5">{t.boq} (I)</p>
                  <p className="text-lg font-bold text-white">{matchedRow.boq}</p>
                </div>
                <div className="bg-black/20 p-2 rounded text-center border border-white/5">
                  <p className="text-[10px] text-white/40 mb-0.5">{t.completed} (J)</p>
                  <p className="text-lg font-bold text-green-400">{matchedRow.completed}</p>
                </div>
                <div className="bg-black/20 p-2 rounded text-center border border-white/5">
                  <p className="text-[10px] text-white/40 mb-0.5">{t.remaining} (K)</p>
                  <p className="text-lg font-bold text-yellow-400">{matchedRow.remaining}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">{t.boq}</label>
              <input type="number" name="boq" value={formData.boq} onChange={handleChange} className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">{t.completed}</label>
              <input type="number" name="completed" value={formData.completed} onChange={handleChange} className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white" />
            </div>
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">{t.remaining}</label>
              <input type="number" name="remaining" value={formData.remaining} readOnly className="w-full bg-white/5 border border-white/20 rounded-lg px-4 py-3 text-white/50" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">{t.workType}</label>
              <select name="workType" value={formData.workType} onChange={handleChange} required className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white">
                <option value="">{t.selectWorkType}</option>
                <option value="New">{t.workTypes.New}</option>
                <option value="Rework">{t.workTypes.Rework}</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">{t.date}</label>
              <input type="date" name="date" value={formData.date} onChange={handleChange} required className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white [color-scheme:dark]" />
            </div>
            <div className="space-y-2">
              <label className="text-white/90 text-sm font-medium">{t.notes}</label>
              <input type="text" name="notes" value={formData.notes} onChange={handleChange} className="w-full bg-white/10 border border-white/30 rounded-lg px-4 py-3 text-white" placeholder="..." />
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <button type="submit" className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-4 rounded-xl transition-all shadow-xl flex items-center justify-center gap-3">
              <Send className="w-5 h-5" /> {t.submit}
            </button>
            <button type="button" onClick={handleClear} className="bg-white/10 hover:bg-white/20 text-white px-6 rounded-xl border border-white/30" title="Clear All"><Eraser className="w-5 h-5" /></button>
          </div>
        </form>
      </div>

      {showJson && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4" onClick={() => setShowJson(false)}>
          <div className="bg-slate-800 rounded-2xl border border-white/20 shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-4 flex justify-between items-center shrink-0">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Database className="w-5 h-5" />Reference Logic</h3>
              <button onClick={() => setShowJson(false)} className="bg-white/10 hover:bg-white/20 text-white p-1.5 rounded-lg"><X className="w-6 h-6" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <pre className="bg-black/50 p-4 rounded-xl text-xs font-mono text-green-400 overflow-x-auto border border-white/10">
{JSON.stringify({ 
  sync_timestamp: lastSynced,
  total_records: sheetData.length,
  mapping: {
    city: "Col B",
    ring: "Col D",
    fdt: "Col F",
    activity: "Col G",
    "Primary BOQ": "Col H",
    boq: "Col I",
    completed: "Col J",
    remaining: "Col K"
  },
  sample: sheetData.slice(0, 1)
}, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EntryForm;
