"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BillsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recurring Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-400 mb-4">
          Set up daily, weekly or monthly payments
        </p>
        <Button variant="outline" className="w-full" disabled>
          Coming in Phase 2
        </Button>
      </CardContent>
    </Card>
  );
}