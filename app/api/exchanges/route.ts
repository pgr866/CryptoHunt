import axios from 'axios';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await axios.get('https://api.coingecko.com/api/v3/exchanges/list');
    return NextResponse.json(res.data);
  } catch (error) {
    return NextResponse.json({ error: 'Error fetching exchanges' }, { status: 500 });
  }
}