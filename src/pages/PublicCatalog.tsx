import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ProductCard from '../components/ProductCard';

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  // other fields as needed
}

const PublicCatalog: React.FC = () => {
  const { username } = useParams<{ username: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      if (!username) {
        setError('Username missing');
        setLoading(false);
        return;
      }
      // 1. Get user id by username
      const { data: userData, error: userErr } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single();
      if (userErr || !userData) {
        setError('Vendedor no encontrado');
        setLoading(false);
        return;
      }
      const userId = userData.id;

      // 2. Get public products for that user
      const { data: prodData, error: prodErr } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .gt('stock', 0)
        .eq('sold', false);
      if (prodErr) {
        setError('Error al obtener productos');
        setLoading(false);
        return;
      }
      setProducts(prodData as Product[]);
      setLoading(false);
    };
    fetchProducts();
  }, [username]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;
  if (products.length === 0) return <p>No hay productos disponibles.</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
};

export default PublicCatalog;