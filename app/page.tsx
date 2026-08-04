"use client";

import { useArcAgentPay } from "@/hooks/useArcAgentPay";

import DashboardHeader from "@/components/DashboardHeader";
import BalanceCard from "@/components/BalanceCard";
import DepositButton from "@/components/DepositButton";
import AgentsCard from "@/components/AgentsCard";
import BillsCard from "@/components/BillsCard";
import AddBillModal from "@/components/AddBillModal";
import EditAgentModal from "@/components/EditAgentModal";
import PaymentHistory from "@/components/PaymentHistory";

export default function ArcAgentPay() {
  const {
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
  } = useArcAgentPay();

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
            onToggleStatus={handleToggleStatus}
            onEditAgent={setEditingAgent}
            isLoading={isLoading}
          />

          <BillsCard
            bills={bills}
            agents={agents}
            onAddBill={() => setShowAddBill(true)}
            onDeleteBill={handleDeleteBill}
            onPayBill={handlePayBill}
            isLoading={isLoading}
          />
        </div>

        <AddBillModal
          open={showAddBill}
          agents={agents}
          onClose={() => setShowAddBill(false)}
          onAdd={handleAddBill}
        />

        <EditAgentModal
          open={!!editingAgent}
          agent={editingAgent}
          onClose={() => setEditingAgent(null)}
          onSave={handleSaveAgent}
        />

        <PaymentHistory payments={payments} />
      </div>
    </div>
  );
}