"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  balance: string;
  address: string;
  connected: boolean;
}

export default function BalanceCard({ balance, address, connected }: Props) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Unified Balance (USDC)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-6xl font-bold text-emerald-400">
          ${parseFloat(balance || "0").toFixed(2)}
        </div>
        <p className="text-zinc-400 mt-2">
          {connected
            ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
            : "Connect a wallet to begin"}
        </p>
      </CardContent>
    </Card>
  );
}