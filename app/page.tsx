"use client";

import { useState } from "react";
import { toast } from "sonner";
import { connectMetaMask, depositUSDC, spendUSDC } from "@/lib/actions";
import { isBillDue, getNextDate } from "@/lib/utils";

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
    amount: "0.10",
    frequency: "Monthly" as const,
    nextDate: "2026-08-01",
    status: "active" as const,
    billerAddress: "0x15757D6C310B721A0AdBcc9A79ea52e3A2988273", // replace with any test address
  },
]);

  const [showAddBill, setShowAddBill] = useState(false);

  const [payments, setPayments] = useState<
  {
    id: string;
    billName: string;
    amount: string;
    date: string;
    status: string;
    txHash?: string;
    explorerUrl?: string;
    }[]
  >([]);

  // ===== Connection =====
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { address, total } = await connectMetaMask();
      setAddress(address);
      setBalance(total);
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
  const handleDeposit = async () => {
    if (!connected) {
      toast.error("Connect first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await depositUSDC("5.00");
      console.log("Deposit result:", result);
      toast.success("Deposit submitted! Refreshing balance...");
      setTimeout(handleConnect, 12000);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Deposit failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Agents =====
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

  // run agent
  const runAgent = async (agentId: string) => {
  const agent = agents.find((a) => a.id === agentId);
  if (!agent || agent.status !== "active") {
    toast.error("Agent is not active");
    return;
  }

  if (!connected || !address) {
    toast.error("Connect wallet first");
    return;
  }

  // Only bills that are due
  const dueBills = bills.filter(
    (b) => b.status === "active" && isBillDue(b.nextDate)
  );

  if (dueBills.length === 0) {
    toast.info("No bills are due right now");
    return;
  }

  setIsLoading(true);

  let totalSpent = parseFloat(agent.spentThisMonth);
  const newPayments: {
    id: string;
    billName: string;
    amount: string;
    date: string;
    status: string;
    txHash?: string;
    explorerUrl?: string;
  }[] = [];

  const updatedBills = [...bills];

  try {
    for (const bill of dueBills) {
      const amount = parseFloat(bill.amount);

      // Policy checks
      if (amount > parseFloat(agent.maxPerPayment)) {
        toast.error(`"${bill.name}" exceeds max per payment`);
        continue;
      }

      if (totalSpent + amount > parseFloat(agent.monthlyLimit)) {
        toast.error(`Monthly limit reached for ${agent.name}`);
        break;
      }

      if (!bill.billerAddress) {
        toast.error(`"${bill.name}" has no biller address`);
        continue;
      }

      try {
        const result = await spendUSDC({
          amount: bill.amount,
          recipientAddress: bill.billerAddress,
        });

        console.log(`Paid ${bill.name}:`, result);

        totalSpent += amount;

        newPayments.push({
          id: Date.now().toString() + Math.random(),
          billName: bill.name,
          amount: bill.amount,
          date: new Date().toLocaleDateString(),
          status: "paid (on-chain)",
          txHash: result.txHash,
          explorerUrl: result.explorerUrl,
        });

        // Advance next payment date
        const billIndex = updatedBills.findIndex((b) => b.id === bill.id);
        if (billIndex !== -1) {
          updatedBills[billIndex] = {
            ...updatedBills[billIndex],
            nextDate: getNextDate(bill.nextDate, bill.frequency),
          };
        }

        toast.success(`Paid $${bill.amount} for ${bill.name}`);
      } catch (err: any) {
        console.error(`Failed to pay ${bill.name}:`, err);
        toast.error(`Failed to pay ${bill.name}`);
      }
    }

    if (newPayments.length > 0) {
      setAgents(
        agents.map((a) =>
          a.id === agentId
            ? { ...a, spentThisMonth: totalSpent.toFixed(2) }
            : a
        )
      );
      setBills(updatedBills);
      setPayments([...newPayments, ...payments]);
      toast.success(`${newPayments.length} due bill(s) paid by ${agent.name}`);
    }
  } finally {
    setIsLoading(false);
    setTimeout(handleConnect, 10000);
  }
};

  // ===== Bills =====
  const handleAddBill = (bill: {
  name: string;
  amount: string;
  frequency: "Daily" | "Weekly" | "Monthly";
  nextDate: string;
  billerAddress: string;
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

  // ===== Real on-chain pay =====
  const handlePayBill = async (bill: {
  id: string;
  name: string;
  amount: string;
  billerAddress: string;
}) => {
  if (!connected || !address) {
    toast.error("Connect wallet first");
    return;
  }


  if (!bill.billerAddress) {
    toast.error("This bill has no biller address");
    return;
  }
    

  setIsLoading(true);
  try {
    const result = await spendUSDC({
      amount: bill.amount,
      recipientAddress: bill.billerAddress,
    });

    console.log("Spend result:", result);

    setPayments([
      {
        id: Date.now().toString(),
        billName: bill.name,
        amount: bill.amount,
        date: new Date().toLocaleDateString(),
        status: "paid (on-chain)",
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
      },
      ...payments,
    ]);

    toast.success(`Paid $${bill.amount} for ${bill.name}`);
    setTimeout(handleConnect, 8000);
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
        <DashboardHeader isLoading={isLoading} onConnect={handleConnect} />

        <BalanceCard balance={balance} address={address} connected={connected} />

        <DepositButton
          connected={connected}
          isLoading={isLoading}
          onDeposit={handleDeposit}
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
            onPayBill={handlePayBill}
            isLoading={isLoading}
          />
        </div>

        <AddBillModal
          open={showAddBill}
          onClose={() => setShowAddBill(false)}
          onAdd={handleAddBill}
        />

        <PaymentHistory payments={payments} />
      </div>
    </div>
  );
}