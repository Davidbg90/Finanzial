import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(messages)
  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { message } = await req.json()

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 })
    }

    const userId = session.user.id

    // Get financial data for context
    const [expenses, incomes, investments] = await Promise.all([
      prisma.expense.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.income.findMany({ where: { userId }, orderBy: { date: 'desc' } }),
      prisma.investment.findMany({ where: { userId } }),
    ])

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0)
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0)
    const totalInvestments = investments.reduce((sum, i) => sum + i.currentValue, 0)
    const savings = totalIncome - totalExpenses
    const savingsRate = totalIncome > 0 ? (savings / totalIncome) * 100 : 0

    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount
      return acc
    }, {} as Record<string, number>)

    const financialContext = `
DATOS FINANCIEROS DEL USUARIO (${session.user.name}):

INGRESOS TOTALES: $${totalIncome.toFixed(2)}
GASTOS TOTALES: $${totalExpenses.toFixed(2)}
AHORROS: $${savings.toFixed(2)}
TASA DE AHORRO: ${savingsRate.toFixed(1)}%
INVERSIONES (valor actual): $${totalInvestments.toFixed(2)}

GASTOS POR CATEGORÍA:
${Object.entries(expensesByCategory).map(([cat, amount]) =>
  `- ${cat}: $${(amount as number).toFixed(2)} (${totalIncome > 0 ? ((amount as number / totalIncome) * 100).toFixed(1) : 0}% del ingreso)`
).join('\n')}

FUENTES DE INGRESO:
${incomes.slice(0, 10).map(i => `- ${i.source}: $${i.amount.toFixed(2)} (${new Date(i.date).toLocaleDateString('es-ES')})`).join('\n')}

INVERSIONES:
${investments.map(inv => {
  const returnPct = ((inv.currentValue - inv.initialAmount) / inv.initialAmount * 100).toFixed(1)
  return `- ${inv.name} (${inv.type}): invertido $${inv.initialAmount.toFixed(2)}, valor actual $${inv.currentValue.toFixed(2)}, retorno: ${returnPct}%`
}).join('\n')}

ÚLTIMOS GASTOS:
${expenses.slice(0, 10).map(e => `- ${e.description} (${e.category}): $${e.amount.toFixed(2)} - ${new Date(e.date).toLocaleDateString('es-ES')}`).join('\n')}
`

    // Get previous messages for context (last 10)
    const previousMessages = await prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    // Save user message
    await prisma.chatMessage.create({
      data: { userId, role: 'user', content: message },
    })

    const systemPrompt = `Eres Finanzial AI, un asesor financiero personal experto. Tienes acceso completo a los datos financieros del usuario.

${financialContext}

Tu misión es:
1. Analizar la salud financiera del usuario basándote en sus datos reales
2. Dar consejos específicos, directos y accionables en español
3. Identificar dónde puede recortar gastos y cuánto podría ahorrar
4. Sugerir oportunidades de inversión apropiadas a su perfil
5. Calcular metas de ahorro realistas
6. Dar una puntuación de salud financiera (0-100) cuando se pregunte

Sé directo, usa números concretos de sus datos, y da pasos accionables inmediatos.
Responde siempre en español. Usa emojis para hacer la respuesta más visual y amena.
Formato tu respuesta con secciones claras cuando sea apropiado.`

    const conversationMessages = [
      ...previousMessages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: conversationMessages,
    })

    const assistantMessage = response.content[0].type === 'text'
      ? response.content[0].text
      : 'Lo siento, no pude procesar tu consulta.'

    // Save assistant message
    await prisma.chatMessage.create({
      data: { userId, role: 'assistant', content: assistantMessage },
    })

    return NextResponse.json({ message: assistantMessage })
  } catch (error) {
    console.error('AI error:', error)
    return NextResponse.json({ error: 'Error al conectar con el asesor IA' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    await prisma.chatMessage.deleteMany({
      where: { userId: session.user.id },
    })

    return NextResponse.json({ message: 'Conversación limpiada' })
  } catch (error) {
    console.error('Clear chat error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
