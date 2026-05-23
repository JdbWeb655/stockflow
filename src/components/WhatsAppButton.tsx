import React from 'react';
import { Product } from '@/types/models';

type Props = {
  product: Product;
  vendorPhone: string;
  catalogUrl: string;
};

export const WhatsAppButton = ({ product, vendorPhone, catalogUrl }: Props) => {
  const message = encodeURIComponent(
    `Hola! Me interesa: ${product.name} - ${catalogUrl}`
  );
  const href = `https://wa.me/${vendorPhone}?text=${message}`;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-auto inline-block px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 transition text-center"
    >
      Contactar vía WhatsApp
    </a>
  );
};
