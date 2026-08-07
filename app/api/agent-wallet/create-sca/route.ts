import { NextResponse } from "next/server";
import { getCircleWalletsClient } from "@/lib/circle-wallets";

export async function POST() {
  try {
    const client = getCircleWalletsClient();

    let walletSetId = process.env.CIRCLE_WALLET_SET_ID;

    // If missing or invalid, create a fresh wallet set
    if (!walletSetId) {
      const walletSetResponse = await client.createWalletSet({
        name: "ArcAgent Pay Treasury",
      });
      walletSetId = walletSetResponse.data?.walletSet?.id;

      if (!walletSetId) {
        throw new Error("Failed to create wallet set");
      }

      console.log("NEW WALLET SET ID (save to .env.local):", walletSetId);
    }

    let walletsResponse;
    try {
      walletsResponse = await client.createWallets({
        walletSetId,
        blockchains: ["ARC-TESTNET"],
        count: 1,
        accountType: "SCA",
      });
    } catch (err: any) {
      // If stored wallet set is bad, create a new one and retry
      if (err?.code === 156005 || err?.message?.includes("wallet set")) {
        const walletSetResponse = await client.createWalletSet({
          name: "ArcAgent Pay Treasury",
        });
        walletSetId = walletSetResponse.data?.walletSet?.id;

        if (!walletSetId) {
          throw new Error("Failed to create replacement wallet set");
        }

        console.log("REPLACED WALLET SET ID (save to .env.local):", walletSetId);

        walletsResponse = await client.createWallets({
          walletSetId,
          blockchains: ["ARC-TESTNET"],
          count: 1,
          accountType: "SCA",
        });
      } else {
        throw err;
      }
    }

    const wallet = walletsResponse.data?.wallets?.[0];
    if (!wallet) throw new Error("Failed to create Arc SCA wallet");

    return NextResponse.json({
      walletId: wallet.id,
      address: wallet.address,
      blockchain: wallet.blockchain,
      accountType: wallet.accountType,
      walletSetId,
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || "Failed to create Arc SCA wallet" },
      { status: 500 }
    );
  }
}