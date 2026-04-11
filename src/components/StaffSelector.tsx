import React from 'react';
import { Staff } from '../types';
import { Users } from 'lucide-react';

interface StaffSelectorProps {
  staffList: Staff[];
  selectedStaffId: string;
  onSelect: (id: string) => void;
  showAllOption?: boolean;
}

export default function StaffSelector({ staffList, selectedStaffId, onSelect, showAllOption = true }: StaffSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 bg-white rounded-lg border border-slate-200 text-slate-400">
        <Users size={18} />
      </div>
      <select
        value={selectedStaffId}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none transition-all appearance-none pr-10 relative"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 12px center',
          backgroundSize: '16px'
        }}
      >
        {showAllOption && <option value="all">Todos os Funcionários</option>}
        {staffList.map((staff) => (
          <option key={staff.id} value={staff.id}>
            {staff.name}
          </option>
        ))}
      </select>
    </div>
  );
}
