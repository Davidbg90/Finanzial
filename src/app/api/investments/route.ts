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

    const investments = await prisma.investment.findMany({
      where: { userId: session.user.id },
      orderBy: { date: 'desc' },
    })

    return NextResponse.json(investments)
  } catch (error) {
    console.error('Get investments error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const { name, type, initialAmount, currentValue, date } = await req.json()

    if (!name || !type || !initialAmount || !currentValue || !date) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    const investment = await prisma.investment.create({
      data: {
        userId: session.user.id,
        name,
        type,
        initialAmount: parseFloat(initialAmount),
        currentValue: parseFloat(currentValue),
        date: new Date(date),
      },
    })

    return NextResponse.json(investment, { status: 201 })
  } catch (error) {
    console.error('Create investment error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
