
import { Product } from '@/types/models';
import { WhatsAppButton } from './WhatsAppButton';

interface Props {
  product: Product;
  vendorPhone: string;
  catalogUrl: string;
}

export const ProductCard = ({ product, vendorPhone, catalogUrl }: Props) => {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-lg p-4 flex flex-col h-full">
      {/* Image */}
      {product.photos?.[0] ? (
        <img
          src={product.photos[0]}
          alt={product.name}
          className="w-full h-48 object-cover rounded-md mb-4"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://placehold.co/300x200?text=Sin+imagen'
          }}
        />
      ) : (
        <img
          src="/default-product.png"
          alt={product.name}
          className="w-full h-48 object-cover rounded-md mb-4"
        />
      )}

      <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
        {product.name}
      </h3>
      {product.category && (
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">{product.category}</p>
      )}
      <p className="text-lg font-bold text-emerald-600 mb-2">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', minimumFractionDigits: 0 }).format(product.price)}</p>
      <WhatsAppButton 
        product={product}
        vendorPhone={vendorPhone}
        catalogUrl={catalogUrl}
      />
    </div>
  );
};

