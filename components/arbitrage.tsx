'use client';

import * as React from 'react';
import axios from 'axios';
import { useSession } from 'next-auth/react'
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Combobox } from "@/components/combobox";
import { Button } from "@/components/ui/button";
import { toast } from 'sonner';
import { getTimezoneOffset } from 'date-fns-tz';
import { MoveRight, Trash } from "lucide-react";

type Coin = {
  id: string;
  name: string;
  symbol: string;
  imageUrl: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  market_cap_rank?: number;
  total_volume?: number;
  sparkline_in_7d?: {
    price: number[];
  };
};

type ArbitrageData = {
  id: string;
  coinName: string;
  lowestExchange: string;
  lowestPrice: number;
  lowestTradeUrl: string;
  lowestLogo: string;
  highestExchange: string;
  highestPrice: number;
  highestTradeUrl: string;
  highestLogo: string;
  priceDifference: number;
  percentageDifference: number;
  timestamp: number;
};

export default function ArbitragePage() {
  const { data: session } = useSession()
  const timezone = session?.user?.timezone
  const [coins, setCoins] = React.useState<Coin[]>([]);
  const [selectedCoin, setSelectedCoin] = React.useState<Coin>({
    name: 'Bitcoin',
    id: 'bitcoin',
    imageUrl: 'https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png',
  } as Coin);
  const [searchedCoin, setSearchedCoin] = React.useState<Coin | null>(null);
  const [arbitrage, setArbitrage] = React.useState<ArbitrageData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [history, setHistory] = React.useState<ArbitrageData[]>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [historyRes, coinsRes] = await Promise.all([
          axios.get('http://localhost:3000/api/arbitrage-history'),
          axios.get('http://localhost:3000/api/coins', {
            params: { per_page: 100, page: 1 },
          }),
        ]);

        setHistory(historyRes.data);
        setCoins(coinsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  const fetchArbitrage = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`http://localhost:3000/api/arbitrage?id=${selectedCoin.id}`);
      const arbitrageData: ArbitrageData = res.data;
      setArbitrage(arbitrageData);
      setSearchedCoin(selectedCoin);

      setHistory((prevHistory) => [arbitrageData, ...prevHistory]);
    } catch (err) {
      console.error('Error fetching arbitrage data:', err);
    }
    setLoading(false);
  };

  const onDeleteArbitrage = async (id: string) => {
    setLoading(true);
    try {
      await axios.delete(`/api/arbitrage-history/${id}`);
      setHistory((prev) => prev.filter((item) => item.id !== id));
      toast('Arbitrage history deleted successfully');
    } catch (err) {
      console.error('Error deleting arbitrage history:', err);
    } finally {
      setLoading(false);
    }
  };  

  return (
    <div className="flex flex-col items-center min-h-screen pt-4">
      <div className="flex items-center space-x-4 mb-8">
        <Combobox
          value={selectedCoin.name}
          values={coins ?? []}
          variant="outline"
          size="default"
          width="300px"
          placeholder="Coins"
          onChange={(value) => setSelectedCoin(coins.find((c) => c.name === value)!)}
          icon={<img src={selectedCoin.imageUrl} className="size-5" />}
        />
        <Button onClick={fetchArbitrage} disabled={loading}>
          Calculate
        </Button>
      </div>

      {arbitrage && (
        <div className="flex items-center space-x-12 mb-4">
          {/* Lowest Exchange */}
          <div className="flex flex-col items-center">
            <img src={arbitrage.lowestLogo} alt={arbitrage.lowestExchange} className="w-20 h-20 mb-2" />
            <div className="text-xl font-semibold">{arbitrage.lowestExchange}</div>
            <a
              href={arbitrage.lowestTradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline mt-2 text-lg"
            >
              Go to trade
            </a>
            <div className="text-2xl mt-2">Price: <strong>${arbitrage.lowestPrice}</strong></div>
          </div>

          {/* Arrow and Difference */}
          <div className="flex flex-col items-center text-center px-4">
            <strong>{searchedCoin?.name}</strong>
            <img
              src={searchedCoin?.imageUrl}
              alt={searchedCoin?.name}
              className="size-16 mt-2"
            />
            <MoveRight className="size-16" />
            <div
              className={`text-4xl font-bold mb-1 ${arbitrage.percentageDifference > 1
                ? 'text-green-500'
                : arbitrage.percentageDifference >= 0.2
                  ? 'text-yellow-400'
                  : 'text-red-500'
                }`}
            >
              {arbitrage.percentageDifference}%
            </div>
            <div className="text-md mb-2">Difference: ${arbitrage.priceDifference}</div>
          </div>

          {/* Highest Exchange */}
          <div className="flex flex-col items-center">
            <img src={arbitrage.highestLogo} alt={arbitrage.highestExchange} className="w-20 h-20 mb-2" />
            <div className="text-xl font-semibold">{arbitrage.highestExchange}</div>
            <a
              href={arbitrage.highestTradeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline mt-2 text-lg"
            >
              Go to trade
            </a>
            <div className="text-2xl mt-2">Price: <strong>${arbitrage.highestPrice}</strong></div>
          </div>
        </div>
      )}

      {/* History Section */}
      {history.length > 0 && (
        <div className="w-full max-w-7xl px-4">
          <h2 className="text-2xl font-bold mb-6">Arbitrage History</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {history.map((item, idx) => (
              <Card key={idx} className="gap-4">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="text-sm">{new Date(((new Date(item.timestamp)).getTime() + getTimezoneOffset(timezone, new Date(item.timestamp)))).toLocaleString('en-GB', { timeZone: 'UTC' })}</div>
                    <Button variant="ghost" onClick={() => onDeleteArbitrage(item.id)} disabled={loading}>
                      <Trash className="size-5 text-destructive" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex flex-col items-center text-sm">
                      <img src={item.lowestLogo} className="w-10 h-10 mb-1" />
                      <div>{item.lowestExchange}</div>
                      <div className="font-bold">${item.lowestPrice}</div>
                    </div>
                    <div className="flex flex-col gap-2 w-full items-center">
                      <strong className="text-sm">{item.coinName}</strong>
                      <img
                        src={coins.find((c) => c.name === item.coinName).imageUrl}
                        alt={item.coinName}
                        className="size-8"
                      />
                      <MoveRight className="size-8" />
                    </div>
                    <div className="flex flex-col items-center text-sm">
                      <img src={item.highestLogo} className="w-10 h-10 mb-1" />
                      <div>{item.highestExchange}</div>
                      <div className="font-bold">${item.highestPrice}</div>
                    </div>
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-xl font-bold ${item.percentageDifference > 1
                        ? 'text-green-500'
                        : item.percentageDifference >= 0.2
                          ? 'text-yellow-400'
                          : 'text-red-500'
                        }`}
                    >
                      {item.percentageDifference}%
                    </div>
                    <div className="text-sm">Diff: ${item.priceDifference}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
