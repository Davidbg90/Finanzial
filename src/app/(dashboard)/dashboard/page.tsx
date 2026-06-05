'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, getScoreLabel } from '@/lib/utils'
import MonthlyChart from '@/components/charts/MonthlyChart'
import ExpensePieChart from '@/components/charts/ExpensePieChart'
import Link from 'next/link'

interface DashboardData {
  summary: {
    totalIncome: number
    totalExpenses: number
    savings: number
    savingsRate: number
    totalInvestmentValue: number
    investmentReturn: number
    financialScore: number
  }
  monthlyData: Array<{
    month: string
    income: number
    expenses: number
    savings: number
  }>
  expensesByCategory: Record<string, number>
  recentExpenses: Array<{
    id: string
    description: string
    category: string
    amount: number
    date: string
  }>
  recentIncomes: Array<{
    id: string
    source: string
    description: string
    amount: number
    date: string
  }>
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

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard')
      .then(r => r.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-green-400 animate-pulse text-lg">Cargando dashboard...</div>
      </div>
    )
  }

  if (!data) {
    return <div className="text-red-400">Error al cargar datos</div>
  }

  const { summary, monthlyData, expensesByCategory, recentExpenses, recentIncomes } = data
  const scoreInfo = getScoreLabel(summary.financialScore)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard Financiero</h1>
        <p className="text-gray-400 mt-1">Tu resumen financiero personal</p>
      </div>

      {/* Financial Health Score */}
      <div className="glass rounded-2xl p-6 glow">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm mb-1">Puntuación de Salud Financiera</p>
            <div className="flex items-baseline gap-3">
              <span className="text-5xl font-bold text-gradient">{summary.financialScore}</span>
              <span className="text-gray-500">/100</span>
            </div>
            <span className={`text-sm font-medium ${scoreInfo.color}`}>{scoreInfo.label}</span>
          </div>
          <div className="w-32 h-32 relative">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1a2e1a" strokeWidth="10" />
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#22c55e"
                strokeWidth="10"
                strokeDasharray={`${summary.financialScore * 2.51} 251`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-4 pt-4 border-t border-green-900/30">
          <div className="text-center">
            <p className="text-gray-500 text-xs">Tasa de Ahorro</p>
            <p className={`font-semibold ${summary.savingsRate >= 20 ? 'text-green-400' : summary.savingsRate >= 10 ? 'text-yellow-400' : 'text-red-400'}`}>
              {summary.savingsRate.toFixed(1)}%
            </p>
          </div>
          <div className="text-center border-x border-green-900/30">
            <p className="text-gray-500 text-xs">Ratio de Gastos</p>
            <p className={`font-semibold ${summary.totalIncome > 0 ? (summary.totalExpenses / summary.totalIncome < 0.7 ? 'text-green-400' : 'text-red-400') : 'text-gray-400'}`}>
              {summary.totalIncome > 0 ? ((summary.totalExpenses / summary.totalIncome) * 100).toFixed(1) : '0'}%
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-xs">Retorno Inversiones</p>
            <p className={`font-semibold ${summary.investmentReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {summary.investmentReturn.toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="glass rounded-2xl p-5 glass-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">💵</span>
            <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">Ingresos</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalIncome)}</p>
          <p className="text-gray-500 text-sm mt-1">Total acumulado</p>
        </div>

        <div className="glass rounded-2xl p-5 glass-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">💸</span>
            <span className="text-xs text-red-400 bg-red-500/10 px-2 py-1 rounded-full">Gastos</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalExpenses)}</p>
          <p className="text-gray-500 text-sm mt-1">Total acumulado</p>
        </div>

        <div className="glass rounded-2xl p-5 glass-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">🏦</span>
            <span className={`text-xs px-2 py-1 rounded-full ${summary.savings >= 0 ? 'text-blue-400 bg-blue-500/10' : 'text-red-400 bg-red-500/10'}`}>
              Ahorros
            </span>
          </div>
          <p className={`text-2xl font-bold ${summary.savings >= 0 ? 'text-white' : 'text-red-400'}`}>
            {formatCurrency(summary.savings)}
          </p>
          <p className="text-gray-500 text-sm mt-1">Ingreso - Gastos</p>
        </div>

        <div className="glass rounded-2xl p-5 glass-hover transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-2xl">📈</span>
            <span className="text-xs text-purple-400 bg-purple-500/10 px-2 py-1 rounded-full">Inversiones</span>
          </div>
          <p className="text-2xl font-bold text-white">{formatCurrency(summary.totalInvestmentValue)}</p>
          <p className="text-gray-500 text-sm mt-1">Valor actual</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Evolución Mensual</h2>
          <MonthlyChart data={monthlyData} />
        </div>

        <div className="glass rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Gastos por Categoría</h2>
          <ExpensePieChart data={expensesByCategory} />
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Últimos Gastos</h2>
            <Link href="/expenses" className="text-sm text-green-400 hover:text-green-300">
              Ver todos →
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Sin gastos registrados</p>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between py-2 border-b border-green-900/20 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{expense.description}</p>
                    <p className="text-xs text-gray-500">{categoryLabels[expense.category] || expense.category}</p>
                  </div>
                  <span className="text-red-400 font-medium text-sm">-{formatCurrency(expense.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Últimos Ingresos</h2>
            <Link href="/income" className="text-sm text-green-400 hover:text-green-300">
              Ver todos →
            </Link>
          </div>
          {recentIncomes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-4">Sin ingresos registrados</p>
          ) : (
            <div className="space-y-3">
              {recentIncomes.map(income => (
                <div key={income.id} className="flex items-center justify-between py-2 border-b border-green-900/20 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-white">{income.description}</p>
                    <p className="text-xs text-gray-500">{income.source}</p>
                  </div>
                  <span className="text-green-400 font-medium text-sm">+{formatCurrency(income.amount)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AI Advisor CTA */}
      <div className="glass rounded-2xl p-6 border border-green-500/20 bg-gradient-to-r from-green-500/5 to-transparent">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white mb-1">🤖 Asesor Financiero IA</h2>
            <p className="text-gray-400 text-sm">
              Obtén consejos personalizados basados en tus datos financieros reales
            </p>
          </div>
          <Link
            href="/advisor"
            className="bg-green-500 hover:bg-green-400 text-black font-semibold px-6 py-3 rounded-xl transition-all duration-200 whitespace-nowrap"
          >
            Consultar Asesor
          </Link>
        </div>
      </div>
    </div>
  )
}
