import { NextResponse } from "next/server";
import { getCircleWalletsClient } from "@/lib/circle-wallets";

const BASE_SEPOLIA_USDC_TOKEN_ID = "bdf128b4-827b-5267-8f9e-243694989b5f";

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
      tokenId: BASE_SEPOLIA_USDC_TOKEN_ID,
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

    // Poll until complete (or failed)
    const terminal = new Set(["COMPLETE", "FAILED", "CANCELLED", "DENIED"]);
    let state = transferResponse.data?.state || "INITIATED";
    let txHash: string | undefined = transferResponse.data?.txHash;

    for (let i = 0; i < 20 && !terminal.has(state); i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const poll = await client.getTransaction({ id: transactionId });
      state = poll.data?.transaction?.state || state;
      txHash = poll.data?.transaction?.txHash || txHash;
    }

    return NextResponse.json({
      id: transactionId,
      state,
      txHash,
      explorerUrl: txHash
        ? `https://sepolia.basescan.org/tx/${txHash}`
        : undefined,
    });
  } catch (error: any) {
    console.error("Transfer error:", error);
    return NextResponse.json(
      { error: error?.message || "Transfer failed" },
      { status: 500 }
    );
  }
}