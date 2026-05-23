import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Product } from '@/types/models'

const PAGE_SIZE = 10

export interface ProductFilters {
  name?: string
  category?: string
  priceMin?: number
  priceMax?: number
}

interface ProductsState {
  products: Product[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  filters: ProductFilters
  fetchProducts: (page?: number, filters?: ProductFilters) => Promise<void>
  addProduct: (product: Omit<Product, 'id' | 'userId'>) => Promise<{ success: boolean; error?: string }>
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>
  setPage: (page: number) => void
  setFilters: (filters: ProductFilters) => void
  clearFilters: () => void
}

export const useProductsStore = create<ProductsState>((set, get) => ({
  products: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
  filters: {},

  fetchProducts: async (page, filters) => {
    const currentPage = page ?? get().page
    const activeFilters = filters ?? get().filters
    set({ loading: true, error: null, page: currentPage, filters: activeFilters })
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        set({ loading: false, error: 'Usuario no autenticado' })
        return
      }

      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      let query = supabase
        .from('products')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id)

      if (activeFilters.name) {
        query = query.ilike('name', `%${activeFilters.name}%`)
      }
      if (activeFilters.category) {
        query = query.eq('category', activeFilters.category)
      }
      if (activeFilters.priceMin !== undefined) {
        query = query.gte('price', activeFilters.priceMin)
      }
      if (activeFilters.priceMax !== undefined) {
        query = query.lte('price', activeFilters.priceMax)
      }

      const { data, error: supabaseError, count } = await query.range(from, to)

      if (supabaseError) {
        throw supabaseError
      }

      const total = count ?? 0
      set({
        products: data || [],
        loading: false,
        totalCount: total,
        totalPages: Math.ceil(total / PAGE_SIZE),
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar productos'
      set({ loading: false, error: message })
    }
  },

  addProduct: async (product) => {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const newProduct = {
        ...product,
        user_id: user.id,
      }

      const { data, error: supabaseError } = await supabase
        .from('products')
        .insert(newProduct)
        .select()
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      await get().fetchProducts(1, {})

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al agregar producto'
      return { success: false, error: message }
    }
  },

  updateProduct: async (id, updates) => {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const { error: supabaseError } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)

      if (supabaseError) {
        throw supabaseError
      }

      await get().fetchProducts(undefined, get().filters)

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al actualizar producto'
      return { success: false, error: message }
    }
  },

  deleteProduct: async (id) => {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const { error: supabaseError } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (supabaseError) {
        throw supabaseError
      }

      await get().fetchProducts(undefined, get().filters)

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar producto'
      return { success: false, error: message }
    }
  },

  setFilters: (filters) => {
    set({ filters })
  },

  clearFilters: () => {
    set({ filters: {} })
  },

  setPage: (page) => {
    set({ page })
    get().fetchProducts(page, get().filters)
  },
}))