"use client";

import { Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  isLoading: boolean;
  onConnect: () => void;
}

export default function DashboardHeader({ isLoading, onConnect }: Props) {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-4xl font-bold flex items-center gap-3">
          <Wallet className="w-10 h-10 text-emerald-400" />
          ArcAgent Pay
        </h1>
        <p className="text-zinc-400">Autonomous bill payments on Arc</p>
      </div>

      <Button onClick={onConnect} disabled={isLoading}>
        {isLoading ? "Connecting..." : "Connect MetaMask"}
      </Button>
    </div>
  );
}