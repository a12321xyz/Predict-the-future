# PredictTheFuture

A GenLayer prediction market where outcomes are resolved by an Intelligent Contract.

Users can create a market around a real-world question, bet GEN on YES or NO, and trigger resolution after the deadline. The contract reads the configured resolution URL, asks validators to evaluate the evidence, and stores the final outcome on-chain. Winners can then claim their share of the pool. If the result is invalid, bettors are refunded.

## How It Works

```text
Create market
Users bet YES or NO
Deadline passes
Anyone triggers resolution
Validators fetch the resolution source
AI consensus returns YES, NO, or INVALID
Winners claim payouts
```

1. **Create:** Define a question, description, resolution URL, and deadline.
2. **Bet:** Send GEN tokens to the YES or NO side of the market.
3. **Resolve:** After the deadline, trigger AI-based resolution through the GenLayer contract.
4. **Claim:** Winners claim proportional payouts. Invalid markets refund each bettor.

## Architecture

**Contract**
- `contracts/prediction_market.py`: GenLayer Intelligent Contract for market state, escrow pools, AI resolution, and payouts.
- Storage uses `TreeMap[u256, str]` for market records, with related `u256` keyed maps for bets, pools, and claims.
- Resolution uses `run_nondet_unsafe` so validators can fetch the source URL and agree on the result.

**Frontend**
- Next.js 16 app with React 19.
- Wallet connection through wagmi and viem.
- Contract reads and writes through `genlayer-js`.
- Demo fallback is available when no contract address is configured.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Contract | Python on GenVM |
| Network | GenLayer Bradbury testnet |
| Frontend | Next.js, TypeScript, React |
| Wallet | wagmi, viem, genlayer-js |
| Styling | Tailwind CSS |
| Testing | Vitest |

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Create a `.env` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<your-deployed-contract-address>
NEXT_PUBLIC_GENLAYER_NETWORK=testnetBradbury
NEXT_PUBLIC_GENLAYER_RPC_URL=https://rpc-bradbury.genlayer.com
```

If `NEXT_PUBLIC_CONTRACT_ADDRESS` is empty, the app runs in demo mode with sample markets.

## Deploying the Contract

1. Connect a wallet to Bradbury testnet, chain ID 4221.
2. Open `/deploy` in the app.
3. Click "Deploy to Bradbury" and approve the wallet transaction.
4. Add the new contract address to `.env`.

## Contract Methods

| Method | Type | Description |
|--------|------|-------------|
| `create_market` | write | Creates a prediction market. |
| `bet` | payable | Places a YES or NO bet with GEN. |
| `resolve_market` | write | Fetches evidence and resolves the outcome. |
| `claim_winnings` | write | Sends winnings or refunds after resolution. |
| `list_markets` | view | Lists all markets with pool data. |
| `get_market` | view | Returns one market by ID. |
| `get_bet` | view | Returns a user's bet and claim status. |

## Project Structure

```text
predict-the-future/
  contracts/
    prediction_market.py
  src/
    app/
    components/
    lib/
      contract.ts
      genlayer.ts
      format.ts
      env.ts
      types.ts
  package.json
```

## Network Details

| Setting | Value |
|---------|-------|
| Network | GenLayer Bradbury Testnet |
| Chain ID | 4221 |
| RPC | https://rpc-bradbury.genlayer.com |
| Explorer | https://explorer-bradbury.genlayer.com |
| Faucet | https://testnet-faucet.genlayer.foundation |

## Verification

The contract passes GenVM lint:

```text
Lint passed (3 checks)
Validation passed
Contract: PredictionMarket
Methods: 7 (3 view, 4 write)
```

## License

MIT
