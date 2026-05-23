import { useEffect, useMemo } from 'react'
import { useProductsStore } from '@/store/productsStore'
import { useSalesStore } from '@/store/salesStore'
import { SalesReport } from './SalesReport'

export const Dashboard = () => {
  const { products, fetchProducts } = useProductsStore()
  const { sales, fetchSales } = useSalesStore()

  const loadData = async (): Promise<void> => {
    try {
      await Promise.all([fetchProducts(), fetchSales()])
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      console.error(message)
    }
  }

  useEffect(() => {
    void loadData()
  }, [fetchProducts, fetchSales])

  const monthlyRevenue = useMemo((): number => {
    const now = new Date()
    return sales
      .filter((s) => s.createdAt.getMonth() === now.getMonth() && s.createdAt.getFullYear() === now.getFullYear())
      .reduce((sum, s) => sum + s.total, 0)
  }, [sales])

  const totalProducts = products.length
  const lowStock = products.filter(p => p.stock < 5).length

  return (
    <div className="px-4 py-8 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Total Productos</h2>
          <p className="text-3xl font-bold text-emerald-400">{totalProducts}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Ventas del Mes</h2>
          <p className="text-3xl font-bold text-emerald-400">${monthlyRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Stock Bajo</h2>
          <p className="text-3xl font-bold text-emerald-400">{lowStock}</p>
        </div>
      </div>

      <SalesReport />
    </div>
  )
}
