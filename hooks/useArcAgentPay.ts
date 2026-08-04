"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";
import { connectMetaMask, depositUSDC, spendUSDC } from "@/lib/actions";
import { isBillDue, getNextDate } from "@/lib/utils";
import type { Agent, Bill, Payment } from "@/lib/types";

export function useArcAgentPay() {
  const [balance, setBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const [agents, setAgents] = useState<Agent[]>([
    {
      id: "1",
      name: "Main Bill Agent",
      status: "active",
      monthlyLimit: "500",
      maxPerPayment: "150",
      spentThisMonth: "0",
    },
  ]);

  const [bills, setBills] = useState<Bill[]>([
    {
      id: "1",
      name: "Electricity",
      amount: "0.10",
      frequency: "Monthly",
      nextDate: "2026-08-01",
      status: "active",
      billerAddress: "0xc5899371b8ff1aba09cdc8c8d21ba976e43c95b6",
      agentId: "1",
    },
  ]);

  const [payments, setPayments] = useState<Payment[]>([]);
  const [showAddBill, setShowAddBill] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const isRunningRef = useRef(false);

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

  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: `Agent ${agents.length + 1}`,
      status: "active",
      monthlyLimit: "300",
      maxPerPayment: "100",
      spentThisMonth: "0",
    };
    setAgents([...agents, newAgent]);
    toast.success("New agent created");
  };

  const handleToggleStatus = (id: string) => {
    setAgents(
      agents.map((a) =>
        a.id === id
          ? { ...a, status: a.status === "active" ? "paused" : "active" }
          : a
      )
    );
    toast.success("Agent status updated");
  };

  const handleSaveAgent = (updated: Agent) => {
    setAgents(agents.map((a) => (a.id === updated.id ? updated : a)));
    toast.success("Agent updated");
  };

  const runAgent = async (agentId: string) => {
    if (isRunningRef.current) {
      toast.info("Agent is already running");
      return;
    }
    isRunningRef.current = true;
    setIsLoading(true);

    try {
      const agent = agents.find((a) => a.id === agentId);
      if (!agent || agent.status !== "active") {
        toast.error("Agent is not active");
        return;
      }

      if (!connected || !address) {
        toast.error("Connect wallet first");
        return;
      }

      const dueBills = Array.from(
        new Map(
          bills
            .filter(
              (b) =>
                b.status === "active" &&
                b.agentId === agentId &&
                isBillDue(b.nextDate)
            )
            .map((b) => [b.id, b])
        ).values()
      );

      if (dueBills.length === 0) {
        toast.info("No bills are due right now");
        return;
      }

      let totalSpent = parseFloat(agent.spentThisMonth);
      const newPayments: Payment[] = [];
      const updatedBills = [...bills];
      const paidBillIds = new Set<string>();

      for (const bill of dueBills) {
        if (paidBillIds.has(bill.id)) continue;

        const amount = parseFloat(bill.amount);

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

        paidBillIds.add(bill.id);

        try {
          const result = await spendUSDC({
            amount: bill.amount,
            recipientAddress: bill.billerAddress,
          });

          totalSpent += amount;

          newPayments.push({
            id: `${bill.id}-${result.txHash || Date.now()}`,
            billName: bill.name,
            amount: bill.amount,
            date: new Date().toLocaleDateString(),
            status: "paid (on-chain)",
            txHash: result.txHash,
            explorerUrl: result.explorerUrl,
          });

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
          paidBillIds.delete(bill.id);
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
      isRunningRef.current = false;
      setIsLoading(false);
      setTimeout(handleConnect, 10000);
    }
  };

  const handleAddBill = (bill: {
    name: string;
    amount: string;
    frequency: "Daily" | "Weekly" | "Monthly";
    nextDate: string;
    billerAddress: string;
    agentId: string;
  }) => {
    setBills([
      ...bills,
      {
        id: Date.now().toString(),
        ...bill,
        status: "active",
      },
    ]);
    toast.success("Bill added successfully");
  };

  const handleDeleteBill = (id: string) => {
    setBills(bills.filter((b) => b.id !== id));
    toast.info("Bill removed");
  };

  const handlePayBill = async (bill: Bill) => {
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

  return {
    balance,
    address,
    connected,
    isLoading,
    agents,
    bills,
    payments,
    showAddBill,
    editingAgent,
    setShowAddBill,
    setEditingAgent,
    handleConnect,
    handleDeposit,
    handleCreateAgent,
    handleToggleStatus,
    handleSaveAgent,
    runAgent,
    handleAddBill,
    handleDeleteBill,
    handlePayBill,
  };
}