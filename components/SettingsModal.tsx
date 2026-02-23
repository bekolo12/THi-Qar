
import React, { useState, useEffect } from 'react';
import { Settings, Save, X, AlertTriangle, Code, Info, Copy, Check, Cloud } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSave: (url: string) => void;
  t: any;
  mode: 'primary' | 'secondary';
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, currentUrl, onSave, t, mode }) => {
  const [url, setUrl] = useState(currentUrl);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUrl(currentUrl);
  }, [currentUrl, isOpen]);

  if (!isOpen) return null;

  const sheetName = mode === 'primary' ? 'Deployment' : 'sheet1';

  const primaryScript = `function doGet(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName('Deployment');
  if (!sheet) {
    return ContentService.createTextOutput(JSON.stringify({error: 'Sheet "Deployment" not found'}))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  var data = sheet.getDataRange().getValues();
  var rows = data.slice(1);
  var result = rows.map(function(row) {
    return {
      city: row[1], ring: row[3], fdt: row[5], activity: row[6],
      primaryBoq: row[7], boq: row[8], completed: row[9], remaining: row[10], notes: row[11]
    };
  }).filter(function(r) { return r.city || r.activity; });
  
  return ContentService.createTextOutput(JSON.stringify({data: result}))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('Deployment');
    var data = JSON.parse(e.postData.contents);
    // Col H is Primary BOQ (skipped/empty), Col I is BOQ, Col J is Completed, Col K is Remaining
    var newRow = [new Date(), data.city, "", data.ring, "", data.fdt, data.activity, "", data.boq, data.completed, data.remaining, data.notes];
    sheet.appendRow(newRow);
    return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const secondaryScript = `function doPost(e) {
  try {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName('sheet1');
    if (!sheet) {
      sheet = ss.insertSheet('sheet1');
      sheet.appendRow(["Province", "Ring", "FDT", "Activity", "BoQ", "Completed", "Remaining", "Date", "Plan", "Actual", "Work Type", "Notes"]);
    }
    var data = JSON.parse(e.postData.contents);
    
    // Header Mapping: Province, Ring, FDT, Activity, BoQ, Completed, Remaining, Date, Plan, Actual, Work Type, Notes
    var newRow = [
      data.city,       // Province
      data.ring,       // Ring
      data.fdt,        // FDT
      data.activity,   // Activity
      data.boq,        // BoQ
      data.completed,  // Completed
      data.remaining,  // Remaining
      data.date,       // Date
      data.boq,        // Plan (Defaulting to BoQ)
      data.completed,  // Actual (Defaulting to Completed)
      data.workType,   // Work Type
      data.notes       // Notes
    ];
    
    sheet.appendRow(newRow);
    return ContentService.createTextOutput(JSON.stringify({status: 'success'})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({status: 'error', message: err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

  const scriptCode = mode === 'primary' ? primaryScript : secondaryScript;

  const handleCopy = () => {
    navigator.clipboard.writeText(scriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-slate-900 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-white/10 shadow-2xl animate-scale-up">
        {/* Header */}
        <div className={`bg-gradient-to-r ${mode === 'primary' ? 'from-blue-600 to-indigo-600' : 'from-cyan-600 to-teal-600'} px-8 py-6 rounded-t-3xl flex justify-between items-center sticky top-0 z-10`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              {mode === 'primary' ? <Settings className="text-white w-6 h-6" /> : <Cloud className="text-white w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                {mode === 'primary' ? 'Primary Cloud Sync' : 'Secondary Cloud Sync'}
              </h3>
              <p className="text-white/60 text-xs">Target Sheet: <b className="text-white">{sheetName}</b></p>
            </div>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white transition-colors bg-white/10 p-2 rounded-full">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-8 space-y-8">
          <div className="p-5 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-start gap-4 text-amber-100">
            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5 text-amber-400" />
            <div className="text-sm">
              <p className="font-bold mb-2 text-base text-amber-400">Setup Instructions:</p>
              <ol className="list-decimal ml-4 space-y-2 opacity-90 leading-relaxed">
                <li>Rename your Google Sheet tab to <b className="text-white">{sheetName}</b>.</li>
                <li>Go to <b className="text-white">Extensions &gt; Apps Script</b> and paste the code below.</li>
                <li>Deploy as <b className="text-white">Web App</b>, Execute as <b className="text-white">Me</b>, Access: <b className="text-white">Anyone</b>.</li>
                <li>Paste the <b className="text-white">Web App URL</b> below.</li>
              </ol>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
                <Code className="w-4 h-4 text-blue-400" /> Script Code
              </label>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs bg-blue-500/10 hover:bg-blue-500/20 px-4 py-2 rounded-xl text-blue-400 transition-all font-bold border border-blue-500/20"
              >
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <pre className="bg-black/60 p-6 rounded-2xl text-[11px] font-mono text-green-400 border border-white/5 overflow-x-auto max-h-60 leading-relaxed scrollbar-thin">
              {scriptCode}
            </pre>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-semibold text-white/50 flex items-center gap-2">
              <Info className="w-4 h-4 text-blue-400" /> Web App URL
            </label>
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/.../exec"
              className="w-full bg-slate-950 border border-white/10 rounded-2xl py-4 px-6 text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all font-mono text-sm shadow-inner"
            />
          </div>

          <div className="pt-6 flex gap-4">
            <button
              onClick={() => onSave(url)}
              className={`flex-1 ${mode === 'primary' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-cyan-600 hover:bg-cyan-700'} text-white font-bold py-4 rounded-2xl transition-all shadow-xl flex items-center justify-center gap-3 active:scale-[0.98]`}
            >
              <Save className="w-5 h-5" />
              {t.saveConnect}
            </button>
            <button onClick={onClose} className="px-8 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-2xl transition-all font-semibold">
              {t.cancel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
