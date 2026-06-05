import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const investment = await prisma.investment.findUnique({
      where: { id: params.id },
    })

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await prisma.investment.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Eliminado exitosamente' })
  } catch (error) {
    console.error('Delete investment error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const investment = await prisma.investment.findUnique({
      where: { id: params.id },
    })

    if (!investment || investment.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const { name, type, initialAmount, currentValue, date } = await req.json()

    const updated = await prisma.investment.update({
      where: { id: params.id },
      data: {
        name,
        type,
        initialAmount: parseFloat(initialAmount),
        currentValue: parseFloat(currentValue),
        date: new Date(date),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update investment error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
