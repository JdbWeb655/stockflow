import React from 'react';

interface Props {
  value: string;
  onChange: (val: string) => void;
}

export const SearchBar = ({ value, onChange }: Props) => (
  <input
    type="text"
    placeholder="Buscar por nombre..."
    value={value}
    onChange={e => onChange(e.target.value)}
    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
  />
);
