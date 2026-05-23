interface UpgradeModalProps {
  open: boolean
  onClose: () => void
}

export const UpgradeModal = ({ open, onClose }: UpgradeModalProps) => {
  if (!open) return null

  return (
    <div
      className="fixed inset-0 bg-slate-900 bg-opacity-90 flex items-center justify-center p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm border border-slate-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-white mb-4">Upgrade a PREMIUM</h3>
        <p className="text-slate-300 mb-6">
          Para actualizar tu plan contactá a: admin@stockflow.com
        </p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-slate-600 text-white rounded hover:bg-slate-500"
        >
          Cerrar
        </button>
      </div>
    </div>
  )
}
