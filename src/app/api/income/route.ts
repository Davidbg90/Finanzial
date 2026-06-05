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

    const { searchParams } = new URL(req.url)
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined

    const incomes = await prisma.income.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
      take: limit,
    })

    return NextResponse.json(incomes)
  } catch (error) {
    console.error('Get incomes error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { amount, source, description, date } = await req.json()

    if (!amount || !source || !description || !date) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const income = await prisma.income.create({
      data: {
        userId: session.user.id,
        amount: parseFloat(amount),
        source,
        description,
        date: new Date(date),
      },
    })

    return NextResponse.json(income, { status: 201 })
  } catch (error) {
    console.error('Create income error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
