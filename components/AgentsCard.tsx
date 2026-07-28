"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function AgentsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payment Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-zinc-400 mb-4">
          Create autonomous agents that pay your bills
        </p>
        <Button variant="outline" className="w-full" disabled>
          Coming in Phase 2
        </Button>
      </CardContent>
    </Card>
  );
}