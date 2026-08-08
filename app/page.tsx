"use client";

import { useArcAgentPay } from "@/hooks/useArcAgentPay";

import DashboardHeader from "@/components/DashboardHeader";
import BalanceCard from "@/components/BalanceCard";
import DepositButton from "@/components/DepositButton";
import FundTreasuryButton from "@/components/FundTreasuryButton";
import AgentsCard from "@/components/AgentsCard";
import BillsCard from "@/components/BillsCard";
import AddBillModal from "@/components/AddBillModal";
import EditAgentModal from "@/components/EditAgentModal";
import PaymentHistory from "@/components/PaymentHistory";

export default function ArcAgentPay() {
  const {
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
  } = useArcAgentPay();

  const treasuryAddress =
    process.env.NEXT_PUBLIC_CIRCLE_AGENT_WALLET_ADDRESS || "";

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-5xl mx-auto">
        <DashboardHeader isLoading={isLoading} onConnect={handleConnect} />

        <BalanceCard
          balance={balance}
          treasuryBalance={treasuryBalance}
          address={address}
          connected={connected}
          treasuryAddress={treasuryAddress}
        />

       <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:flex-wrap">
        <DepositButton
          connected={connected}
          isLoading={isLoading}
          onDeposit={(chain, amount) =>
            handleDeposit(chain as "Arc_Testnet" | "Base_Sepolia" | "Ethereum_Sepolia", amount)
          }
        />

        <FundTreasuryButton
          connected={connected}
          isLoading={isLoading}
          onFund={(amount) => handleFundTreasury(amount)}
        />
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          <AgentsCard
            agents={agents}
            onCreateAgent={handleCreateAgent}
            onRunAgent={runAgent}
            onToggleStatus={handleToggleStatus}
            onToggleAutoMode={handleToggleAutoMode}
            onEditAgent={setEditingAgent}
            isLoading={isLoading}
            treasuryTooLow={treasuryTooLow}
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