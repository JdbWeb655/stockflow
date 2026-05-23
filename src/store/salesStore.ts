import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import { useAuthStore } from '@/store/authStore'
import { Sale } from '@/types/models'

const PAGE_SIZE = 20

export interface SaleFilters {
  productName?: string
  dateFrom?: string
  dateTo?: string
}

interface SalesState {
  sales: Sale[]
  loading: boolean
  error: string | null
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  totalRevenue: number
  filters: SaleFilters
  fetchSales: (page?: number, filters?: SaleFilters) => Promise<void>
  registerSale: (productId: string, quantity: number, unitPrice: number) => Promise<{ success: boolean; error?: string }>
  deleteSale: (id: string) => Promise<{ success: boolean; error?: string }>
  setPage: (page: number) => void
  setFilters: (filters: SaleFilters) => void
  clearFilters: () => void
}

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  loading: false,
  error: null,
  page: 1,
  pageSize: PAGE_SIZE,
  totalCount: 0,
  totalPages: 0,
  totalRevenue: 0,
  filters: {},

  fetchSales: async (page, filters) => {
    const currentPage = page ?? get().page
    const activeFilters = filters ?? get().filters
    set({ loading: true, error: null, page: currentPage, filters: activeFilters })

    console.log('[fetchSales] page:', currentPage, 'filters:', JSON.stringify(activeFilters))

    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        set({ loading: false, error: 'Usuario no autenticado' })
        return
      }

      if (activeFilters.dateFrom && activeFilters.dateTo) {
        if (activeFilters.dateFrom > activeFilters.dateTo) {
          set({ loading: false, error: 'La fecha desde no puede ser mayor a la fecha hasta' })
          return
        }
      }

      const from = (currentPage - 1) * PAGE_SIZE
      const to = from + PAGE_SIZE - 1

      const escapeLike = (value: string): string =>
        value.replace(/[%_\\]/g, '\\$&')

      let query = supabase
        .from('sales')
        .select('*, products(name)', { count: 'exact' })
        .eq('user_id', user.id)

      if (activeFilters.productName) {
        const sanitized = escapeLike(activeFilters.productName)
        const { data: matchingProducts } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', `%${sanitized}%`)

        const ids = matchingProducts?.map(p => p.id) ?? []
        if (ids.length === 0) {
          set({
            sales: [],
            loading: false,
            totalCount: 0,
            totalPages: 0,
            totalRevenue: 0,
          })
          return
        }
        query = query.in('product_id', ids)
      }

      if (activeFilters.dateFrom) {
        query = query.gte('created_at', activeFilters.dateFrom)
      }
      if (activeFilters.dateTo) {
        const dateToEnd = `${activeFilters.dateTo}T23:59:59.999Z`
        query = query.lte('created_at', dateToEnd)
      }

      query = query.order('created_at', { ascending: false }).range(from, to)

      console.log('[fetchSales] executing query with dateTo:', activeFilters.dateTo)

      const { data, error: supabaseError, count } = await query

      console.log('[fetchSales] rows:', data?.length, 'totalCount:', count)

      if (supabaseError) {
        console.error('[fetchSales] supabase error:', supabaseError)
        throw supabaseError
      }

      const mapped: Sale[] = (data || []).map((sale) => ({
        id: sale.id,
        userId: sale.user_id,
        productId: sale.product_id,
        productName: sale.products?.name ?? 'Producto eliminado',
        quantity: sale.quantity,
        unitPrice: Number(sale.unit_price),
        total: Number(sale.total),
        createdAt: new Date(sale.created_at),
      }))

      let revenueQuery = supabase
        .from('sales')
        .select('total')
        .eq('user_id', user.id)

      if (activeFilters.productName) {
        const sanitized = escapeLike(activeFilters.productName)
        const { data: matchingProducts } = await supabase
          .from('products')
          .select('id')
          .eq('user_id', user.id)
          .ilike('name', `%${sanitized}%`)

        const ids = matchingProducts?.map(p => p.id) ?? []
        if (ids.length > 0) {
          revenueQuery = revenueQuery.in('product_id', ids)
        } else {
          revenueQuery = revenueQuery.in('product_id', [])
        }
      }

      if (activeFilters.dateFrom) {
        revenueQuery = revenueQuery.gte('created_at', activeFilters.dateFrom)
      }
      if (activeFilters.dateTo) {
        const dateToEnd = `${activeFilters.dateTo}T23:59:59.999Z`
        revenueQuery = revenueQuery.lte('created_at', dateToEnd)
      }

      const { data: revenueData } = await revenueQuery

      console.log('[fetchSales] revenueQuery count:', (revenueData || []).length)

      const totalRev = (revenueData || []).reduce(
        (acc, s) => acc + Number(s.total), 0
      )

      const total = count ?? 0
      set({
        sales: mapped,
        loading: false,
        totalCount: total,
        totalPages: Math.ceil(total / PAGE_SIZE),
        totalRevenue: totalRev,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al cargar ventas'
      console.error('[fetchSales] error:', message)
      set({ loading: false, error: message })
    }
  },

  registerSale: async (productId, quantity, unitPrice) => {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const total = quantity * unitPrice

      const { data, error: supabaseError } = await supabase
        .from('sales')
        .insert({
          user_id: user.id,
          product_id: productId,
          quantity,
          total,
          unit_price: unitPrice,
        })
        .select()
        .single()

      if (supabaseError) {
        throw supabaseError
      }

      await get().fetchSales(1, {})

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al registrar venta'
      return { success: false, error: message }
    }
  },

  deleteSale: async (id) => {
    try {
      const { user } = useAuthStore.getState()
      if (!user) {
        return { success: false, error: 'Usuario no autenticado' }
      }

      const { error: supabaseError } = await supabase
        .from('sales')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (supabaseError) {
        throw supabaseError
      }

      await get().fetchSales(undefined, get().filters)

      return { success: true }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error al eliminar venta'
      return { success: false, error: message }
    }
  },

  setPage: (page) => {
    set({ page })
    get().fetchSales(page, get().filters)
  },

  setFilters: (filters) => {
    set({ filters })
  },

  clearFilters: () => {
    set({ filters: {} })
  },
}))
