import { useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProductsStore } from '@/store/productsStore'
import { ProductForm } from '@/components/ProductForm'

export const ProductEditPage = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { products, loading, fetchProducts } = useProductsStore()

  useEffect(() => {
    if (products.length === 0) {
      void fetchProducts()
    }
  }, [products.length, fetchProducts])

  const foundProduct = useMemo(
    () => products.find((p) => p.id === id),
    [products, id]
  )

  useEffect(() => {
    if (!loading && !foundProduct && products.length > 0) {
      navigate('/products', { replace: true })
    }
  }, [loading, foundProduct, products.length, navigate])

  if (loading) {
    return <div className="flex items-center justify-center py-8"><p className="text-slate-400">Cargando...</p></div>
  }

  if (!foundProduct) {
    return null
  }

  return (
    <div className="p-4">
      <ProductForm product={foundProduct} onClose={() => navigate('/products')} />
    </div>
  )
}
