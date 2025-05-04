'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { Combobox } from "@/components/combobox";
import { ClockFading, Loader2 } from 'lucide-react';
import { toast } from "sonner";
import { useSession } from "next-auth/react";

export function PreferencesSettingsPage() {
  const { data: session, update } = useSession();
  const timezones = ["UTC", ...Intl.supportedValuesOf("timeZone")].map((tz) => ({ name: tz }));
  const [selectedTimezone, setSelectedTimezone] = useState(session?.user.timezone || "UTC");
  const [isLoading, setIsLoading] = useState(false);

  const handleUpdateTimezone = async () => {
    try {
      setIsLoading(true);
      if (!session?.user?.id) {
        toast("User ID is missing");
        return;
      }
      const response = await fetch('/api/update-user', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: session.user.id,
          timezone: selectedTimezone,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        update({ user: { ...session.user, timezone: selectedTimezone } });
        toast("Preferences updated successfully");
      } else {
        const data = await response.json();
        toast("Failed to update preferences", { description: data.message });
      }
    } catch (error) {
      toast("Failed to update preferences", { description: error.message || "An error occurred." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-lg font-medium">Preferences</h3>
        <p className="text-sm text-muted-foreground">Set your preferred timezone.</p>
      </div>
      <Separator />
      <div>
        <div className="flex items-center mb-2">
          <Label>Timezone</Label>
        </div>
        <Combobox 
          value={selectedTimezone} 
          values={timezones} 
          variant={"outline"} 
          size={"default"} 
          width={"300px"} 
          placeholder={"Timezone"} 
          onChange={(value) => setSelectedTimezone(value)} 
          icon={<ClockFading />} 
        />
        <p className="text-sm text-muted-foreground">Select the timezone you want to use across the platform.</p>
      </div>

      <Button onClick={handleUpdateTimezone} disabled={isLoading}>
        {isLoading ? (
          <><Loader2 className="animate-spin mr-2" />Loading...</>
        ) : (
          "Update preferences"
        )}
      </Button>
    </div>
  );
}
