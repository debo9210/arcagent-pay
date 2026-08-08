# ArcAgent Pay

Autonomous USDC bill payments powered by **Circle** and the **Arc / Base Sepolia** stack.

Users fund a shared agent treasury once. Policy-controlled agents then pay recurring bills on schedule — **without MetaMask popups** for Run / Auto payments.

## Tracks

- **Agentic Economy**
- **DeFi / Fintech Infrastructure**

## What it does

1. Connect MetaMask
2. Deposit USDC into **Unified Balance**
3. Fund the shared **Agent Treasury** (Circle SCA wallet)
4. Create agents with spending policies
5. Add recurring bills (daily / weekly / monthly)
6. Run agents manually or enable **Auto Mode**
7. Agents pay due bills on-chain and log tx links

## Architecture

```text
MetaMask / multi-chain funding
  → Unified Balance (optional)
  → Arc Testnet Agent Treasury (Circle SCA)
  → Bill recipients on Arc


Agent controlsMonthly spending limit
Max per payment
Pause / resume
Auto Mode
Due-date scheduling
Bill-to-agent assignment

Key distinctionAction
Signer
Connect / Deposit / Fund Treasury
MetaMask
Run Agent / Auto Mode payments
Circle SCA treasury (server-side)

Demo flow (for judges)Open the app and Connect MetaMask (Base Sepolia)
1. Deposit USDC into Unified Balance from Base, Ethereum, or Arc
2. Fund **Arc Testnet Treasury** from Unified Balance
3. Add a billAmount: 0.10
4. Next date: today
5. Assign to an agent
6. Biller address: any valid test address

7. Click Run or turn Auto ON
Check Payment History → View tx on BaseScan

No MetaMask approval is needed for step 7.

Features completedMetaMask connection
Unified Balance (read + deposit)
Fund agent treasury from Unified Balance
Shared Circle SCA treasury
Agents UI (create, pause, edit, auto mode)
Recurring bills (create, assign, delete)
Due-date scheduler
Real on-chain autonomous payments
Payment history with explorer links
localStorage persistence
Low-treasury guardrails

Tech stackNext.js + TypeScript
Circle App Kit (Unified Balance)
Circle Developer-Controlled Wallets (SCA)
Viem + MetaMask
Base Sepolia testnet
Tailwind + shadcn/ui

How to run
git clone <your-repo-url>
cd arcagent-pay
npm install

Create .env.local:
# Circle developer wallets (server only)
CIRCLE_API_KEY=
CIRCLE_ENTITY_SECRET=
CIRCLE_WALLET_SET_ID=
CIRCLE_AGENT_WALLET_ID=

# Public treasury address (safe to expose)
NEXT_PUBLIC_CIRCLE_AGENT_WALLET_ADDRESS=

Start the app:
npm run dev

Open http://localhost:3000Notes 
Use small test amounts (0.10 USDC)
Agents / bills / payments persist in localStorage
Run / Auto are disabled when treasury balance is too low
Network: Base Sepolia

Project statusFunctional end-to-end demo for the Programmable Money Hackathon.
Core autonomous payment loop is live. UI polish is optional final work.

