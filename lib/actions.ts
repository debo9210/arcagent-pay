import { createViemAdapterFromProvider } from "@circle-fin/adapter-viem-v2";
import { kit } from "@/lib/circle";

export async function connectMetaMask() {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = (window as any).ethereum;
  await provider.request({ method: "eth_requestAccounts" });

  const accounts = await provider.request({ method: "eth_accounts" });
  const address = accounts[0];
  if (!address) {
    throw new Error("No account found");
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

  return { address, total, balances };
}

export async function depositUSDC(amount: string = "5.00") {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = (window as any).ethereum;
  await provider.request({ method: "eth_requestAccounts" });

  const adapter = await createViemAdapterFromProvider({ provider });

  const result = await kit.unifiedBalance.deposit({
    from: {
      adapter,
      chain: "Base_Sepolia",
    },
    amount,
    token: "USDC",
  });

  return result;
}

export async function spendUSDC({
  amount,
  recipientAddress,
}: {
  amount: string;
  recipientAddress: string;
}) {
  if (!(window as any).ethereum) {
    throw new Error("MetaMask not found");
  }

  const provider = (window as any).ethereum;
  await provider.request({ method: "eth_requestAccounts" });

  const adapter = await createViemAdapterFromProvider({ provider });

  const result = await kit.unifiedBalance.spend({
    amount,
    token: "USDC",
    from: { adapter },
    to: {
      adapter,
      chain: "Base_Sepolia",
      recipientAddress,
    },
  });

  return result;
}