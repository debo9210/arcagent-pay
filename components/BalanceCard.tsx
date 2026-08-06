"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface Props {
  balance: string;
  treasuryBalance: string;
  address: string;
  connected: boolean;
  treasuryAddress?: string;
}

export default function BalanceCard({
  balance,
  treasuryBalance,
  address,
  connected,
  treasuryAddress,
}: Props) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!treasuryAddress) return;
    await navigator.clipboard.writeText(treasuryAddress);
    setCopied(true);
    toast.success("Treasury address copied");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Unified Balance (USDC)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-emerald-400">
            ${parseFloat(balance || "0").toFixed(2)}
          </div>
          <p className="text-zinc-400 mt-2">
            {connected
              ? `Connected: ${address.slice(0, 6)}...${address.slice(-4)}`
              : "Connect a wallet to begin"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Agent Treasury (USDC)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-5xl font-bold text-blue-400">
            ${parseFloat(treasuryBalance || "0").toFixed(2)}
          </div>
          <p className="text-zinc-400 mt-2">
            Shared funds used by autonomous agents
          </p>

          {treasuryAddress && (
            <div className="mt-4 flex items-center gap-2">
              <code className="text-xs text-zinc-300 bg-zinc-900 px-2 py-1 rounded truncate max-w-[220px]">
                {treasuryAddress.slice(0, 8)}...{treasuryAddress.slice(-6)}
              </code>
              <Button size="sm" variant="outline" onClick={handleCopy}>
                {copied ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}