import React, { useState, useEffect } from 'react';
import { useProductsStore } from '@/store/productsStore';
import { useAuthStore } from '@/store/authStore';
import { ImageUploader } from './ImageUploader';
import { Product } from '@/types/models';

export const ProductForm = ({ product, onClose }: { product?: Product; onClose?: () => void }) => {
  const { user } = useAuthStore();
  const [name, setName] = useState(product?.name || '')
  const [sku, setSku] = useState(product?.sku || '')
  const [price, setPrice] = useState(product?.price?.toString() || '')
  const [cost, setCost] = useState(product?.cost?.toString() || '')
  const [stock, setStock] = useState(product?.stock?.toString() || '')
  const [category, setCategory] = useState(product?.category || '')
  const [photos, setPhotos] = useState<string[]>(product?.photos || [])

  useEffect(() => {
    setName(product?.name || '')
    setSku(product?.sku || '')
    setPrice(product?.price?.toString() || '')
    setCost(product?.cost?.toString() || '')
    setStock(product?.stock?.toString() || '')
    setCategory(product?.category || '')
    setPhotos(product?.photos || [])
    setLocalError('')
  }, [product])

  const [submitting, setSubmitting] = useState(false);
  const [localError, setLocalError] = useState('');


  const addProduct = useProductsStore(state => state.addProduct);
  const updateProduct = useProductsStore(state => state.updateProduct);
  const error = useProductsStore(state => state.error);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);
    setLocalError('');
    try {
      const parsed: Omit<Product, 'id' | 'userId'> = {
        name,
        sku,
        price: parseFloat(price),
        cost: parseFloat(cost),
        stock: parseInt(stock, 10),
        category: category || undefined,
        photos,
      };
      if (product) {
        const updates: Partial<Product> = {
          name: parsed.name,
          sku: parsed.sku,
          price: parsed.price,
          cost: parsed.cost,
          stock: parsed.stock,
          category: parsed.category,
          photos: parsed.photos,
        };
        const result = await updateProduct(product.id, updates);
        if (result.success && onClose) onClose();
        else if (!result.success) setLocalError(result.error || 'Error al actualizar');
      } else {
        const result = await addProduct(parsed);
        if (result.success && onClose) onClose();
        else if (!result.success) setLocalError(result.error || 'Error al crear producto');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = (): void => {
    if (onClose) onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-slate-800 rounded-lg shadow-md text-white">
      <h2 className="text-xl font-semibold">{product ? 'Editar' : 'Nuevo'} Producto</h2>
      {(localError || error) && <p className="text-red-500">{localError || error}</p>}
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Nombre *</label>
        <input required placeholder="Nombre" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">SKU</label>
        <input placeholder="SKU" value={sku} onChange={e => setSku(e.target.value)} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Precio *</label>
        <input required type="number" step="0.01" placeholder="Precio" value={price} onChange={e => setPrice(e.target.value)} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Costo *</label>
        <input required type="number" step="0.01" placeholder="Costo" value={cost} onChange={e => setCost(e.target.value)} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Stock *</label>
        <input required type="number" placeholder="Stock" value={stock} onChange={e => setStock(e.target.value)} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-300 mb-1">Categoría</label>
        <input placeholder="Categoría" value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-slate-500 rounded focus:outline-none focus:ring-2 focus:ring-emerald-400" />
      </div>
      <ImageUploader userId={user?.id ?? ''} photos={photos} onPhotosChange={setPhotos} />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={submitting}
          className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? 'Guardando...' : (product ? 'Actualizar' : 'Crear')}
        </button>
        <button
          type="button"
          onClick={handleCancel}
          className="px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-700"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
};
