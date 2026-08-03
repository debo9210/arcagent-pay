"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Agent {
  id: string;
  name: string;
  status: "active" | "paused";
  monthlyLimit: string;
  maxPerPayment: string;
  spentThisMonth: string;
}

interface Props {
  open: boolean;
  agent: Agent | null;
  onClose: () => void;
  onSave: (agent: Agent) => void;
}

export default function EditAgentModal({ open, agent, onClose, onSave }: Props) {
  const [name, setName] = useState("");
  const [monthlyLimit, setMonthlyLimit] = useState("");
  const [maxPerPayment, setMaxPerPayment] = useState("");

  useEffect(() => {
    if (agent) {
      setName(agent.name);
      setMonthlyLimit(agent.monthlyLimit);
      setMaxPerPayment(agent.maxPerPayment);
    }
  }, [agent]);

  if (!open || !agent) return null;

  const handleSave = () => {
    onSave({
      ...agent,
      name,
      monthlyLimit,
      maxPerPayment,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Edit Agent</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div>
            <Label>Monthly Limit (USDC)</Label>
            <Input
              type="number"
              value={monthlyLimit}
              onChange={(e) => setMonthlyLimit(e.target.value)}
            />
          </div>

          <div>
            <Label>Max Per Payment (USDC)</Label>
            <Input
              type="number"
              value={maxPerPayment}
              onChange={(e) => setMaxPerPayment(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSave}>
              Save
            </Button>
            <Button variant="outline" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}