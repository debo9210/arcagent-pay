"use client";

import { Button } from "@/components/ui/button";
import { ArrowDownToLine } from "lucide-react";

interface Props {
  connected: boolean;
  isLoading: boolean;
  onDeposit: () => void;
}

export default function DepositButton({ connected, isLoading, onDeposit }: Props) {
  if (!connected) return null;

  return (
    <Button onClick={onDeposit} disabled={isLoading} className="mt-4">
      <ArrowDownToLine className="mr-2 h-4 w-4" />
      Deposit USDC to Unified Balance
    </Button>
  );
}