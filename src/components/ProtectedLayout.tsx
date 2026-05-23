import React from 'react';
import { Navbar } from './Navbar';
import { SaleModal } from './SaleModal';
import { useUiStore } from '@/store/uiStore';

interface ProtectedLayoutProps {
  children: React.ReactNode;
}

export const ProtectedLayout = ({ children }: ProtectedLayoutProps) => {
  const showSaleModal = useUiStore((state) => state.showSaleModal);
  const setShowSaleModal = useUiStore((state) => state.setShowSaleModal);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 dark:bg-slate-950 flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      {showSaleModal && <SaleModal onClose={() => setShowSaleModal(false)} />}
    </div>
  );
};
