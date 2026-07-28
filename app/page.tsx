// "use client";

// import { useState } from "react";
// import { AppKit } from "@circle-fin/app-kit";
// import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
// import { createViemAdapterFromPrivateKey } from "@circle-fin/adapter-viem-v2";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { toast } from "sonner";
// import { Wallet, RefreshCw, ArrowDownToLine } from "lucide-react";
// import { createPublicClient, http } from "viem";
// import { ArcTestnet } from "@circle-fin/app-kit/chains";

// const kit = new AppKit();

// export default function ArcAgentPay() {
//   const [balance, setBalance] = useState<string>("0.00");
//   const [isLoading, setIsLoading] = useState(false);
//   const [connected, setConnected] = useState(false);
//   const [address, setAddress] = useState<string>("");
//   const [usingMetaMask, setUsingMetaMask] = useState(false);


// const connectWithMetaMask = async () => {
//   setIsLoading(true);
//   try {
//     if (!(window as any).ethereum) {
//       toast.error("MetaMask not found");
//       return;
//     }

//     const provider = (window as any).ethereum;
//     await provider.request({ method: "eth_requestAccounts" });

//     const accounts = await provider.request({ method: "eth_accounts" });
//     const address = accounts[0];

//     if (!address) {
//       toast.error("No account found");
//       return;
//     }

//     // Use adapter (same as deposit)
//     const adapter = await createViemAdapterFromProvider({ provider });

//     const balances = await kit.unifiedBalance.getBalances({
//       token: "USDC",
//       sources: [{ adapter }],
//       includePending: true,
//       networkType: "testnet",
//     });

//     console.log("Full balances object:", balances);

    
//     const confirmed = parseFloat(balances?.totalConfirmedBalance || "0");
//     const pending = parseFloat(balances?.totalPendingBalance || "0");
//     const total = (confirmed + pending).toFixed(2);

//     console.log("Confirmed:", confirmed, "Pending:", pending, "Total:", total);


//     setBalance(total);
//     setAddress(address);
//     setConnected(true);
//     setUsingMetaMask(true);

//     toast.success(`Connected • $${parseFloat(total).toFixed(2)} USDC`);
//   } catch (error: any) {
//     console.error(error);
//     toast.error(error?.message || "Connection failed");
//   } finally {
//     setIsLoading(false);
//   }
// };


// const connectWithPrivateKey = async () => {
//   setIsLoading(true);
//   try {
//     const privateKey = process.env.NEXT_PUBLIC_PRIVATE_KEY;
//     if (!privateKey) {
//       toast.error("PRIVATE_KEY not found");
//       return;
//     }

//     const adapter = createViemAdapterFromPrivateKey({
//       privateKey: privateKey as `0x${string}`,
//     });

//     const balances = await kit.unifiedBalance.getBalances({
//       token: "USDC",
//       sources: [{ adapter }],
//     });

//     const total = balances?.totalConfirmedBalance || "0";
//     setBalance(total);
//     setConnected(true);
//     setUsingMetaMask(false);

//     toast.success(`Loaded • $${parseFloat(total).toFixed(2)} USDC`);
//   } catch (error: any) {
//     console.error(error);
//     toast.error(error?.message || "Connection failed");
//   } finally {
//     setIsLoading(false);
//   }
// };



// const depositToUnifiedBalance = async () => {
//   if (!connected) {
//     toast.error("Connect first");
//     return;
//   }

//   setIsLoading(true);
//   try {
//     if (!(window as any).ethereum) {
//       toast.error("MetaMask is required for deposit");
//       return;
//     }

//     const provider = (window as any).ethereum;
//     await provider.request({ method: "eth_requestAccounts" });

//     // IMPORTANT: await the adapter
//     const adapter = await createViemAdapterFromProvider({ provider });

//     // You must already be on Ethereum Sepolia in MetaMask
//     const result = await kit.unifiedBalance.deposit({
//       from: {
//         adapter,
//         chain: "Base_Sepolia",   // ← changed to match your active network
//       },
//       amount: "5.00",
//       token: "USDC",
//     });

//     console.log("Deposit result:", result);
//     toast.success("Deposit submitted! Refresh balance in 10–15 seconds.");

//     setTimeout(() => {
//       connectWithMetaMask();
//     }, 12000);
//   } catch (error: any) {
//     console.error("Deposit error:", error);
//     toast.error(error?.message || "Deposit failed");
//   } finally {
//     setIsLoading(false);
//   }
// };



//   return (
//     <div className="min-h-screen bg-zinc-950 p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <div>
//             <h1 className="text-4xl font-bold flex items-center gap-3">
//               <Wallet className="w-10 h-10 text-emerald-400" />
//               ArcAgent Pay
//             </h1>
//             <p className="text-zinc-400">Autonomous bill payments on Arc</p>
//           </div>

//           <div className="flex gap-3">
//             <Button onClick={connectWithMetaMask} disabled={isLoading}>
//               {isLoading ? <RefreshCw className="animate-spin mr-2" /> : "Connect MetaMask"}
//             </Button>
//             <Button variant="outline" onClick={connectWithPrivateKey} disabled={isLoading}>
//               Private Key (Dev)
//             </Button>
//           </div>
//         </div>

//         {connected && address && (
//           <div className="mb-4 text-sm text-zinc-400">
//             Connected: {address.slice(0, 6)}...{address.slice(-4)}
//           </div>
//         )}

//         <Card className="mb-8">
//           <CardHeader>
//             <CardTitle>Unified Balance (USDC)</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="text-6xl font-bold text-emerald-400">
//               ${parseFloat(balance).toFixed(2)}
//             </div>
//             <p className="text-zinc-400 mt-2">
//               {connected ? "Ready for agents" : "Connect a wallet to begin"}
//             </p>

//             {connected && (
//               <Button 
//                 onClick={depositToUnifiedBalance} 
//                 className="mt-6"
//                 disabled={isLoading}
//               >
//                 <ArrowDownToLine className="mr-2 h-4 w-4" />
//                 Deposit USDC to Unified Balance
//               </Button>
//             )}
//           </CardContent>
//         </Card>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <Card>
//             <CardHeader><CardTitle>Funding</CardTitle></CardHeader>
//             <CardContent><p className="text-sm text-zinc-400">Full ETH → USDC flow coming in Phase 2</p></CardContent>
//           </Card>
//           <Card>
//             <CardHeader><CardTitle>Agents</CardTitle></CardHeader>
//             <CardContent><p className="text-sm text-zinc-400">Create autonomous bill agents (Phase 3)</p></CardContent>
//           </Card>
//           <Card>
//             <CardHeader><CardTitle>Bills</CardTitle></CardHeader>
//             <CardContent><p className="text-sm text-zinc-400">Recurring payments (Phase 3)</p></CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }


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

export default function ArcAgentPay() {
  const [balance, setBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

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
          <AgentsCard />
          <BillsCard />
        </div>
      </div>
    </div>
  );
}