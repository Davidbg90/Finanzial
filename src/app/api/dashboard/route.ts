import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { calculateFinancialScore } from '@/lib/utils'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id

    // Get all data
    const [expenses, incomes, investments] = await Promise.all([
      prisma.expense.findMany({ where: { userId } }),
      prisma.income.findMany({ where: { userId } }),
      prisma.investment.findMany({ where: { userId } }),
    ])

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalInvestmentValue = investments.reduce((sum, i) => sum + i.currentValue, 0)
    const totalInitialInvestment = investments.reduce((sum, i) => sum + i.initialAmount, 0)
    const savings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0
    const investmentReturn = totalInitialInvestment > 0
      ? ((totalInvestmentValue - totalInitialInvestment) / totalInitialInvestment) * 100
      : 0

    const financialScore = calculateFinancialScore(
      totalIncome,
      totalExpenses,
      totalInvestmentValue,
      savingsRate
    )

    // Monthly data for the past 6 months
    const now = new Date()
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const month = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      const monthName = month.toLocaleString('es-ES', { month: 'short' })

      const monthExpenses = expenses
        .filter(e => new Date(e.date) >= month && new Date(e.date) <= monthEnd)
        .reduce((sum, e) => sum + e.amount, 0)

      const monthIncome = incomes
        .filter(i => new Date(i.date) >= month && new Date(i.date) <= monthEnd)
        .reduce((sum, i) => sum + i.amount, 0)

      monthlyData.push({
        month: monthName,
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses,
      })
    }

    // Expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      summary: {
        totalIncome,
        totalExpenses,
        savings,
        savingsRate,
        totalInvestmentValue,
        investmentReturn,
        financialScore,
      },
      monthlyData,
      expensesByCategory,
      recentExpenses: expenses.slice(0, 5),
      recentIncomes: incomes.slice(0, 5),
    })
  } catch (error) {
    console.error('Dashboard error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
