import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const userId = session.user.id
    const { searchParams } = new URL(req.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear().toString())

    const [expenses, incomes] = await Promise.all([
      prisma.expense.findMany({ where: { userId } }),
      prisma.income.findMany({ where: { userId } }),
    ])

    // Monthly breakdown for selected year
    const monthlyBreakdown = Array.from({ length: 12 }, (_, i) => {
      const month = new Date(year, i, 1)
      const monthEnd = new Date(year, i + 1, 0)
      const monthName = month.toLocaleString('es-ES', { month: 'long' })

      const monthExpenses = expenses
        .filter(e => {
          const d = new Date(e.date)
          return d >= month && d <= monthEnd
        })
        .reduce((sum, e) => sum + e.amount, 0)

      const monthIncome = incomes
        .filter(i => {
          const d = new Date(i.date)
          return d >= month && d <= monthEnd
        })
        .reduce((sum, i) => sum + i.amount, 0)

      return {
        month: monthName,
        monthIndex: i,
        income: monthIncome,
        expenses: monthExpenses,
        savings: monthIncome - monthExpenses,
      }
    })

    // Category breakdown for year
    const yearExpenses = expenses.filter(e => new Date(e.date).getFullYear() === year)
    const categoryBreakdown = yearExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const totalYearIncome = incomes
      .filter(i => new Date(i.date).getFullYear() === year)
      .reduce((sum, i) => sum + i.amount, 0)

    const totalYearExpenses = yearExpenses.reduce((sum, e) => sum + e.amount, 0)

    // Available years
    const allDates = [
      ...expenses.map(e => new Date(e.date).getFullYear()),
      ...incomes.map(i => new Date(i.date).getFullYear()),
    ]
    const availableYears = allDates.length > 0
      ? [...new Set(allDates)].sort((a, b) => b - a)
      : [new Date().getFullYear()]

    return NextResponse.json({
      year,
      monthlyBreakdown,
      categoryBreakdown,
      totals: {
        income: totalYearIncome,
        expenses: totalYearExpenses,
        savings: totalYearIncome - totalYearExpenses,
      },
      availableYears,
    })
  } catch (error) {
    console.error('Reports error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
