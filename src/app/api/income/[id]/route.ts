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

    const income = await prisma.income.findUnique({
      where: { id: params.id },
    })

    if (!income || income.userId !== session.user.id) {
      return NextResponse.json({ error: 'No encontrado' }, { status: 404 })
    }

    await prisma.income.delete({ where: { id: params.id } })

    return NextResponse.json({ message: 'Eliminado exitosamente' })
  } catch (error) {
    console.error('Delete income error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
