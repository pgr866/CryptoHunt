import axios from 'axios';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const per_page = parseInt(searchParams.get('per_page') || '50', 10);
  const page = parseInt(searchParams.get('page') || '1', 10);

  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/coins/markets', {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page,
        page,
        sparkline: true,
      },
    });

    let data = res.data;

    if (search?.trim()) {
      data = data.filter((coin: any) =>
        coin.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    const formatted = data.map((coin: any) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol,
      imageUrl: coin.image,
      current_price: coin.current_price,
      price_change_percentage_24h: parseFloat(coin.price_change_percentage_24h.toFixed(2)),
      market_cap: coin.market_cap,
      market_cap_rank: coin.market_cap_rank,
      total_volume: coin.total_volume,
      sparkline_in_7d: {
        price: coin.sparkline_in_7d?.price || [],
      },
    }));

    return NextResponse.json(formatted);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching coin data' }, { status: 500 });
  }
}
