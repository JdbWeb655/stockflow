import { create } from 'zustand'

interface UiState {
  showSaleModal: boolean
  setShowSaleModal: (value: boolean) => void
}

export const useUiStore = create<UiState>((set) => ({
  showSaleModal: false,
  setShowSaleModal: (value: boolean) => set({ showSaleModal: value }),
}))
