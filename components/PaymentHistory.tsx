"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { History } from "lucide-react";

interface Payment {
  id: string;
  billName: string;
  amount: string;
  date: string;
  status: string;
  txHash?: string;
  explorerUrl?: string;
}

interface Props {
  payments: Payment[];
}

export default function PaymentHistory({ payments }: Props) {
  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="w-5 h-5" />
          Payment History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="text-sm text-zinc-400 text-center py-6">
            No payments yet. Pay a bill or run an agent to see history.
          </p>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-4 bg-zinc-900 rounded-xl"
              >
                <div>
                  <p className="font-medium">{payment.billName}</p>
                  <p className="text-sm text-zinc-400">{payment.date}</p>
                </div>

                <div className="text-right">
                  <p className="font-mono text-lg text-emerald-400">
                    -${payment.amount}
                  </p>

                  {payment.explorerUrl ? (
                    <a
                      href={payment.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline"
                    >
                      View tx
                    </a>
                  ) : (
                    <p className="text-xs text-zinc-500 capitalize">
                      {payment.status}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}