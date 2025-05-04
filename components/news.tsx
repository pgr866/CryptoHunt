'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { formatDistanceToNowStrict, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';

interface Article {
  title: string;
  author: string;
  time: string;
  url: string;
  imageUrl: string;
  publishedAt: string;
}

export default function NewsPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchArticles = async (pageToFetch: number) => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await axios.get(`/api/news?page=${pageToFetch}`);
      const data = res.data;

      if (res.status === 200) {
        if (data.length > 0) {
          setArticles((prevArticles) => {
            const uniqueArticles = [
              ...prevArticles,
              ...data.filter((newArticle: Article) =>
                !prevArticles.some((existingArticle) => existingArticle.url === newArticle.url)
              ),
            ];
            return uniqueArticles;
          });

          if (data.length < 10) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } else {
        console.error('Error fetching news:', data.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Error loading news:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(page);
  }, [page]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 200
      ) {
        if (!loading && hasMore) {
          setPage((prevPage) => prevPage + 1);
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [loading, hasMore]);

  const formatDate = (date: string) => {
    const parsedDate = parseISO(date);
    return formatDistanceToNowStrict(parsedDate, { addSuffix: true, locale: enUS });
  };

  if (loading && page === 1 && articles.length === 0) {
    return <div className="p-4 text-lg text-center">Loading news...</div>;
  }

  return (
    <div className="px-16 py-2">
      <div className="flex flex-wrap gap-8 justify-center">
        {articles.map((article, index) => (
          <Card key={index} className="py-0 w-full sm:w-[380px] rounded-xl overflow-hidden bg-secondary">
            <div className="relative min-h-[245px]">
              <a href={article.url} target="_blank" rel="noopener noreferrer">
                <img
                  src={article.imageUrl ? article.imageUrl : '/logo.svg'}
                  alt={article.title}
                  className="w-full h-auto max-h-[245px]"
                />
              </a>
            </div>
            <CardContent className="flex flex-col justify-between flex-1 gap-4">
              <h4>
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-gray-900 dark:text-white"
                >
                  {article.title}
                </a>
              </h4>
              <div className="flex justify-between mb-2">
                <p>by {article.author || 'Unknown'}</p>
                <p>{formatDate(article.publishedAt)}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {loading && page > 1 && hasMore && <div className="p-4 text-lg">Loading more news...</div>}
    </div>
  );
}
