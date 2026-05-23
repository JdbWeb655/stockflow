import { useState, useEffect, useMemo } from 'react'
import { useSalesStore } from '@/store/salesStore'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface MonthlySale {
  label: string
  revenue: number
}

interface TopProduct {
  name: string
  quantity: number
}

export const SalesReport = () => {
  const { sales, loading, error: storeError, fetchSales } = useSalesStore()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async (): Promise<void> => {
      setError(null)
      try {
        await fetchSales()
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar datos'
        setError(message)
      }
    }

    void loadData()
  }, [fetchSales])

  /**
   * Total revenue across all sales.
   */
  const totalSales = useMemo((): number => {
    return sales.reduce((acc, s) => acc + Number(s.total), 0)
  }, [sales])

  const estimatedRevenue = totalSales * 0.3

  /**
   * Groups sales by month (YYYY-MM) and sums revenue per month.
   */
  const monthlySales = useMemo((): MonthlySale[] => {
    const map = new Map<string, number>()
    sales.forEach((s) => {
      const date = new Date(s.createdAt)
      const label = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      map.set(label, (map.get(label) || 0) + Number(s.total))
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([label, revenue]) => ({ label, revenue }))
  }, [sales])

  /**
   * Top 5 products by total quantity sold.
   */
  const topProducts = useMemo((): TopProduct[] => {
    const map = new Map<string, number>()
    sales.forEach((s) => {
      const name = s.productName || 'Producto eliminado'
      map.set(name, (map.get(name) || 0) + s.quantity)
    })
    return Array.from(map.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, quantity]) => ({ name, quantity }))
  }, [sales])

  const handleRetry = async (): Promise<void> => {
    setError(null)
    try {
      await fetchSales()
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      setError(message)
    }
  }

  const displayError = error || storeError

  if (loading) {
    return (
      <div className="bg-slate-800 text-white p-6 rounded-lg">
        <p className="text-center text-slate-400">Cargando reporte...</p>
      </div>
    )
  }

  if (sales.length === 0) {
    return (
      <div className="bg-slate-800 text-white p-6 rounded-lg">
        <p className="text-center text-slate-400">Sin datos de ventas aún</p>
      </div>
    )
  }

  return (
    <div className="bg-slate-800 text-white p-6 rounded-lg space-y-6">
      <div className="bg-slate-900 p-4 rounded">
        <p className="text-emerald-400 text-2xl font-bold">${totalSales.toLocaleString()}</p>
        <p className="text-slate-300 text-sm">Total Ventas</p>
      </div>

      {displayError && (
        <div className="flex items-center gap-4 bg-red-900/50 border border-red-700 rounded-lg p-4">
          <p className="text-red-200 flex-1">{displayError}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      )}

      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Ventas Mensuales</h3>
        {monthlySales.length > 0 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlySales.map(m => ({ month: m.label, sales: m.revenue }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip />
                <Bar dataKey="sales" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Sin datos mensuales</p>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-200 mb-3">Top 5 Productos</h3>
        {topProducts.length > 0 ? (
          <div className="space-y-2">
            {topProducts.map((product) => (
              <div key={product.name} className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">{product.name}</span>
                <span className="text-emerald-400 text-sm font-medium">{product.quantity} vendidos</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-slate-500 text-sm">Sin datos de productos</p>
        )}
      </div>
    </div>
  )
}
