"use client";

import { Button } from "@/components/ui/button";
import { Wallet, LogOut } from "lucide-react";

interface Props {
  isLoading: boolean;
  connected: boolean;
  address: string;
  onConnect: () => void;
  onDisconnect: () => void;
}

export default function DashboardHeader({
  isLoading,
  connected,
  address,
  onConnect,
  onDisconnect,
}: Props) {
  const shortAddress =
    address && address.length > 10
      ? `${address.slice(0, 6)}...${address.slice(-4)}`
      : address;

  return (
    <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          ArcAgent Pay
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Autonomous USDC bill payments on Arc
        </p>
      </div>

      <div className="flex items-center gap-2">
        {connected ? (
          <>
            <div className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span className="font-mono text-sm text-zinc-200">
                {shortAddress}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onDisconnect}
              disabled={isLoading}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Disconnect
            </Button>
          </>
        ) : (
          <Button onClick={onConnect} disabled={isLoading}>
            <Wallet className="mr-2 h-4 w-4" />
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        )}
      </div>
    </header>
  );
}