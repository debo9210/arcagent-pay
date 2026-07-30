"use client";

import { useState } from "react";
import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { toast } from "sonner";
import { kit } from "@/lib/circle";

import DashboardHeader from "@/components/DashboardHeader";
import BalanceCard from "@/components/BalanceCard";
import DepositButton from "@/components/DepositButton";
import AgentsCard from "@/components/AgentsCard";
import BillsCard from "@/components/BillsCard";
import AddBillModal from "@/components/AddBillModal";
import PaymentHistory from "@/components/PaymentHistory";

export default function ArcAgentPay() {
  const [balance, setBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  // Agents & Bills state
  const [agents, setAgents] = useState([
  {
    id: "1",
    name: "Main Bill Agent",
    status: "active" as const,
    monthlyLimit: "500",
    maxPerPayment: "150",
    spentThisMonth: "0",
  },
]);

  const [bills, setBills] = useState([
  {
    id: "1",
    name: "Electricity",
    amount: "0.10",          // ← changed from 85.00
    frequency: "Monthly" as const,
    nextDate: "2026-08-01",
    status: "active" as const,
  },
]);

  const [showAddBill, setShowAddBill] = useState(false);

  const [payments, setPayments] = useState<
  { id: string; billName: string; amount: string; date: string; status: string }[]
>([]);

  // ===== Connection =====
  const connectWithMetaMask = async () => {
    setIsLoading(true);
    try {
      if (!(window as any).ethereum) {
        toast.error("MetaMask not found");
        return;
      }

      const provider = (window as any).ethereum;
      await provider.request({ method: "eth_requestAccounts" });

      const accounts = await provider.request({ method: "eth_accounts" });
      const addr = accounts[0];
      if (!addr) {
        toast.error("No account found");
        return;
      }

      const adapter = await createViemAdapterFromProvider({ provider });

      const balances = await kit.unifiedBalance.getBalances({
        token: "USDC",
        sources: [{ adapter }],
        includePending: true,
        networkType: "testnet",
      });

      const confirmed = parseFloat(balances?.totalConfirmedBalance || "0");
      const pending = parseFloat(balances?.totalPendingBalance || "0");
      const total = (confirmed + pending).toFixed(2);

      setBalance(total);
      setAddress(addr);
      setConnected(true);

      toast.success(`Connected • $${total} USDC`);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Deposit =====
  const depositToUnifiedBalance = async () => {
    if (!connected) {
      toast.error("Connect first");
      return;
    }

    setIsLoading(true);
    try {
      const provider = (window as any).ethereum;
      await provider.request({ method: "eth_requestAccounts" });

      const adapter = await createViemAdapterFromProvider({ provider });

      const result = await kit.unifiedBalance.deposit({
        from: {
          adapter,
          chain: "Base_Sepolia",
        },
        amount: "5.00",
        token: "USDC",
      });

      console.log("Deposit result:", result);
      toast.success("Deposit submitted! Refreshing balance...");

      setTimeout(connectWithMetaMask, 12000);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Deposit failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Agents & Bills handlers =====
  const handleCreateAgent = () => {
  const newAgent = {
    id: Date.now().toString(),
    name: `Agent ${agents.length + 1}`,
    status: "active" as const,
    monthlyLimit: "300",
    maxPerPayment: "100",
    spentThisMonth: "0",
  };
  setAgents([...agents, newAgent]);
  toast.success("New agent created");
};

  const handleAddBill = (bill: {
    name: string;
    amount: string;
    frequency: "Daily" | "Weekly" | "Monthly";
    nextDate: string;
  }) => {
    setBills([
      ...bills,
      {
        id: Date.now().toString(),
        ...bill,
        status: "active" as const,
      },
    ]);
    toast.success("Bill added successfully");
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter((b) => b.id !== id));
    toast.info("Bill removed");
  };


  const runAgent = (agentId: string) => {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent || agent.status !== "active") {
    toast.error("Agent is not active");
    return;
  }

  // Find bills that are due (simple demo: all active bills)
  const dueBills = bills.filter((b) => b.status === "active");

  if (dueBills.length === 0) {
    toast.info("No bills due right now");
    return;
  }

  let totalSpent = parseFloat(agent.spentThisMonth);
  const newPayments = [];

  for (const bill of dueBills) {
    const amount = parseFloat(bill.amount);

    // Check policies
    if (amount > parseFloat(agent.maxPerPayment)) {
      toast.error(`Bill "${bill.name}" exceeds max per payment`);
      continue;
    }

    if (totalSpent + amount > parseFloat(agent.monthlyLimit)) {
      toast.error(`Monthly limit reached for ${agent.name}`);
      break;
    }

    // Simulate successful payment
    totalSpent += amount;
    newPayments.push({
      id: Date.now().toString() + Math.random(),
      billName: bill.name,
      amount: bill.amount,
      date: new Date().toLocaleDateString(),
      status: "paid",
    });
  }

  if (newPayments.length > 0) {
    // Update agent spent amount
    setAgents(
      agents.map((a) =>
        a.id === agentId
          ? { ...a, spentThisMonth: totalSpent.toFixed(2) }
          : a
      )
    );

    setPayments([...newPayments, ...payments]);
    toast.success(`${newPayments.length} bill(s) paid by ${agent.name}`);
  }
};

const payBill = async (bill: {
  id: string;
  name: string;
  amount: string;
}) => {
  if (!connected || !address) {
    toast.error("Connect wallet first");
    return;
  }

  setIsLoading(true);
  try {
    const provider = (window as any).ethereum;
    await provider.request({ method: "eth_requestAccounts" });

    const adapter = await createViemAdapterFromProvider({ provider });

    // Real on-chain spend from Unified Balance
    // For demo we send to the user's own address (or replace with a real biller address)
    const result = await kit.unifiedBalance.spend({
      amount: bill.amount,
      token: "USDC",
      from: { adapter },
      to: {
        adapter,
        chain: "Base_Sepolia",
        recipientAddress: address, // ← change later to real biller address
      },
    });

    console.log("Spend result:", result);

    // Record in payment history
    setPayments([
      {
        id: Date.now().toString(),
        billName: bill.name,
        amount: bill.amount,
        date: new Date().toLocaleDateString(),
        status: "paid (on-chain)",
      },
      ...payments,
    ]);

    toast.success(`Paid $${bill.amount} for ${bill.name}`);

    // Refresh balance
    setTimeout(connectWithMetaMask, 8000);
  } catch (error: any) {
    console.error("Pay error:", error);
    toast.error(error?.message || "Payment failed");
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        <DashboardHeader isLoading={isLoading} onConnect={connectWithMetaMask} />

        <BalanceCard balance={balance} address={address} connected={connected} />

        <DepositButton
          connected={connected}
          isLoading={isLoading}
          onDeposit={depositToUnifiedBalance}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <AgentsCard
            agents={agents}
            onCreateAgent={handleCreateAgent}
            onRunAgent={runAgent}
          />
          <BillsCard
            bills={bills}
            onAddBill={() => setShowAddBill(true)}
            onDeleteBill={handleDeleteBill}
          />
        </div>

        <AddBillModal
          open={showAddBill}
          onClose={() => setShowAddBill(false)}
          onAdd={handleAddBill}
        />

        <PaymentHistory payments={payments} />

        <BillsCard
          bills={bills}
          onAddBill={() => setShowAddBill(true)}
          onDeleteBill={handleDeleteBill}
          onPayBill={payBill}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}