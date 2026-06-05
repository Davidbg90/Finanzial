'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate } from '@/lib/utils'

interface Income {
  id: string
  amount: number
  source: string
  description: string
  date: string
}

const INCOME_SOURCES = [
  { value: 'salary', label: 'Salario', icon: '💼' },
  { value: 'freelance', label: 'Freelance', icon: '💻' },
  { value: 'business', label: 'Negocio', icon: '🏪' },
  { value: 'investment', label: 'Inversiones', icon: '📈' },
  { value: 'rental', label: 'Alquiler', icon: '🏘️' },
  { value: 'bonus', label: 'Bono', icon: '🎁' },
  { value: 'other', label: 'Otros', icon: '💰' },
]

const sourceIcons: Record<string, string> = Object.fromEntries(
  INCOME_SOURCES.map(s => [s.value, s.icon])
)

const sourceLabels: Record<string, string> = Object.fromEntries(
  INCOME_SOURCES.map(s => [s.value, s.label])
)

export default function IncomePage() {
  const [incomes, setIncomes] = useState<Income[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    amount: '',
    source: 'salary',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const fetchIncomes = async () => {
    const res = await fetch('/api/income')
    const data = await res.json()
    setIncomes(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchIncomes()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/income', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setForm({ amount: '', source: 'salary', description: '', date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      fetchIncomes()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este ingreso?')) return
    await fetch(`/api/income/${id}`, { method: 'DELETE' })
    fetchIncomes()
  }

  const total = incomes.reduce((sum, i) => sum + i.amount, 0)

  // Group by source
  const bySource = incomes.reduce((acc, income) => {
    acc[income.source] = (acc[income.source] || 0) + income.amount
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Ingresos</h1>
          <p className="text-gray-400 mt-1">Registra todas tus fuentes de ingreso</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
        >
          + Añadir Ingreso
        </button>
      </div>

      {/* Add Income Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 border border-green-500/20">
          <h2 className="text-lg font-semibold text-white mb-4">Nuevo Ingreso</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                placeholder="Ej: Nómina mensual"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Monto ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.amount}
                onChange={e => setForm({ ...form, amount: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fuente</label>
              <select
                value={form.source}
                onChange={e => setForm({ ...form, source: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50"
              >
                {INCOME_SOURCES.map(src => (
                  <option key={src.value} value={src.value}>
                    {src.icon} {src.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50"
                required
              />
            </div>
            <div className="col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-xl transition-all"
              >
                {submitting ? 'Guardando...' : 'Guardar Ingreso'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 rounded-xl border border-green-900/50 text-gray-400 hover:text-white transition-all"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Total & Sources */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-xl p-5 col-span-1 border border-green-500/20">
          <p className="text-gray-400 text-sm mb-1">Total Ingresos</p>
          <p className="text-3xl font-bold text-green-400">{formatCurrency(total)}</p>
          <p className="text-gray-500 text-xs mt-1">{incomes.length} registros</p>
        </div>
        {Object.entries(bySource).slice(0, 3).map(([source, amount]) => (
          <div key={source} className="glass rounded-xl p-5 glass-hover">
            <div className="text-2xl mb-2">{sourceIcons[source] || '💰'}</div>
            <p className="text-xs text-gray-400">{sourceLabels[source] || source}</p>
            <p className="text-lg font-semibold text-white">{formatCurrency(amount as number)}</p>
          </div>
        ))}
      </div>

      {/* Income List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-green-900/30 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Historial de Ingresos</h2>
          <span className="text-green-400 font-semibold">{formatCurrency(total)}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Cargando...</div>
        ) : incomes.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">💵</p>
            <p className="text-gray-400">No hay ingresos registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-green-400 hover:text-green-300 text-sm"
            >
              Añadir tu primer ingreso →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-green-900/20">
            {incomes.map(income => (
              <div key={income.id} className="px-6 py-4 flex items-center justify-between hover:bg-green-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
                    {sourceIcons[income.source] || '💰'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{income.description}</p>
                    <p className="text-sm text-gray-500">
                      {sourceLabels[income.source] || income.source} · {formatDate(income.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-green-400 font-semibold">+{formatCurrency(income.amount)}</span>
                  <button
                    onClick={() => handleDelete(income.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors p-1"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
