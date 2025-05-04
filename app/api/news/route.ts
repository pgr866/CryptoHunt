import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = Number(url.searchParams.get('page')) || 1;
  const pageSize = 15;
  const skip = (page - 1) * pageSize;

  try {
    const articles = await prisma.news.findMany({
      skip,
      take: pageSize,
      orderBy: {
        publishedAt: 'desc',
      },
    });

    return NextResponse.json(articles);
  } catch (error) {
    console.error('Error fetching news:', error);
    return NextResponse.json({ error: 'Error fetching news' }, { status: 500 });
  }
}
