'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AccountSettingsPage } from '@/components/account-settings';
import { PreferencesSettingsPage } from '@/components/preferences-settings';
import { UserRound, Bolt } from "lucide-react";

export default function SettingsPage() {
  const [selected, setSelected] = useState<'account' | 'preferences'>('account');

  return (
    <div className="space-y-6 px-4">
      <div className="space-y-0.5">
        <h1 className="text-xl lg:text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-md text-muted-foreground">
          Manage your account settings and customize your preferences.
        </p>
      </div>
      <Separator className="my-6" />
      <div className="flex flex-col lg:flex-row lg:space-x-4">
        <div className="flex max-lg:flex-wrap lg:flex-col lg:w-1/5 justify-start items-start h-auto mr-4 mb-6">
          <Button
            variant="ghost"
            className={`w-full flex justify-start items-center ${selected === 'account' ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline'}`}
            onClick={() => setSelected('account')}
          >
            <UserRound className="mb-[0.2rem] mr-2" />
            Account
          </Button>
          <Button
            variant="ghost"
            className={`w-full flex justify-start items-center ${selected === 'preferences' ? 'bg-muted hover:bg-muted' : 'hover:bg-transparent hover:underline'}`}
            onClick={() => setSelected('preferences')}
          >
            <Bolt className="mb-0.5 mr-2" />
            Preferences
          </Button>
        </div>
        <div className="flex-1 w-full">
          {selected === 'account' && <AccountSettingsPage />}
          {selected === 'preferences' && <PreferencesSettingsPage />}
        </div>
      </div>
    </div>
  );
}
