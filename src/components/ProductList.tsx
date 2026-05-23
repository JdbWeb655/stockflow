
import { Product } from '@/types/models';

interface Props {
  products: Product[];
  loading?: boolean;
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export const ProductList = ({ products, loading, onEdit, onDelete }: Props) => {
  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">Cargando productos...</p>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex justify-center py-4">
        <div className="text-center">
          <p className="text-slate-500 dark:text-slate-400">No hay productos disponibles</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-y-auto bg-slate-900 dark:bg-slate-900 rounded-lg shadow-lg p-3 space-y-3">
      {products.map((product) => (
        <div
          key={product.id}
          className="group px-3 py-2 rounded-lg border border-slate-600 dark:border-slate-400 hover:border-emerald-400"
        >
          <div className="flex flex-col">
            <div className="flex justify-between">
              <div className="flex-1">
                <p className="font-medium text-slate-200 dark:text-white">{product.name}</p>
                <p className="text-xs text-slate-400 dark:text-slate-300 flex items-center">
                  <span className="mr-1">•</span>
                  {product.category || 'Sin categoría'}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                {onEdit && (
                  <button
                    onClick={() => onEdit(product)}
                    className="p-1 text-slate-400 hover:text-emerald-400"
                    title="Editar"
                  >
                    ✏️
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={() => onDelete(product.id)}
                    className="p-1 text-slate-400 hover:text-red-400"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                )}
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-emerald-600">${product.price}</p>
                <p className="text-xs text-slate-500 dark:text-slate-300">
                  Stock: {product.stock}
                </p>
              </div>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">
              SKU: {product.sku || 'N/A'}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
