import React, { useState, useEffect, useMemo } from 'react';
import { useProductsStore } from '@/store/productsStore';
import { useSalesStore } from '@/store/salesStore';
import { Product } from '@/types/models';

interface Props {
  onClose?: () => void;
}

export const SaleModal = ({ onClose }: Props) => {
  const { products, loading: productsLoading, fetchProducts } = useProductsStore();
  const { registerSale, loading: salesLoading, error: salesError } = useSalesStore();
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');

  const selectedProduct: Product | undefined = useMemo(
    () => products.find(p => p.id === selectedProductId),
    [products, selectedProductId]
  );

  const subTotal = useMemo(() => {
    if (!selectedProduct || !quantity) return 0;
    return selectedProduct.price * quantity;
  }, [selectedProduct, quantity]);

  useEffect(() => {
    if (!selectedProduct) {
      setError('');
      return;
    }

    if (quantity > selectedProduct.stock) {
      setError(`Solo hay ${selectedProduct.stock} unidades disponibles`);
    } else if (quantity < 1) {
      setError('Cantidad debe ser mayor a 0');
    } else {
      setError('');
    }
  }, [selectedProduct, quantity]);

  const handleSale = async () => {
    if (!selectedProduct) {
      setError('Selecciona un producto');
      return;
    }

    if (!selectedProductId) {
      setError('El producto seleccionado no existe');
      return;
    }

    if (quantity > selectedProduct.stock) {
      setError('No hay suficiente stock');
      return;
    }

    const result = await registerSale(selectedProductId, quantity, selectedProduct.price);

    if (result.success) {
      await fetchProducts();
      if (onClose) onClose();
    } else {
      setError(result.error || 'Error al registrar venta');
    }
  };

  const isSubmitting = salesLoading;
  const displayError = salesError || error;

  return (
    <div className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center p-4 z-50">
      <div className="bg-slate-800 dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-md border border-slate-700">
        <h2 className="text-2xl font-bold mb-4 text-white">
          Registrar Venta
        </h2>

        {productsLoading && <p className="text-center text-slate-400">Cargando productos...</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">
              Seleccionar producto
            </label>
            <div className="max-h-48 overflow-y-auto border border-slate-600 rounded-lg bg-slate-700">
              {products.map((product) => (
                <button
                  key={product.id}
                  onClick={() => setSelectedProductId(product.id)}
                  className={`w-full text-left px-3 py-2 text-sm border-b border-slate-600 last:border-b-0 hover:bg-slate-600 ${
                    product.id === selectedProductId
                      ? 'bg-emerald-900/50 border-l-4 border-l-emerald-500'
                      : ''
                  }`}
                >
                  <span className="text-white">{product.name}</span>
                  <span className="ml-2 text-slate-400">(${product.price} · Stock: {product.stock})</span>
                </button>
              ))}
              {products.length === 0 && !productsLoading && (
                <p className="px-3 py-4 text-center text-slate-400">No hay productos disponibles</p>
              )}
            </div>
          </div>

          {selectedProduct && (
            <div className="bg-slate-700 dark:bg-slate-700 p-3 rounded-lg border border-slate-600">
              <p className="font-semibold text-white">{selectedProduct.name}</p>
              <p className="text-sm text-emerald-500">Precio: ${selectedProduct.price}</p>
              <p className="text-sm text-slate-400">Stock disponible: {selectedProduct.stock}</p>
            </div>
          )}

          {selectedProduct && (
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                max={selectedProduct.stock}
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                className="w-full px-4 py-2 border border-slate-600 rounded-lg bg-slate-700 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
          )}

          <p className="text-lg font-bold text-emerald-600">
            Subtotal: ${subTotal}
          </p>

          {displayError && (
            <p className="text-red-500 text-sm">{displayError}</p>
          )}

          <div className="flex gap-2">
            <button
              onClick={handleSale}
              disabled={isSubmitting || productsLoading || !selectedProductId || !!error}
              className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Venta'}
            </button>

            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
