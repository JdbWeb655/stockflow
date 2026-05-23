import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { useProductsStore, ProductFilters } from '@/store/productsStore'
import { ProductForm } from './ProductForm'
import { ProductList } from './ProductList'
import { FilterPanel } from './FilterPanel'
import { Product, SubscriptionPlan } from '@/types/models'

export const Products = () => {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const { user } = useAuthStore()
  const { products, loading, fetchProducts, deleteProduct, page, totalPages, setPage, setFilters, clearFilters, totalCount, filters } = useProductsStore()
  const [showForm, setShowForm] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [filterName, setFilterName] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterPriceMin, setFilterPriceMin] = useState('')
  const [filterPriceMax, setFilterPriceMax] = useState('')
  const [priceError, setPriceError] = useState('')

  const escapeSearchTerm = (term: string): string => {
    return term.replace(/[%_\\]/g, '\\$&')
  }

  const syncFiltersToUrl = useCallback((filters: ProductFilters) => {
    const params: Record<string, string> = {}
    if (filters.name) params.nombre = filters.name
    if (filters.category) params.categoria = filters.category
    if (filters.priceMin !== undefined) params.precioMin = String(filters.priceMin)
    if (filters.priceMax !== undefined) params.precioMax = String(filters.priceMax)
    setSearchParams(params, { replace: true })
  }, [setSearchParams])

  useEffect(() => {
    const name = searchParams.get('nombre') || ''
    const category = searchParams.get('categoria') || ''
    const priceMin = searchParams.get('precioMin') || ''
    const priceMax = searchParams.get('precioMax') || ''
    const urlFilters: ProductFilters = {
      name: name || undefined,
      category: category || undefined,
      priceMin: priceMin ? Number(priceMin) : undefined,
      priceMax: priceMax ? Number(priceMax) : undefined,
    }
    setFilterName(name)
    setFilterCategory(category)
    setFilterPriceMin(priceMin)
    setFilterPriceMax(priceMax)
    setFilters(urlFilters)
    if (name || category || priceMin || priceMax) {
      fetchProducts(1, urlFilters)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSearch = () => {
    if (filterPriceMin && filterPriceMax && Number(filterPriceMin) > Number(filterPriceMax)) {
      setPriceError('El precio mínimo no puede ser mayor al precio máximo')
      return
    }
    setPriceError('')

    const filters: ProductFilters = {
      name: filterName.trim() ? escapeSearchTerm(filterName.trim()) : undefined,
      category: filterCategory || undefined,
      priceMin: filterPriceMin ? Number(filterPriceMin) : undefined,
      priceMax: filterPriceMax ? Number(filterPriceMax) : undefined,
    }
    setFilters(filters)
    syncFiltersToUrl(filters)
    fetchProducts(1, filters)
  }

  const handleClearFilters = () => {
    setFilterName('')
    setFilterCategory('')
    setFilterPriceMin('')
    setFilterPriceMax('')
    setPriceError('')
    clearFilters()
    setSearchParams({}, { replace: true })
    fetchProducts(1, {})
  }

  const handleEdit = (product: Product) => {
    navigate(`/products/${product.id}/edit`)
  }

  const handleDelete = async (id: string) => {
    setDeleteId(id)
  }

  const confirmDelete = async () => {
    if (deleteId) {
      setDeleting(true)
      await deleteProduct(deleteId)
      setDeleting(false)
      setDeleteId(null)
    }
  }

  const handleCloseForm = () => {
    setShowForm(false)
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-slate-300">Gestión de Inventario</h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
        >
          Agregar Producto
        </button>
      </div>

      {user?.plan === SubscriptionPlan.FREE && totalCount >= 20 && (
        <div className="bg-yellow-900/50 border border-yellow-700 text-yellow-200 rounded-lg p-3 text-sm mb-4">
          Alcanzaste el límite de 20 productos del plan FREE. Contactá al administrador para actualizar a PREMIUM.
        </div>
      )}

      <FilterPanel
        name={filterName}
        category={filterCategory}
        priceMin={filterPriceMin}
        priceMax={filterPriceMax}
        onNameChange={setFilterName}
        onCategoryChange={setFilterCategory}
        onPriceMinChange={setFilterPriceMin}
        onPriceMaxChange={setFilterPriceMax}
        onSearch={handleSearch}
        onClear={handleClearFilters}
      />

      {priceError && (
        <p className="text-red-400 text-sm mb-4">{priceError}</p>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center z-50 overflow-y-auto">
          <div className="w-full max-w-md my-8 mx-4">
            <ProductForm 
                onClose={handleCloseForm} 
            />
          </div>
        </div>
      )}
      <div className="bg-slate-800 rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-medium mb-4 text-slate-300">Productos <span className="text-slate-400">({totalCount})</span></h3>
        <ProductList
            products={products}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
        />

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 px-2 py-3 border-t border-slate-700">
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

      {deleteId && (
        <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center p-4 z-50">
          <div className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-700">
            <h3 className="text-lg font-semibold text-white mb-4">Confirmar eliminación</h3>
            <p className="text-slate-300 mb-6">¿Estás seguro de que querés eliminar este producto?</p>
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
