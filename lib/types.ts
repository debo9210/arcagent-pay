export interface Agent {
  id: string;
  name: string;
  status: "active" | "paused";
  monthlyLimit: string;
  maxPerPayment: string;
  spentThisMonth: string;
}

export interface Bill {
  id: string;
  name: string;
  amount: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  nextDate: string;
  status: "active" | "paused";
  billerAddress: string;
  agentId: string;
}

export interface Payment {
  id: string;
  billName: string;
  amount: string;
  date: string;
  status: string;
  txHash?: string;
  explorerUrl?: string;
}