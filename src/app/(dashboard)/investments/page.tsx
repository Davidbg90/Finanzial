'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate, INVESTMENT_TYPES } from '@/lib/utils'

interface Investment {
  id: string
  name: string
  type: string
  initialAmount: number
  currentValue: number
  date: string
}

const typeIcons: Record<string, string> = {
  stocks: '📈',
  crypto: '₿',
  real_estate: '🏢',
  funds: '💼',
  bonds: '📋',
  other: '💰',
}

const typeLabels: Record<string, string> = {
  stocks: 'Acciones',
  crypto: 'Criptomonedas',
  real_estate: 'Inmuebles',
  funds: 'Fondos',
  bonds: 'Bonos',
  other: 'Otros',
}

export default function InvestmentsPage() {
  const [investments, setInvestments] = useState<Investment[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    name: '',
    type: 'stocks',
    initialAmount: '',
    currentValue: '',
    date: new Date().toISOString().split('T')[0],
  })

  const fetchInvestments = async () => {
    const res = await fetch('/api/investments')
    const data = await res.json()
    setInvestments(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchInvestments()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/investments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setForm({ name: '', type: 'stocks', initialAmount: '', currentValue: '', date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      fetchInvestments()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta inversión?')) return
    await fetch(`/api/investments/${id}`, { method: 'DELETE' })
    fetchInvestments()
  }

  const totalInitial = investments.reduce((sum, i) => sum + i.initialAmount, 0)
  const totalCurrent = investments.reduce((sum, i) => sum + i.currentValue, 0)
  const totalReturn = totalInitial > 0 ? ((totalCurrent - totalInitial) / totalInitial) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Inversiones</h1>
          <p className="text-gray-400 mt-1">Monitorea tu portafolio de inversiones</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
        >
          + Añadir Inversión
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 border border-green-500/20">
          <h2 className="text-lg font-semibold text-white mb-4">Nueva Inversión</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Nombre</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                placeholder="Ej: Apple Inc."
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Tipo</label>
              <select
                value={form.type}
                onChange={e => setForm({ ...form, type: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50"
              >
                {INVESTMENT_TYPES.map(t => (
                  <option key={t.value} value={t.value}>
                    {t.icon} {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Inversión Inicial ($)</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={form.initialAmount}
                onChange={e => setForm({ ...form, initialAmount: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Valor Actual ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.currentValue}
                onChange={e => setForm({ ...form, currentValue: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Fecha de Compra</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50"
                required
              />
            </div>
            <div className="flex items-end gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-green-500 hover:bg-green-400 disabled:opacity-50 text-black font-semibold px-6 py-2.5 rounded-xl transition-all"
              >
                {submitting ? 'Guardando...' : 'Guardar'}
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

      {/* Portfolio Summary */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Inversión Total</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalInitial)}</p>
          <p className="text-gray-500 text-xs mt-1">Capital invertido</p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Valor Actual</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalCurrent)}</p>
          <p className={`text-xs mt-1 ${totalCurrent >= totalInitial ? 'text-green-400' : 'text-red-400'}`}>
            {totalCurrent >= totalInitial ? '+' : ''}{formatCurrency(totalCurrent - totalInitial)}
          </p>
        </div>
        <div className="glass rounded-xl p-5">
          <p className="text-gray-400 text-sm mb-1">Retorno Total</p>
          <p className={`text-2xl font-bold ${totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(2)}%
          </p>
          <p className="text-gray-500 text-xs mt-1">{investments.length} posiciones</p>
        </div>
      </div>

      {/* Investments List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-green-900/30">
          <h2 className="text-lg font-semibold text-white">Portafolio</h2>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Cargando...</div>
        ) : investments.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">📈</p>
            <p className="text-gray-400">No hay inversiones registradas</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-green-400 hover:text-green-300 text-sm"
            >
              Añadir tu primera inversión →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-green-900/20">
            {investments.map(inv => {
              const returnPct = ((inv.currentValue - inv.initialAmount) / inv.initialAmount) * 100
              const returnAmt = inv.currentValue - inv.initialAmount
              return (
                <div key={inv.id} className="px-6 py-4 flex items-center justify-between hover:bg-green-500/5 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
                      {typeIcons[inv.type] || '💰'}
                    </div>
                    <div>
                      <p className="font-medium text-white">{inv.name}</p>
                      <p className="text-sm text-gray-500">
                        {typeLabels[inv.type] || inv.type} · Desde {formatDate(inv.date)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Invertido</p>
                      <p className="text-sm text-white">{formatCurrency(inv.initialAmount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Valor Actual</p>
                      <p className="text-sm font-semibold text-white">{formatCurrency(inv.currentValue)}</p>
                    </div>
                    <div className="text-right min-w-[80px]">
                      <p className={`text-sm font-bold ${returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {returnPct >= 0 ? '+' : ''}{returnPct.toFixed(1)}%
                      </p>
                      <p className={`text-xs ${returnAmt >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {returnAmt >= 0 ? '+' : ''}{formatCurrency(returnAmt)}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(inv.id)}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
