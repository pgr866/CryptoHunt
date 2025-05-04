import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from '@/lib/prisma'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const token = await getToken({ req })

  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = params

  try {
    const existing = await prisma.arbitrageHistory.findUnique({
      where: { id },
    })

    if (!existing || existing.userId !== token.sub) {
      return NextResponse.json({ error: 'Not found or forbidden' }, { status: 404 })
    }

    await prisma.arbitrageHistory.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting arbitrage history:', error)
    return NextResponse.json({ error: 'Failed to delete entry' }, { status: 500 })
  }
}
