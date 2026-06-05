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

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    })

    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await prisma.expense.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Eliminado exitosamente' })
  } catch (error) {
    console.error('Delete expense error:', error)
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

    const expense = await prisma.expense.findUnique({
      where: { id: params.id },
    })

    if (!expense || expense.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    const { amount, category, description, date } = await req.json()

    const updated = await prisma.expense.update({
      where: { id: params.id },
      data: {
        amount: parseFloat(amount),
        category,
        description,
        date: new Date(date),
      },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update expense error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
