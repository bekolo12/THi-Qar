
import React from 'react';
import { Table, Trash2, Inbox } from 'lucide-react';
import { Entry } from '../types';
import { Language } from '../translations';

interface EntryTableProps {
  entries: Entry[];
  onDelete: (id: number) => void;
  t: any;
  currentLang: Language;
}

const EntryTable: React.FC<EntryTableProps> = ({ entries, onDelete, t, currentLang }) => {
  return (
    <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl overflow-hidden">
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 px-6 py-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
          <Table className="w-5 h-5" />
          {t.submittedEntries}
        </h3>
        <span className="bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-sm px-3 py-1 rounded-full">
          {entries.length}
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1000px]">
          <thead className="bg-black/20">
            <tr className="text-left rtl:text-right text-white/70 text-sm">
              <th className="px-4 py-3 font-medium">city</th>
              <th className="px-4 py-3 font-medium">ring</th>
              <th className="px-4 py-3 font-medium">{t.workType}</th>
              <th className="px-4 py-3 font-medium">fdt</th>
              <th className="px-4 py-3 font-medium">activity</th>
              <th className="px-4 py-3 font-medium">boq</th>
              <th className="px-4 py-3 font-medium">completed</th>
              <th className="px-4 py-3 font-medium">remaining</th>
              <th className="px-4 py-3 font-medium">{t.notes}</th>
              <th className="px-4 py-3 font-medium">{t.date}</th>
              <th className="px-4 py-3 font-medium text-right rtl:text-left"></th>
            </tr>
          </thead>
          <tbody className="text-white/90 divide-y divide-white/5">
            {entries.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-12 text-center text-white/40">
                  <div className="flex flex-col items-center gap-3">
                    <Inbox className="w-12 h-12 opacity-50" />
                    <p className="text-lg">{t.noEntries}</p>
                    <p className="text-sm">{t.fillForm}</p>
                  </div>
                </td>
              </tr>
            ) : (
              entries.map((entry) => (
                <tr key={entry.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-3 font-medium">{entry.city}</td>
                  <td className="px-4 py-3">{entry.ring}</td>
                  <td className="px-4 py-3">{t.workTypes[entry.workType as keyof typeof t.workTypes] || entry.workType}</td>
                  <td className="px-4 py-3">{entry.fdt}</td>
                  <td className="px-4 py-3">{t.activities[entry.activity as keyof typeof t.activities] || entry.activity}</td>
                  <td className="px-4 py-3">{entry.boq}</td>
                  <td className="px-4 py-3 text-green-400">{entry.completed}</td>
                  <td className="px-4 py-3 text-yellow-400">{entry.remaining}</td>
                  <td className="px-4 py-3 max-w-[150px] truncate" title={entry.notes}>{entry.notes}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-white/70">{entry.date}</td>
                  <td className="px-4 py-3 text-right rtl:text-left">
                    <button 
                      onClick={() => onDelete(entry.id)} 
                      className="text-white/40 hover:text-red-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EntryTable;
