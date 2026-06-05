'use client'

import { useEffect, useState } from 'react'
import { formatCurrency } from '@/lib/utils'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend
} from 'recharts'

interface ReportData {
  year: number
  monthlyBreakdown: Array<{
    month: string
    monthIndex: number
    income: number
    expenses: number
    savings: number
  }>
  categoryBreakdown: Record<string, number>
  totals: {
    income: number
    expenses: number
    savings: number
  }
  availableYears: number[]
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

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6']

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1a0d] border border-green-900/50 rounded-xl p-3 text-sm">
        <p className="font-medium text-white mb-2 capitalize">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} style={{ color: entry.stroke || entry.fill }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    )
  }
  return null
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportData | null>(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  const fetchReport = async (y: number) => {
    setLoading(true)
    const res = await fetch(`/api/reports?year=${y}`)
    const d = await res.json()
    setData(d)
    setLoading(false)
  }

  useEffect(() => {
    fetchReport(year)
  }, [year])

  const categoryData = data
    ? Object.entries(data.categoryBreakdown)
        .filter(([, v]) => v > 0)
        .map(([key, value], i) => ({
          name: categoryLabels[key] || key,
          value,
          fill: COLORS[i % COLORS.length],
        }))
        .sort((a, b) => b.value - a.value)
    : []

  // Monthly data formatted for chart (only show months with data)
  const chartData = data?.monthlyBreakdown.map(m => ({
    ...m,
    month: m.month.substring(0, 3),
  })) || []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Reportes</h1>
          <p className="text-gray-400 mt-1">Análisis detallado de tus finanzas</p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            className="bg-[#0d1a0d] border border-green-900/50 rounded-xl px-4 py-2.5 text-white focus:outline-none focus:border-green-500/50"
          >
            {data?.availableYears.map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-green-400 animate-pulse">Cargando reporte...</div>
        </div>
      ) : data ? (
        <>
          {/* Year Summary */}
          <div className="grid grid-cols-3 gap-4">
            <div className="glass rounded-2xl p-6">
              <p className="text-gray-400 text-sm mb-1">Ingresos {year}</p>
              <p className="text-3xl font-bold text-green-400">{formatCurrency(data.totals.income)}</p>
              <p className="text-gray-500 text-sm mt-1">Total del año</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-gray-400 text-sm mb-1">Gastos {year}</p>
              <p className="text-3xl font-bold text-red-400">{formatCurrency(data.totals.expenses)}</p>
              <p className="text-gray-500 text-sm mt-1">Total del año</p>
            </div>
            <div className="glass rounded-2xl p-6">
              <p className="text-gray-400 text-sm mb-1">Ahorros {year}</p>
              <p className={`text-3xl font-bold ${data.totals.savings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                {formatCurrency(data.totals.savings)}
              </p>
              <p className="text-gray-500 text-sm mt-1">
                {data.totals.income > 0
                  ? `${((data.totals.savings / data.totals.income) * 100).toFixed(1)}% tasa de ahorro`
                  : 'Sin ingresos registrados'}
              </p>
            </div>
          </div>

          {/* Monthly Income vs Expenses */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Evolución Mensual {year}</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(v) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{v}</span>} />
                <Bar dataKey="income" name="Ingresos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" name="Gastos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Savings Trend */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Tendencia de Ahorros {year}</h2>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1a2e1a" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="savings"
                  name="Ahorros"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  dot={{ fill: '#3b82f6', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Gastos por Categoría {year}</h2>
            {categoryData.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Sin datos de gastos para este año</p>
            ) : (
              <div className="space-y-3">
                {categoryData.map((cat, i) => {
                  const pct = data.totals.expenses > 0 ? (cat.value / data.totals.expenses) * 100 : 0
                  return (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm text-gray-300">{cat.name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-gray-400">{pct.toFixed(1)}%</span>
                          <span className="text-sm font-medium text-white">{formatCurrency(cat.value)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-green-900/20 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%`, backgroundColor: cat.fill }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Monthly Table */}
          <div className="glass rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-green-900/30">
              <h2 className="text-lg font-semibold text-white">Detalle Mensual {year}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-green-900/30">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Mes</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Ingresos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Gastos</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Ahorros</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Tasa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-green-900/20">
                  {data.monthlyBreakdown.map((row, i) => {
                    const rate = row.income > 0 ? (row.savings / row.income) * 100 : 0
                    const hasData = row.income > 0 || row.expenses > 0
                    return (
                      <tr key={i} className={`hover:bg-green-500/5 transition-all ${!hasData ? 'opacity-40' : ''}`}>
                        <td className="px-6 py-3 text-sm text-gray-300 capitalize">{row.month}</td>
                        <td className="px-6 py-3 text-sm text-right text-green-400">{formatCurrency(row.income)}</td>
                        <td className="px-6 py-3 text-sm text-right text-red-400">{formatCurrency(row.expenses)}</td>
                        <td className={`px-6 py-3 text-sm text-right font-medium ${row.savings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                          {formatCurrency(row.savings)}
                        </td>
                        <td className={`px-6 py-3 text-sm text-right ${rate >= 20 ? 'text-green-400' : rate >= 10 ? 'text-yellow-400' : row.income > 0 ? 'text-red-400' : 'text-gray-600'}`}>
                          {row.income > 0 ? `${rate.toFixed(1)}%` : '-'}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr className="border-t border-green-900/30 bg-green-500/5">
                    <td className="px-6 py-3 text-sm font-semibold text-white">TOTAL</td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-green-400">{formatCurrency(data.totals.income)}</td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-red-400">{formatCurrency(data.totals.expenses)}</td>
                    <td className={`px-6 py-3 text-sm text-right font-semibold ${data.totals.savings >= 0 ? 'text-blue-400' : 'text-red-400'}`}>
                      {formatCurrency(data.totals.savings)}
                    </td>
                    <td className="px-6 py-3 text-sm text-right font-semibold text-gray-300">
                      {data.totals.income > 0 ? `${((data.totals.savings / data.totals.income) * 100).toFixed(1)}%` : '-'}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
