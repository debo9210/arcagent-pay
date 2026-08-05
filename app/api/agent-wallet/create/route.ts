import { NextResponse } from "next/server";
import { getCircleWalletsClient } from "@/lib/circle-wallets";

export async function POST() {
  try {
    const client = getCircleWalletsClient();

    let walletSetId = process.env.CIRCLE_WALLET_SET_ID;

    // Create wallet set once if not configured
    if (!walletSetId) {
      const walletSetResponse = await client.createWalletSet({
        name: "ArcAgent Pay Agents",
      });
      walletSetId = walletSetResponse.data?.walletSet?.id;

      if (!walletSetId) {
        throw new Error("Failed to create wallet set");
      }

      console.log("Created wallet set ID (save to .env.local):", walletSetId);
    }

    const walletsResponse = await client.createWallets({
      walletSetId,
      blockchains: ["BASE-SEPOLIA"], // match your current testnet
      count: 1,
      accountType: "EOA",
    });

    const wallet = walletsResponse.data?.wallets?.[0];

    if (!wallet) {
      throw new Error("Failed to create wallet");
    }

    return NextResponse.json({
      walletId: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      walletSetId,
    });
  } catch (error: any) {
    console.error("Create agent wallet error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create agent wallet" },
      { status: 500 }
    );
  }
}
