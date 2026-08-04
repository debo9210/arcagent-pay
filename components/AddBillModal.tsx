"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Agent {
  id: string;
  name: string;
}

interface Props {
  open: boolean;
  agents: Agent[];
  onClose: () => void;
  onAdd: (bill: {
    name: string;
    amount: string;
    frequency: "Daily" | "Weekly" | "Monthly";
    nextDate: string;
    billerAddress: string;
    agentId: string;
  }) => void;
}

export default function AddBillModal({ open, agents, onClose, onAdd }: Props) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("0.10");
  const [frequency, setFrequency] = useState<"Daily" | "Weekly" | "Monthly">("Monthly");
  const [nextDate, setNextDate] = useState("");
  const [billerAddress, setBillerAddress] = useState("");
  const [agentId, setAgentId] = useState(agents[0]?.id || "");

  if (!open) return null;

  const handleSubmit = () => {
    if (!name || !amount || !nextDate || !billerAddress || !agentId) {
      return;
    }

    onAdd({ name, amount, frequency, nextDate, billerAddress, agentId });

    setName("");
    setAmount("0.10");
    setFrequency("Monthly");
    setNextDate("");
    setBillerAddress("");
    setAgentId(agents[0]?.id || "");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Add Recurring Bill</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Bill Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Electricity, Netflix, Rent..."
            />
          </div>

          <div>
            <Label>Amount (USDC)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.10"
            />
          </div>

          <div>
            <Label>Frequency</Label>
            <select
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2"
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
            >
              <option value="Daily">Daily</option>
              <option value="Weekly">Weekly</option>
              <option value="Monthly">Monthly</option>
            </select>
          </div>

          <div>
            <Label>Next Payment Date</Label>
            <Input
              type="date"
              value={nextDate}
              onChange={(e) => setNextDate(e.target.value)}
            />
          </div>

          <div>
            <Label>Biller Address</Label>
            <Input
              value={billerAddress}
              onChange={(e) => setBillerAddress(e.target.value)}
              placeholder="0x..."
            />
          </div>

          <div>
            <Label>Assign to Agent</Label>
            <select
              className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2"
              value={agentId}
              onChange={(e) => setAgentId(e.target.value)}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button className="flex-1" onClick={handleSubmit}>
              Add Bill
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