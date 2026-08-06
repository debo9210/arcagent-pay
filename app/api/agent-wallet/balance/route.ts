import { NextResponse } from "next/server";
import { getCircleWalletsClient } from "@/lib/circle-wallets";

export async function GET() {
  try {
    const walletId = process.env.CIRCLE_AGENT_WALLET_ID;
    if (!walletId) {
      return NextResponse.json(
        { error: "Missing CIRCLE_AGENT_WALLET_ID" },
        { status: 500 }
      );
    }

    const client = getCircleWalletsClient();
    const balances = await client.getWalletTokenBalance({ id: walletId });

    const usdc = balances.data?.tokenBalances?.find(
      (t: any) => t.token?.symbol === "USDC"
    );

    return NextResponse.json({
      balance: usdc?.amount || "0",
      token: "USDC",
    });
  } catch (error: any) {
    console.error("Treasury balance error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch treasury balance" },
      { status: 500 }
    );
  }
}