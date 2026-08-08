"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

const CHAINS = [
  { id: "Base_Sepolia", label: "Base Sepolia" },
  { id: "Ethereum_Sepolia", label: "Ethereum Sepolia" },
  { id: "Arc_Testnet", label: "Arc Testnet" },
] as const;

interface Props {
  connected: boolean;
  isLoading: boolean;
  onDeposit: (chain: string, amount: string) => void;
}

export default function DepositButton({
  connected,
  isLoading,
  onDeposit,
}: Props) {
  const [chain, setChain] = useState<string>("Base_Sepolia");
  const [amount, setAmount] = useState("5.00");

  if (!connected) return null;

  const selectedLabel =
    CHAINS.find((c) => c.id === chain)?.label || chain;

  const handleClick = () => {
    const value = parseFloat(amount);
    if (!amount || Number.isNaN(value) || value <= 0) {
      return;
    }
    onDeposit(chain, value.toFixed(2));
  };

  return (
    <div className="flex flex-col gap-2">
      <label className="text-xs text-zinc-500">Deposit to Unified Balance</label>
      <div className="flex flex-wrap items-center gap-2">
        <select
          value={chain}
          onChange={(e) => setChain(e.target.value)}
          className="h-10 min-w-[160px] rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
          disabled={isLoading}
        >
          {CHAINS.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>

        <input
          type="number"
          min="0.01"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          disabled={isLoading}
          className="h-10 w-28 rounded-md border border-zinc-700 bg-zinc-900 px-3 text-sm text-zinc-100"
          placeholder="5.00"
        />

        <Button disabled={isLoading} onClick={handleClick} className="h-10">
          Deposit ${parseFloat(amount || "0").toFixed(2)} from {selectedLabel}
        </Button>
      </div>
    </div>
  );
}