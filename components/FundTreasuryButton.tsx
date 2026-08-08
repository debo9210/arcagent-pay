"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Landmark } from "lucide-react";

interface Props {
  connected: boolean;
  isLoading: boolean;
  onFund: (amount: string) => void;
}

export default function FundTreasuryButton({
  connected,
  isLoading,
  onFund,
}: Props) {
  const [amount, setAmount] = useState("1.00");

  if (!connected) return null;

  const handleClick = () => {
    const value = parseFloat(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      return;
    }
    onFund(value.toFixed(2));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-500">Fund Arc Treasury</label>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          className="h-10 w-28 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
          placeholder="1.00"
        />

        <Button
          onClick={handleClick}
          disabled={isLoading}
          variant="secondary"
          className="h-10"
        >
          <Landmark className="mr-2 h-4 w-4" />
          Fund ${parseFloat(amount || "0").toFixed(2)}
        </Button>
      </div>
    </div>
  );
}