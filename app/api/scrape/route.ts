import { NextResponse } from 'next/server';
import axios from 'axios';
import * as cheerio from 'cheerio';
import prisma from "@/lib/prisma";

export async function POST() {
  try {
    const { data: html } = await axios.get('https://cointelegraph.com/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
      },
    });

    const $ = cheerio.load(html);

    const scrapePromises = $('article.post-card__article').map(async (_, el) => {
      const title = $(el).find('span[data-testid="post-card-title"]').text().trim();
      const author = $(el).find('a[data-testid="post-card-author-link"] span').text().trim();
      const time = $(el).find('time[data-testid="post-card-published-date"]').text().trim();
      const relativeUrl = $(el).find('a[data-testid="post-cad__link"]').attr('href');
      const url = relativeUrl ? `https://cointelegraph.com${relativeUrl}` : '';
      let imageUrl = '';
      let publishedAt: Date | null = null;

      if (time) {
        publishedAt = parseRelativeDate(time);
      }

      if (url) {
        try {
          const { data: articleHtml } = await axios.get(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
          });

          const $detail = cheerio.load(articleHtml);
          imageUrl = $detail('picture img').first().attr('src') || '';
        } catch (err) {
          console.error('Error fetching image:', url, err);
        }

        const existingNews = await prisma.news.findUnique({
          where: { url },
        });

        if (existingNews) {
          return;
        }

        await prisma.news.create({
          data: {
            title,
            author,
            url,
            imageUrl,
            publishedAt,
          },
        });
      }
    }).get();

    await Promise.all(scrapePromises);

    return NextResponse.json({ message: 'Scraping completado' });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Error scraping Cointelegraph' }, { status: 500 });
  }
}

function parseRelativeDate(timeString: string): Date | null {
  const now = new Date();

  if (timeString.includes('minute')) {
    const minutes = parseInt(timeString.split(' ')[0], 10);
    return new Date(now.getTime() - minutes * 60000);
  }

  if (timeString.includes('hour')) {
    const hours = parseInt(timeString.split(' ')[0], 10);
    return new Date(now.getTime() - hours * 3600000);
  }

  if (timeString.match(/\b\w{3}\s\d{1,2},\s\d{4}\b/)) {
    return new Date(timeString);
  }

  return null;
}
