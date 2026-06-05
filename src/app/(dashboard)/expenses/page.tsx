'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatDate, EXPENSE_CATEGORIES } from '@/lib/utils'

interface Expense {
  id: string
  amount: number
  category: string
  description: string
  date: string
  createdAt: string
}

const categoryIcons: Record<string, string> = {
  food: '🍔',
  transport: '🚗',
  housing: '🏠',
  entertainment: '🎬',
  health: '❤️',
  education: '📚',
  other: '📦',
}

const categoryLabels: Record<string, string> = {
  food: 'Alimentación',
  transport: 'Transporte',
  housing: 'Vivienda',
  entertainment: 'Entretenimiento',
  health: 'Salud',
  education: 'Educación',
  other: 'Otros',
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [filterCategory, setFilterCategory] = useState('all')
  const [form, setForm] = useState({
    amount: '',
    category: 'food',
    description: '',
    date: new Date().toISOString().split('T')[0],
  })

  const fetchExpenses = async () => {
    const res = await fetch('/api/expenses')
    const data = await res.json()
    setExpenses(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const res = await fetch('/api/expenses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })

    if (res.ok) {
      setForm({ amount: '', category: 'food', description: '', date: new Date().toISOString().split('T')[0] })
      setShowForm(false)
      fetchExpenses()
    }
    setSubmitting(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este gasto?')) return
    await fetch(`/api/expenses/${id}`, { method: 'DELETE' })
    fetchExpenses()
  }

  const filtered = filterCategory === 'all'
    ? expenses
    : expenses.filter(e => e.category === filterCategory)

  const total = filtered.reduce((sum, e) => sum + e.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Gastos</h1>
          <p className="text-gray-400 mt-1">Gestiona y controla tus gastos</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-green-500 hover:bg-green-400 text-black font-semibold px-5 py-2.5 rounded-xl transition-all duration-200"
        >
          + Añadir Gasto
        </button>
      </div>

      {/* Add Expense Form */}
      {showForm && (
        <div className="glass rounded-2xl p-6 border border-green-500/20">
          <h2 className="text-lg font-semibold text-white mb-4">Nuevo Gasto</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Descripción</label>
              <input
                type="text"
                value={form.description}
                onChange={e => setForm({ ...form, description: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50"
                placeholder="Ej: Supermercado semanal"
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
              <label className="block text-sm text-gray-400 mb-1">Categoría</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full bg-black/30 border border-green-900/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50"
              >
                {EXPENSE_CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
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
                {submitting ? 'Guardando...' : 'Guardar Gasto'}
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

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {EXPENSE_CATEGORIES.map(cat => {
          const catTotal = expenses.filter(e => e.category === cat.value).reduce((s, e) => s + e.amount, 0)
          return (
            <div
              key={cat.value}
              onClick={() => setFilterCategory(filterCategory === cat.value ? 'all' : cat.value)}
              className={`glass rounded-xl p-4 cursor-pointer transition-all ${filterCategory === cat.value ? 'border-green-500/50 bg-green-500/10' : 'glass-hover'}`}
            >
              <div className="text-2xl mb-2">{cat.icon}</div>
              <p className="text-xs text-gray-400">{cat.label}</p>
              <p className="text-lg font-semibold text-white">{formatCurrency(catTotal)}</p>
            </div>
          )
        })}
        <div
          onClick={() => setFilterCategory('all')}
          className={`glass rounded-xl p-4 cursor-pointer transition-all ${filterCategory === 'all' ? 'border-green-500/50 bg-green-500/10' : 'glass-hover'}`}
        >
          <div className="text-2xl mb-2">📊</div>
          <p className="text-xs text-gray-400">Total</p>
          <p className="text-lg font-semibold text-white">{formatCurrency(total)}</p>
        </div>
      </div>

      {/* Filter indicator */}
      {filterCategory !== 'all' && (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Mostrando:</span>
          <span className="bg-green-500/20 text-green-400 text-sm px-3 py-1 rounded-full">
            {categoryIcons[filterCategory]} {categoryLabels[filterCategory]}
          </span>
          <button onClick={() => setFilterCategory('all')} className="text-gray-500 hover:text-white text-sm">
            × Limpiar
          </button>
        </div>
      )}

      {/* Expenses List */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-green-900/30 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">
            {filtered.length} gasto{filtered.length !== 1 ? 's' : ''}
          </h2>
          <span className="text-red-400 font-semibold">{formatCurrency(total)}</span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-gray-400 animate-pulse">Cargando...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-4xl mb-3">💸</p>
            <p className="text-gray-400">No hay gastos registrados</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-4 text-green-400 hover:text-green-300 text-sm"
            >
              Añadir tu primer gasto →
            </button>
          </div>
        ) : (
          <div className="divide-y divide-green-900/20">
            {filtered.map(expense => (
              <div key={expense.id} className="px-6 py-4 flex items-center justify-between hover:bg-green-500/5 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-xl">
                    {categoryIcons[expense.category] || '📦'}
                  </div>
                  <div>
                    <p className="font-medium text-white">{expense.description}</p>
                    <p className="text-sm text-gray-500">
                      {categoryLabels[expense.category] || expense.category} · {formatDate(expense.date)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-red-400 font-semibold">-{formatCurrency(expense.amount)}</span>
                  <button
                    onClick={() => handleDelete(expense.id)}
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
