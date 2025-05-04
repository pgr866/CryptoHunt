'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ThemeToggle } from '@/components/theme-toggle';
import ArbitragePage from '@/components/arbitrage';
import NewsPage from '@/components/news';
import PricesPage from '@/components/prices';
import SettingsPage from '@/components/settings';
import {
  ChartNoAxesCombined,
  Coins,
  Newspaper,
  UserRound,
  LogOut,
  Settings as SettingsIcon,
} from 'lucide-react';
import { toast } from 'sonner';

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'authenticated' && !session?.user) {
      router.push('/signin');
    }
  }, [status, session, router]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/signin');
    toast('Logged out successfully');
  };

  if (status === 'loading') return <p className="p-4">Loading...</p>;

  return (
    <Tabs defaultValue="news" className="h-auto">
      <div className="flex flex-wrap items-center h-auto px-4 py-1 border-b">
        <div className="flex gap-2">
          <img src="/logo.svg" alt="Logo" className="size-8" />
          <h1 className="text-2xl">CryptoHunt</h1>
        </div>
        <TabsList className="flex flex-wrap h-auto mx-auto bg-transparent gap-1">
        <TabsTrigger className="px-2 md:px-4" value="news">
            <Newspaper size={18} className="mr-1" />News
          </TabsTrigger>
          <TabsTrigger className="px-2 md:px-4" value="prices">
            <ChartNoAxesCombined size={18} className="mr-1" />Prices
          </TabsTrigger>
          <TabsTrigger className="px-2 md:px-4" value="arbitrage">
            <Coins size={18} className="mr-1" />Arbitrage
          </TabsTrigger>
        </TabsList>
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative size-10">
                <UserRound />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {session?.user?.username || 'Loading...'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {session?.user?.email || 'Loading...'}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-0">
                <TabsList className="h-auto p-0 bg-transparent w-full">
                  <TabsTrigger
                    className="px-2 py-1.5 w-full text-foreground font-normal gap-2 justify-start"
                    value="settings"
                  >
                    <SettingsIcon />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <ThemeToggle />
        </div>
      </div>
      <TabsContent className="py-2 sm:px-4" value="prices">
        <PricesPage />
      </TabsContent>
      <TabsContent className="py-2 sm:px-4" value="arbitrage">
        <ArbitragePage />
      </TabsContent>
      <TabsContent className="py-2 sm:px-4" value="news">
        <NewsPage />
      </TabsContent>
      <TabsContent className="py-2 sm:px-4" value="settings">
        <SettingsPage />
      </TabsContent>
    </Tabs>
  );
}
