# PredictTheFuture

AI-Resolved Prediction Markets built on GenLayer's Intelligent Contracts.

Create a market around any real-world question. Users bet GEN tokens on YES or NO. When the resolution date arrives, GenLayer validators autonomously browse the web, gather evidence, and use AI consensus to determine the outcome. Winners split the losing pool proportionally—no human middlemen, no dispute committees.

## How It Works

```
Creator opens a market → Users bet YES / NO with GEN tokens
                                       ↓
                   Resolution date arrives → Anyone triggers resolution
                                       ↓
           GenLayer validators fetch evidence from the resolution URL
                                       ↓
              AI consensus: YES / NO / INVALID (Optimistic Democracy)
                                       ↓
           Winners claim proportional share of the total pool
```

1. **Create** — Define a question, description, resolution URL, and deadline
2. **Bet** — Send GEN tokens on YES or NO. Tokens go into escrow pools
3. **Resolve** — After the deadline, anyone triggers AI resolution. Validators independently fetch the resolution source and evaluate the outcome
4. **Claim** — Winners claim their proportional share of the total pool. If the outcome is INVALID, all bettors are refunded

## Architecture

**On-chain (GenLayer Bradbury Testnet)**
- `contracts/prediction_market.py` — Intelligent Contract handling market state, GEN escrow pools, AI-powered resolution via `run_nondet_unsafe`, and automated payouts
- Storage: JSON blobs in `TreeMap[bigint, str]` for reliable serialization on GenVM

**Frontend (Next.js 16)**
- React app with wallet connection (MetaMask, Rabby, etc.)
- Reads contract state via `genlayer-js` SDK
- Writes transactions signed by the user's wallet
- Falls back to demo mode when no contract is deployed

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Contract | Python on GenVM (GenLayer Bradbury testnet) |
| Frontend | Next.js 16, TypeScript, React 19 |
| Wallet | wagmi, viem, genlayer-js |
| Styling | Tailwind CSS 4 |
| Testing | Vitest |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Environment

Create a `.env` file:

```
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-contract-address>
NEXT_PUBLIC_GENLAYER_NETWORK=testnetBradbury
NEXT_PUBLIC_GENLAYER_RPC_URL=https://rpc-bradbury.genlayer.com
```

Without `NEXT_PUBLIC_CONTRACT_ADDRESS`, the app runs in demo mode with sample markets.

## Deploying the Contract

1. Connect your wallet to Bradbury testnet (Chain ID 4221)
2. Go to `/deploy` in the app
3. Click "Deploy to Bradbury" and approve in your wallet
4. Copy the contract address into `.env`

## Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `create_market` | write | Create a new prediction market |
| `bet` | payable | Bet GEN on YES or NO |
| `resolve_market` | write | Trigger AI resolution (fetches evidence, runs consensus) |
| `claim_winnings` | write | Claim proportional winnings after resolution |
| `list_markets` | view | List all markets with pool data |
| `get_market` | view | Get single market by ID |
| `get_bet` | view | Get a user's bet for a market |

## Project Structure

```
predict-the-future/
├── contracts/
│   └── prediction_market.py    # GenLayer Intelligent Contract
├── src/
│   ├── app/                    # Next.js pages (home, create, markets, deploy)
│   ├── components/             # React components
│   └── lib/
│       ├── contract.ts         # Contract read/write adapter
│       ├── genlayer.ts         # GenLayer client setup + wallet shim
│       ├── format.ts           # Formatting utilities
│       ├── env.ts              # Environment configuration
│       └── types.ts            # TypeScript types
└── package.json
```

## Network Details

| Setting | Value |
|---------|-------|
| Network | GenLayer Bradbury Testnet |
| Chain ID | 4221 |
| RPC | https://rpc-bradbury.genlayer.com |
| Explorer | https://explorer-bradbury.genlayer.com |
| Faucet | https://testnet-faucet.genlayer.foundation |

## License

MIT