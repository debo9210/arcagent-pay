"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  connectMetaMask,
  depositUSDCFromChain,
  fundAgentTreasury,
  transferFromAgentWallet,
  getAgentTreasuryBalance,
} from "@/lib/actions";
import { isBillDue, getNextDate } from "@/lib/utils";
import type { Agent, Bill, Payment } from "@/lib/types";

const STORAGE_KEY = "arcagent-pay-state";

function loadState() {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState(data: {
  agents: Agent[];
  bills: Bill[];
  payments: Payment[];
}) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error("Failed to save state:", e);
  }
}

const defaultAgents: Agent[] = [
  {
    id: "1",
    name: "Main Bill Agent",
    status: "active",
    monthlyLimit: "500",
    maxPerPayment: "150",
    spentThisMonth: "0",
    autoMode: false,
  },
];

const defaultBills: Bill[] = [
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
];

export function useArcAgentPay() {
  // Always start with the same defaults on server + first client render
  const [balance, setBalance] = useState("0.00");
  const [treasuryBalance, setTreasuryBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const [agents, setAgents] = useState<Agent[]>(defaultAgents);
  const [bills, setBills] = useState<Bill[]>(defaultBills);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [hasHydrated, setHasHydrated] = useState(false);

  const [showAddBill, setShowAddBill] = useState(false);
  const [editingAgent, setEditingAgent] = useState<Agent | null>(null);

  const isRunningRef = useRef(false);

  // Load from localStorage only after mount (avoids hydration mismatch)
  useEffect(() => {
    const saved = loadState();
    if (saved) {
      if (saved.agents?.length) setAgents(saved.agents);
      if (saved.bills?.length) setBills(saved.bills);
      if (saved.payments?.length) setPayments(saved.payments);
    }
    setHasHydrated(true);
  }, []);

  // Persist only after hydration so defaults don't overwrite saved state
  useEffect(() => {
    if (!hasHydrated) return;
    saveState({ agents, bills, payments });
  }, [agents, bills, payments, hasHydrated]);

  // ===== Treasury balance =====
  const refreshTreasuryBalance = async () => {
    try {
      const bal = await getAgentTreasuryBalance();
      setTreasuryBalance(parseFloat(bal || "0").toFixed(2));
    } catch (error) {
      console.error("Failed to refresh treasury balance:", error);
    }
  };

  useEffect(() => {
    refreshTreasuryBalance();
  }, []);

  const hasEnoughTreasury = (amount: string) => {
    return parseFloat(treasuryBalance || "0") >= parseFloat(amount || "0");
  };

  const treasuryTooLow = parseFloat(treasuryBalance || "0") <= 0;

  // ===== Connection =====
  const handleConnect = async () => {
    setIsLoading(true);
    try {
      const { address, total } = await connectMetaMask();
      setAddress(address);
      setBalance(total);
      setConnected(true);
      toast.success(`Connected • $${total} USDC`);
      await refreshTreasuryBalance();
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Connection failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Deposit into Unified Balance =====
  const handleDeposit = async (
    chain: "Arc_Testnet" | "Base_Sepolia" | "Ethereum_Sepolia",
    amount = "5.00"
  ) => {
    if (!connected) {
      toast.error("Connect first");
      return;
    }

    setIsLoading(true);
    try {
      toast.info(
        `Switch MetaMask to ${chain.replace("_", " ")} before confirming`
      );
      const result = await depositUSDCFromChain({ amount, chain });
      console.log("Deposit result:", result);
      toast.success(`Deposited $${amount} from ${chain}`);
      setTimeout(() => handleConnect(), 12000);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Deposit failed");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Fund shared agent treasury =====
  const handleFundTreasury = async (amount = "5.00") => {
    if (!connected) {
      toast.error("Connect MetaMask first");
      return;
    }

    setIsLoading(true);
    try {
      const result = await fundAgentTreasury({ amount });
      console.log("Fund treasury result:", result);
      toast.success(`Sent $${amount} USDC to agent treasury`);

      setTimeout(() => {
        handleConnect();
        refreshTreasuryBalance();
      }, 10000);
    } catch (error: any) {
      console.error(error);
      toast.error(error?.message || "Failed to fund agent treasury");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== Agents =====
  const handleCreateAgent = () => {
    const newAgent: Agent = {
      id: Date.now().toString(),
      name: `Agent ${agents.length + 1}`,
      status: "active",
      monthlyLimit: "300",
      maxPerPayment: "100",
      spentThisMonth: "0",
      autoMode: false,
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

  const handleToggleAutoMode = (id: string) => {
    setAgents(
      agents.map((a) =>
        a.id === id ? { ...a, autoMode: !a.autoMode } : a
      )
    );
    toast.success("Auto mode updated");
  };

  const handleSaveAgent = (updated: Agent) => {
    setAgents(agents.map((a) => (a.id === updated.id ? updated : a)));
    toast.success("Agent updated");
  };

  // ===== Shared treasury autonomous payments =====
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

      if (treasuryTooLow) {
        toast.error("Treasury is empty. Fund agent treasury first.");
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

      const totalDue = dueBills.reduce(
        (sum, b) => sum + parseFloat(b.amount || "0"),
        0
      );

      if (parseFloat(treasuryBalance || "0") < totalDue) {
        toast.error(
          `Treasury too low. Need ~$${totalDue.toFixed(2)} USDC, have $${treasuryBalance}`
        );
        return;
      }

      console.log(
        "Due bills to pay:",
        dueBills.map((b) => `${b.name} (${b.id})`)
      );

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

        if (!hasEnoughTreasury(bill.amount)) {
          toast.error(`Treasury too low to pay ${bill.name}`);
          break;
        }

        paidBillIds.add(bill.id);

        try {
          const result = await transferFromAgentWallet({
            amount: bill.amount,
            destinationAddress: bill.billerAddress,
          });

          console.log(`Paid ${bill.name}:`, result);

          totalSpent += amount;

          const explorerUrl =
            result.explorerUrl ||
            (result.txHash
              ? `https://testnet.arcscan.app/tx/${result.txHash}`
              : undefined);

          newPayments.push({
            id: `${bill.id}-${result.txHash || result.id || Date.now()}`,
            billName: bill.name,
            amount: bill.amount,
            date: new Date().toLocaleDateString(),
            status: "paid (agent treasury)",
            txHash: result.txHash,
            explorerUrl,
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
        toast.success(
          `${newPayments.length} due bill(s) paid by ${agent.name}`
        );
        await refreshTreasuryBalance();
      }
    } finally {
      isRunningRef.current = false;
      setIsLoading(false);
    }
  };

  // ===== Auto Mode scheduler =====
  useEffect(() => {
    const interval = setInterval(() => {
      if (isRunningRef.current) return;
      if (parseFloat(treasuryBalance || "0") <= 0) return;

      const autoAgents = agents.filter(
        (a) => a.autoMode && a.status === "active"
      );

      for (const agent of autoAgents) {
        const hasDueBills = bills.some(
          (b) =>
            b.status === "active" &&
            b.agentId === agent.id &&
            isBillDue(b.nextDate)
        );

        if (hasDueBills) {
          console.log(`Auto-running agent: ${agent.name}`);
          runAgent(agent.id);
          break;
        }
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [agents, bills, treasuryBalance]);

  // ===== Bills =====
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
    if (!bill.billerAddress) {
      toast.error("This bill has no biller address");
      return;
    }

    if (!hasEnoughTreasury(bill.amount)) {
      toast.error("Treasury balance too low");
      return;
    }

    setIsLoading(true);
    try {
      const result = await transferFromAgentWallet({
        amount: bill.amount,
        destinationAddress: bill.billerAddress,
      });

      console.log("Pay bill result:", result);

      const explorerUrl =
        result.explorerUrl ||
        (result.txHash
          ? `https://testnet.arcscan.app/tx/${result.txHash}`
          : undefined);

      setPayments([
        {
          id: `${bill.id}-${result.txHash || result.id || Date.now()}`,
          billName: bill.name,
          amount: bill.amount,
          date: new Date().toLocaleDateString(),
          status: "paid (agent treasury)",
          txHash: result.txHash,
          explorerUrl,
        },
        ...payments,
      ]);

      toast.success(`Paid $${bill.amount} for ${bill.name}`);
      await refreshTreasuryBalance();
    } catch (error: any) {
      console.error("Pay error:", error);
      toast.error(error?.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    balance,
    treasuryBalance,
    treasuryTooLow,
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
    handleFundTreasury,
    handleCreateAgent,
    handleToggleStatus,
    handleToggleAutoMode,
    handleSaveAgent,
    runAgent,
    handleAddBill,
    handleDeleteBill,
    handlePayBill,
    refreshTreasuryBalance,
  };
}