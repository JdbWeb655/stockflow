import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useSalesStore, SaleFilters } from '@/store/salesStore'

export const SalesPage = () => {
  const { sales, loading, error: storeError, fetchSales, deleteSale, page, totalPages, setPage, totalRevenue, filters, setFilters, clearFilters } = useSalesStore()
  const [searchParams, setSearchParams] = useSearchParams()
  const [inputProductName, setInputProductName] = useState('')
  const [inputDateFrom, setInputDateFrom] = useState('')
  const [inputDateTo, setInputDateTo] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [dateError, setDateError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const syncFiltersToUrl = useCallback((f: SaleFilters): void => {
    const params = new URLSearchParams()
    if (f.productName) params.set('producto', f.productName)
    if (f.dateFrom) params.set('fechaDesde', f.dateFrom)
    if (f.dateTo) params.set('fechaHasta', f.dateTo)
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    const loadFromUrl = async (): Promise<void> => {
      setError(null)
      const producto = searchParams.get('producto') || undefined
      const fechaDesde = searchParams.get('fechaDesde') || undefined
      const fechaHasta = searchParams.get('fechaHasta') || undefined

      console.log('[SalesPage] loadFromUrl params:', { producto, fechaDesde, fechaHasta })

      if (producto || fechaDesde || fechaHasta) {
        const urlFilters: SaleFilters = { productName: producto, dateFrom: fechaDesde, dateTo: fechaHasta }
        setFilters(urlFilters)
        syncFiltersToUrl(urlFilters)
        try {
          await fetchSales(1, urlFilters)
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Error al cargar datos'
          setError(message)
        }
      } else {
        try {
          await fetchSales(1, {})
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Error al cargar datos'
          setError(message)
        }
      }
    }

    void loadFromUrl()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setInputProductName(filters.productName ?? '')
    setInputDateFrom(filters.dateFrom ?? '')
    setInputDateTo(filters.dateTo ?? '')
  }, [filters])

  const handleRetry = async (): Promise<void> => {
    setError(null)
    try {
      await fetchSales(page)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar datos'
      setError(message)
    }
  }

  const handleDelete = (id: string): void => {
    setDeleteId(id)
  }

  const confirmDelete = async (): Promise<void> => {
    if (deleteId) {
      setDeleting(true)
      await deleteSale(deleteId)
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const escapeLike = (value: string): string =>
    value.replace(/[%_\\]/g, '\\$&')

  const isValidDate = (value: string): boolean => {
    if (!value) return true
    const parsed = Date.parse(value)
    return !isNaN(parsed)
  }

  const handleSearch = async (): Promise<void> => {
    setError(null)
    setDateError(null)

    console.log('[SalesPage] handleSearch input:', {
      productName: inputProductName,
      dateFrom: inputDateFrom,
      dateTo: inputDateTo,
    })

    if (inputDateFrom && !isValidDate(inputDateFrom)) {
      setDateError('La fecha desde no es válida')
      return
    }
    if (inputDateTo && !isValidDate(inputDateTo)) {
      setDateError('La fecha hasta no es válida')
      return
    }
    if (inputDateFrom && inputDateTo && inputDateFrom > inputDateTo) {
      setDateError('La fecha desde no puede ser mayor a la fecha hasta')
      return
    }

    const activeFilters: SaleFilters = {}
    if (inputProductName) activeFilters.productName = escapeLike(inputProductName)
    if (inputDateFrom) activeFilters.dateFrom = inputDateFrom
    if (inputDateTo) activeFilters.dateTo = inputDateTo

    console.log('[SalesPage] handleSearch activeFilters:', JSON.stringify(activeFilters))

    setFilters(activeFilters)
    syncFiltersToUrl(activeFilters)
    try {
      await fetchSales(1, activeFilters)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al buscar ventas'
      setError(message)
    }
  }

  const handleClearFilters = async (): Promise<void> => {
    console.log('[SalesPage] handleClearFilters')
    setError(null)
    setDateError(null)
    setInputProductName('')
    setInputDateFrom('')
    setInputDateTo('')
    clearFilters()
    setSearchParams({}, { replace: true })
    try {
      await fetchSales(1, {})
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al limpiar filtros'
      setError(message)
    }
  }

  const displayError = error || storeError

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-slate-400">Cargando ventas...</p>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-6">
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-emerald-400">${totalRevenue.toLocaleString()}</p>
        </div>
        <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
          <h2 className="text-lg font-medium text-slate-300 mb-2">Cantidad de Ventas</h2>
          <p className="text-3xl font-bold text-emerald-400">{sales.length}</p>
        </div>
      </div>

      <div className="bg-slate-800 rounded-lg shadow-lg border border-slate-700 p-4">
        <div className="flex flex-col md:flex-row gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-slate-400 mb-1">Producto</label>
            <input
              type="text"
              value={inputProductName}
              onChange={(e) => setInputProductName(e.target.value)}
              placeholder="Buscar por producto..."
              className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs text-slate-400 mb-1">Fecha desde</label>
            <input
              type="date"
              value={inputDateFrom}
              onChange={(e) => setInputDateFrom(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="w-full md:w-40">
            <label className="block text-xs text-slate-400 mb-1">Fecha hasta</label>
            <input
              type="date"
              value={inputDateTo}
              onChange={(e) => setInputDateTo(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 text-sm"
            >
              Buscar
            </button>
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500 text-sm"
            >
              Limpiar
            </button>
          </div>
        </div>
      </div>

      {dateError && (
        <div className="bg-red-900/50 border border-red-700 rounded-lg p-3">
          <p className="text-red-200 text-sm">{dateError}</p>
        </div>
      )}

      {sales.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-400">No hay ventas registradas</p>
        </div>
      ) : (
        <div className="bg-slate-800 rounded-lg shadow-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-slate-700">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Fecha</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-slate-300">Producto</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Cantidad</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">Total</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id} className="border-t border-slate-700 hover:bg-slate-750">
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {new Date(sale.createdAt).toLocaleDateString('es-AR')}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {sale.productName || 'Eliminado'}
                  </td>
                  <td className="px-4 py-3 text-sm text-center text-slate-300">
                    {sale.quantity}
                  </td>
                  <td className="px-4 py-3 text-sm text-right font-medium text-emerald-400">
                    ${sale.total.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleDelete(sale.id)}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-700 bg-slate-750">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-slate-300">
                Página {page} de {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page === totalPages}
                className="px-3 py-1 text-sm bg-slate-600 text-white rounded hover:bg-slate-500 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Siguiente
              </button>
            </div>
          )}
        </div>
      )}

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Confirmar eliminación</h3>
            <p className="text-slate-300 mb-6">¿Estás seguro de que querés eliminar esta venta?</p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
              >
                {deleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
