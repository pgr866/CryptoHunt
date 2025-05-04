import axios from 'axios'
import { NextRequest, NextResponse } from 'next/server'
import prisma from "@/lib/prisma"
import { getToken } from 'next-auth/jwt'

export async function POST(req: NextRequest) {
  const token = await getToken({ req })

  if (!token?.sub) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const userId = token.sub
  const { searchParams } = new URL(req.url)
  const coinId = searchParams.get('id')

  if (!coinId) {
    return NextResponse.json({ error: 'Missing coin id' }, { status: 400 })
  }

  try {
    const res = await axios.get(`https://api.coingecko.com/api/v3/coins/${coinId}/tickers`, {
      params: {
        include_exchange_logo: true,
      },
    })

    const tickers = res.data.tickers

    if (!tickers || tickers.length === 0) {
      return NextResponse.json({ error: 'No tickers found' }, { status: 404 })
    }

    const usdtTickers = tickers.filter(
      (t: any) => t.target === 'USDT' && t.last && t.market?.name
    )

    if (usdtTickers.length === 0) {
      return NextResponse.json({ error: 'No USDT tickers found' }, { status: 404 })
    }

    const sorted = usdtTickers.sort((a, b) => a.last - b.last)

    const lowest = sorted[0]
    const highest = sorted[sorted.length - 1]

    const result = {
      coinName: res.data.name,
      lowestExchange: lowest.market.name,
      lowestPrice: lowest.last,
      lowestTradeUrl: lowest.trade_url,
      lowestLogo: lowest.market.logo,
      highestExchange: highest.market.name,
      highestPrice: highest.last,
      highestTradeUrl: highest.trade_url,
      highestLogo: highest.market.logo,
      priceDifference: parseFloat((highest.last - lowest.last).toFixed(2)),
      percentageDifference: parseFloat(((highest.last - lowest.last) / lowest.last * 100).toFixed(2)),
    }

    const timestamp = Date.now()

    const newHistory = await prisma.arbitrageHistory.create({
      data: {
        userId,
        timestamp,
        ...result,
      },
    })

    return NextResponse.json({
      ...newHistory,
      timestamp: Number(newHistory.timestamp),
    })
  } catch (error) {
    console.error('Error fetching data:', error)
    return NextResponse.json({ error: 'Error fetching arbitrage data' }, { status: 500 })
  }
}
