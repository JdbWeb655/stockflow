import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/models';
import { SearchBar } from './SearchBar';
import { FilterPanel } from './FilterPanel';
import { ProductCard } from './ProductCard';

export const PublicCatalog = () => {
  const { username } = useParams<{ username: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true)
        
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id')
          .eq('username', username)
          .single()

        if (userError || !userData) {
          setError('Vendedor no encontrado')
          return
        }

        const { data, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('user_id', userData.id)
          .eq('sold', false)
          .gt('stock', 0)

        if (productsError) throw productsError
        setProducts(data || [])
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Error al cargar productos'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    if (username) loadProducts()
  }, [username])

  const filtered = products.filter(p => {
    const matchesName = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category ? p.category === category : true;
    return matchesName && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-900 p-6 text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">Catálogo Público de {username}</h1>
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <SearchBar value={search} onChange={setSearch} />
        <FilterPanel category={category} onCategoryChange={setCategory} />
      </div>
      {loading && <p className="text-center">Cargando...</p>}
      {error && <p className="text-center text-red-400">{error}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            vendorPhone="1234567890"
            catalogUrl={`${window.location.origin}/product/${product.id}`}
          />
        ))}
      </div>
    </div>
  );
};