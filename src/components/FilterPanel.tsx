import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'

interface FilterPanelProps {
  name: string
  category: string
  priceMin: string
  priceMax: string
  onNameChange: (val: string) => void
  onCategoryChange: (val: string) => void
  onPriceMinChange: (val: string) => void
  onPriceMaxChange: (val: string) => void
  onSearch: () => void
  onClear: () => void
}

export const FilterPanel = ({
  name,
  category,
  priceMin,
  priceMax,
  onNameChange,
  onCategoryChange,
  onPriceMinChange,
  onPriceMaxChange,
  onSearch,
  onClear,
}: FilterPanelProps) => {
  const [categories, setCategories] = useState<string[]>([])

  useEffect(() => {
    const fetchCategories = async () => {
      const { user } = useAuthStore.getState()
      if (!user) return

      const { data } = await supabase
        .from('products')
        .select('category')
        .eq('user_id', user.id)
        .not('category', 'is', null)

      if (data) {
        const unique = [...new Set(data.map((p) => p.category).filter(Boolean) as string[])]
        setCategories(unique.sort())
      }
    }

    fetchCategories()
  }, [])

  return (
    <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4 mb-4">
      <div className="flex flex-col md:flex-row gap-3 items-end">
        <div className="flex-1">
          <label className="block text-xs text-slate-400 mb-1">Nombre</label>
          <input
            type="text"
            value={name}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder="Buscar por nombre..."
            className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="w-full md:w-40">
          <label className="block text-xs text-slate-400 mb-1">Categoría</label>
          <select
            value={category}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todas las categorías</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div className="w-full md:w-28">
          <label className="block text-xs text-slate-400 mb-1">Precio desde</label>
          <input
            type="number"
            value={priceMin}
            onChange={(e) => onPriceMinChange(e.target.value)}
            placeholder="Desde"
            className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="w-full md:w-28">
          <label className="block text-xs text-slate-400 mb-1">Precio hasta</label>
          <input
            type="number"
            value={priceMax}
            onChange={(e) => onPriceMaxChange(e.target.value)}
            placeholder="Hasta"
            className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={onSearch}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
          >
            Buscar
          </button>
          <button
            onClick={onClear}
            className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 text-sm"
          >
            Limpiar
          </button>
        </div>
      </div>
    </div>
  )
}
