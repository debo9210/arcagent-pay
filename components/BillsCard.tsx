"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar, Send } from "lucide-react";

interface Bill {
  id: string;
  name: string;
  amount: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  nextDate: string;
  status: "active" | "paused";
  billerAddress: string;
  agentId: string;
}

interface Props {
  bills: Bill[];
  agents: { id: string; name: string }[];
  onAddBill: () => void;
  onDeleteBill: (id: string) => void;
  onPayBill: (bill: Bill) => void;
  isLoading: boolean;
}

export default function BillsCard({
  bills,
  agents,
  onAddBill,
  onDeleteBill,
  onPayBill,
  isLoading,
}: Props) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Recurring Bills
        </CardTitle>
        <Button size="sm" onClick={onAddBill}>
          <Plus className="w-4 h-4 mr-1" />
          Add Bill
        </Button>
      </CardHeader>

      <CardContent>
        {bills.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">
            No recurring bills yet.
          </p>
        ) : (
          <div className="space-y-3">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className="p-4 bg-zinc-900 rounded-xl space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{bill.name}</p>
                    <p className="text-sm text-zinc-400">
                      {bill.frequency} • Next: {bill.nextDate}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Agent: {agents.find((a) => a.id === bill.agentId)?.name || "Unassigned"}
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      To: {bill.billerAddress.slice(0, 6)}...
                      {bill.billerAddress.slice(-4)}
                    </p>
                  </div>
                  <p className="font-mono text-lg">${bill.amount}</p>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1"
                    onClick={() => onPayBill(bill)}
                    disabled={isLoading || bill.status !== "active"}
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Pay Now
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteBill(bill.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}