import { NextResponse } from "next/server";
import { getCircleWalletsClient } from "@/lib/circle-wallets";

export async function POST() {
  try {
    const client = getCircleWalletsClient();
    const walletSetId = process.env.CIRCLE_WALLET_SET_ID;

    if (!walletSetId) {
      return NextResponse.json(
        { error: "Missing CIRCLE_WALLET_SET_ID" },
        { status: 500 }
      );
    }

    const walletsResponse = await client.createWallets({
      walletSetId,
      blockchains: ["BASE-SEPOLIA"],
      count: 1,
      accountType: "SCA", // important
    });

    const wallet = walletsResponse.data?.wallets?.[0];
    if (!wallet) throw new Error("Failed to create SCA wallet");

    return NextResponse.json({
      walletId: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      accountType: wallet.accountType,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Failed to create SCA wallet" },
      { status: 500 }
    );
  }
}