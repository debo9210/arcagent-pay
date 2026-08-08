"use client";

import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";

interface Props {
  connected: boolean;
  isLoading: boolean;
  onFund: () => void;
}

export default function FundTreasuryButton({
  connected,
  isLoading,
  onFund,
}: Props) {
  if (!connected) return null;

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-500">Agent treasury</label>
      <Button
        onClick={onFund}
        disabled={isLoading}
        variant="secondary"
        className="h-10"
      >
        <Landmark className="mr-2 h-4 w-4" />
        Fund Arc Treasury ($1)
      </Button>
    </div>
  );
}