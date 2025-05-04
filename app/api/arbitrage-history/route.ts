import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import prisma from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const token = await getToken({ req })

  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const history = await prisma.arbitrageHistory.findMany({
      where: { userId: token.sub },
      orderBy: { timestamp: 'desc' },
    })

    return NextResponse.json(
      history.map(item => ({
        ...item,
        timestamp: Number(item.timestamp),
      }))
    )
  } catch (error) {
    console.error('Error fetching arbitrage history:', error)
    return NextResponse.json({ error: 'Failed to fetch arbitrage history' }, { status: 500 })
  }
}
