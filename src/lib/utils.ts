export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function getMonthName(month: number): string {
  const months = [
    'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun',
    'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic',
  ]
  return months[month]
}

export function calculateFinancialScore(
  totalIncome: number,
  totalExpenses: number,
  totalInvestments: number,
  savingsRate: number
): number {
  if (totalIncome === 0) return 0

  let score = 0

  // Savings rate (max 40 points)
  if (savingsRate >= 20) score += 40
  else if (savingsRate >= 10) score += 25
  else if (savingsRate >= 5) score += 15
  else if (savingsRate > 0) score += 5

  // Expense ratio (max 30 points)
  const expenseRatio = totalExpenses / totalIncome
  if (expenseRatio <= 0.5) score += 30
  else if (expenseRatio <= 0.7) score += 20
  else if (expenseRatio <= 0.9) score += 10
  else score += 0

  // Investment ratio (max 30 points)
  const investmentRatio = totalInvestments / totalIncome
  if (investmentRatio >= 0.2) score += 30
  else if (investmentRatio >= 0.1) score += 20
  else if (investmentRatio >= 0.05) score += 10
  else score += 0

  return Math.min(100, score)
}

export function getScoreLabel(score: number): { label: string; color: string } {
  if (score >= 80) return { label: 'Excelente', color: 'text-green-400' }
  if (score >= 60) return { label: 'Bueno', color: 'text-blue-400' }
  if (score >= 40) return { label: 'Regular', color: 'text-yellow-400' }
  return { label: 'Necesita Mejora', color: 'text-red-400' }
}

export const EXPENSE_CATEGORIES = [
  { value: 'food', label: 'Alimentación', icon: '🍔' },
  { value: 'transport', label: 'Transporte', icon: '🚗' },
  { value: 'housing', label: 'Vivienda', icon: '🏠' },
  { value: 'entertainment', label: 'Entretenimiento', icon: '🎬' },
  { value: 'health', label: 'Salud', icon: '❤️' },
  { value: 'education', label: 'Educación', icon: '📚' },
  { value: 'other', label: 'Otros', icon: '📦' },
]

export const INVESTMENT_TYPES = [
  { value: 'stocks', label: 'Acciones', icon: '📈' },
  { value: 'crypto', label: 'Criptomonedas', icon: '₿' },
  { value: 'real_estate', label: 'Inmuebles', icon: '🏢' },
  { value: 'funds', label: 'Fondos', icon: '💼' },
  { value: 'bonds', label: 'Bonos', icon: '📋' },
  { value: 'other', label: 'Otros', icon: '💰' },
]

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}
