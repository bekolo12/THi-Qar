
import React from 'react';
import { Database, Search, Filter, Info } from 'lucide-react';

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

interface SheetDataViewProps {
  data: SheetRow[];
  totalCount: number;
  lastSynced: string | null;
  isFiltered: boolean;
  t: any;
}

const SheetDataView: React.FC<SheetDataViewProps> = ({ data, totalCount, lastSynced, isFiltered, t }) => {
  if (totalCount === 0) return null;

  return (
    <div className="mt-12 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-fade-in">
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 px-6 py-4 flex items-center justify-between border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-cyan-500/20 rounded flex items-center justify-center">
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              Deployment Reference
              {isFiltered && (
                <span className="flex items-center gap-1 bg-blue-500/20 text-blue-300 text-[10px] px-2 py-0.5 rounded-full border border-blue-500/30 uppercase tracking-tighter">
                  <Filter className="w-2.5 h-2.5" /> Filtered View
                </span>
              )}
            </h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest">
              Showing {data.length} of {totalCount} records from spreadsheet
            </p>
          </div>
        </div>
        {lastSynced && (
          <span className="text-[10px] bg-black/30 text-white/50 px-3 py-1 rounded-full border border-white/5">
            Synced: {lastSynced}
          </span>
        )}
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto scrollbar-thin">
        <table className="w-full min-w-[900px] border-collapse">
          <thead className="sticky top-0 z-10">
            <tr className="bg-slate-900/95 text-white/60 text-[11px] uppercase tracking-wider text-left border-b border-white/5 backdrop-blur-sm">
              <th className="px-6 py-4 font-semibold">city</th>
              <th className="px-6 py-4 font-semibold">ring</th>
              <th className="px-6 py-4 font-semibold">fdt</th>
              <th className="px-6 py-4 font-semibold">activity</th>
              <th className="px-6 py-4 font-semibold">Primary BOQ</th>
              <th className="px-6 py-4 font-semibold">boq</th>
              <th className="px-6 py-4 font-semibold">completed</th>
              <th className="px-6 py-4 font-semibold">remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-20 text-center text-white/20 italic">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="w-8 h-8 opacity-20" />
                    No matching records found.
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 text-white/80">{row.city}</td>
                  <td className="px-6 py-4 text-white/80">{row.ring}</td>
                  <td className="px-6 py-4 text-white/80 font-medium">{row.fdt}</td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-300 font-medium">
                      {t.activities[row.activity as keyof typeof t.activities] || row.activity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-cyan-400/80 font-mono">{row.primaryBoq || '-'}</td>
                  <td className="px-6 py-4 text-white/60">{row.boq}</td>
                  <td className="px-6 py-4 text-green-400 font-medium">{row.completed}</td>
                  <td className="px-6 py-4 text-yellow-400 font-bold">{row.remaining}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Info className="w-4 h-4 text-blue-400" />
          <p className="text-xs text-white/50">
            Reference columns: City (B), Ring (D), FDT (F), Activity (G), Primary BOQ (H), BOQ (I), Completed (J), Remaining (K).
          </p>
        </div>
      </div>
    </div>
  );
};

export default SheetDataView;
