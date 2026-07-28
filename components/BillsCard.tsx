"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Calendar } from "lucide-react";

interface Bill {
  id: string;
  name: string;
  amount: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  nextDate: string;
  status: "active" | "paused";
}

interface Props {
  bills: Bill[];
  onAddBill: () => void;
  onDeleteBill: (id: string) => void;
}

export default function BillsCard({ bills, onAddBill, onDeleteBill }: Props) {
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
                className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl"
              >
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-sm text-zinc-400">
                    {bill.frequency} • Next: {bill.nextDate}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="font-mono text-lg">${bill.amount}</p>
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