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
    <Button onClick={onFund} disabled={isLoading} className="mt-4 ml-3">
      <Landmark className="mr-2 h-4 w-4" />
      Fund Agent Treasury ($5)
    </Button>
  );
}