import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { UpgradeModal } from '@/components/UpgradeModal'

export const ProfilePage = () => {
  const user = useAuthStore((state) => state.user)
  const updateProfile = useAuthStore((state) => state.updateProfile)
  const loading = useAuthStore((state) => state.loading)

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  useEffect(() => {
    if (user) {
      setName(user.name)
      setPhone(user.phone ?? '')
    }
  }, [user])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSave = async () => {
    const trimmedName = name.trim()
    if (!trimmedName) {
      setError('El nombre no puede estar vacío')
      return
    }

    setError(null)
    setSaving(true)

    const result = await updateProfile({ name: trimmedName, phone: phone.trim() || undefined })

    setSaving(false)

    if (result.error) {
      setError(result.error)
    } else {
      showToast('Perfil actualizado correctamente')
    }
  }

  if (!user) {
    return null
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <div className="px-4 py-8 max-w-2xl mx-auto space-y-6">
      {toast && (
        <div className="fixed top-4 right-4 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg z-50">
          {toast}
        </div>
      )}

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg border border-slate-700">
        <h2 className="text-xl font-semibold text-white mb-6">Mi Perfil</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Tu nombre"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Teléfono</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-700 text-white border border-slate-600 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Teléfono (opcional)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
            <p className="text-slate-400 bg-slate-700 bg-opacity-50 rounded px-3 py-2">{user.email}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Usuario</label>
            <p className="text-slate-400 bg-slate-700 bg-opacity-50 rounded px-3 py-2">{user.username}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Plan</label>
            <span
              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                user.plan === 'PREMIUM'
                  ? 'bg-yellow-500 text-yellow-900'
                  : 'bg-slate-600 text-slate-300'
              }`}
            >
              {user.plan}
            </span>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Miembro desde</label>
            <p className="text-slate-400 bg-slate-700 bg-opacity-50 rounded px-3 py-2">{formatDate(user.createdAt)}</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 text-red-400 text-sm">{error}</p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Guardando...' : 'Guardar'}
          </button>

          {user.plan === 'FREE' && (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2 bg-yellow-500 text-yellow-900 rounded hover:bg-yellow-400"
            >
              Upgrade a PREMIUM
            </button>
          )}
        </div>
      </div>

      <UpgradeModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} />
    </div>
  )
}
