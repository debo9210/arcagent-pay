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
    },
  ]);

  const [bills, setBills] = useState([
    {
      id: "1",
      name: "Electricity",
      amount: "85.00",
      frequency: "Monthly" as const,
      nextDate: "2026-08-01",
      status: "active" as const,
    },
  ]);

  const [showAddBill, setShowAddBill] = useState(false);

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
          <AgentsCard agents={agents} onCreateAgent={handleCreateAgent} />
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
      </div>
    </div>
  );
}