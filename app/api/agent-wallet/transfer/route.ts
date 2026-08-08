import { NextResponse } from "next/server";
import { getCircleWalletsClient } from "@/lib/circle-wallets";

const ARC_TESTNET_USDC_TOKEN_ID = "ef87c8c3-85de-598a-af50-c5135eecfa74";
const ARC_EXPLORER = "https://testnet.arcscan.app";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const amount = body.amount || "0.10";
    const destinationAddress = body.destinationAddress;
    const walletId = process.env.CIRCLE_AGENT_WALLET_ID;

    if (!destinationAddress) {
      return NextResponse.json(
        { error: "destinationAddress is required" },
        { status: 400 }
      );
    }

    if (!walletId) {
      return NextResponse.json(
        { error: "Missing CIRCLE_AGENT_WALLET_ID in .env.local" },
        { status: 500 }
      );
    }

    const client = getCircleWalletsClient();

    const transferResponse = await client.createTransaction({
      walletId,
      tokenId: ARC_TESTNET_USDC_TOKEN_ID,
      destinationAddress,
      amount: [String(amount)],
      fee: {
        type: "level",
        config: { feeLevel: "MEDIUM" },
      },
    });

    const transactionId = transferResponse.data?.id;
    if (!transactionId) {
      throw new Error("No transaction id returned");
    }

    // Create response has id/state only — txHash comes from polling
    const terminal = new Set(["COMPLETE", "FAILED", "CANCELLED", "DENIED"]);
    let state: string = transferResponse.data?.state || "INITIATED";
    let txHash: string | undefined;

    for (let i = 0; i < 12 && !terminal.has(state); i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await client.getTransaction({ id: transactionId });
      const tx = poll.data?.transaction;
      state = tx?.state || state;
      if (tx?.txHash) {
        txHash = tx.txHash;
      }
    }

    return NextResponse.json({
      id: transactionId,
      state,
      txHash,
      chain: "ARC-TESTNET",
      explorerUrl: txHash ? `${ARC_EXPLORER}/tx/${txHash}` : undefined,
    });
  } catch (error: any) {
    console.error("Arc transfer error:", error);
    return NextResponse.json(
      { error: error?.message || "Transfer failed" },
      { status: 500 }
    );
  }
}