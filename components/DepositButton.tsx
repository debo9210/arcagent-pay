"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const CHAINS = [
  { id: "Base_Sepolia", label: "Base Sepolia" },
  { id: "Ethereum_Sepolia", label: "Ethereum Sepolia" },
  { id: "Arbitrum_Sepolia", label: "Arbitrum Sepolia" },
  { id: "Arc_Testnet", label: "Arc Testnet" },
] as const;

interface Props {
  connected: boolean;
  isLoading: boolean;
  onDeposit: (chain: string, amount?: string) => void;
}

export default function DepositButton({
  connected,
  isLoading,
  onDeposit,
}: Props) {
  const [chain, setChain] = useState<string>("Base_Sepolia");

  if (!connected) return null;

  const selectedLabel =
    CHAINS.find((c) => c.id === chain)?.label || chain;

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={chain}
        onChange={(e) => setChain(e.target.value)}
        className="h-10 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
        disabled={isLoading}
      >
        {CHAINS.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </select>

      <Button
        disabled={isLoading}
        onClick={() => onDeposit(chain, "5.00")}
      >
        Deposit $5 from {selectedLabel}
      </Button>
    </div>
  );
}