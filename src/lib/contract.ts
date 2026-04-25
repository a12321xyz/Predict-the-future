import type { Address } from "viem";

import { appConfig } from "@/lib/env";
import { getReadClient, getWriteClient, waitForFinalizedTransaction } from "@/lib/genlayer";
import type { Market, WriteResult } from "@/lib/types";

type ContractArg =
  | null
  | boolean
  | number
  | bigint
  | string
  | Uint8Array
  | ContractArg[]
  | { [key: string]: ContractArg };

function requireContractAddress() {
  if (!appConfig.contractAddress) {
    throw new Error("Set NEXT_PUBLIC_CONTRACT_ADDRESS to enable live on-chain actions.");
  }

  return appConfig.contractAddress;
}

function parseJson<T>(value: unknown, caller: string): T {
  console.log(`[Contract:${caller}] raw:`, value);
  if (typeof value !== "string") {
    throw new Error(`Unexpected contract response from ${caller}.`);
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    throw new Error(`Malformed JSON from ${caller}.`);
  }
}

function mapMarket(input: {
  id: string;
  creator: string;
  question: string;
  description: string;
  resolution_url: string;
  resolve_after_timestamp: string;
  status: Market["status"];
  outcome: Market["outcome"];
  ai_reasoning: string;
  pool_yes: string;
  pool_no: string;
}): Market {
  return {
    id: input.id,
    creator: input.creator,
    question: input.question,
    description: input.description,
    resolutionUrl: input.resolution_url,
    resolveAfterTimestamp: input.resolve_after_timestamp,
    status: input.status,
    outcome: input.outcome,
    aiReasoning: input.ai_reasoning,
    poolYes: input.pool_yes,
    poolNo: input.pool_no,
    source: "live",
  };
}

async function readJson(functionName: string, args: ContractArg[] = []) {
  const client = getReadClient();

  return client.readContract({
    address: requireContractAddress(),
    functionName,
    args,
  });
}

async function write(
  account: Address,
  functionName: string,
  args: ContractArg[] = [],
  value = 0n,
): Promise<WriteResult> {
  const client = await getWriteClient(account);
  const hash = await client.writeContract({
    address: requireContractAddress(),
    functionName,
    args,
    value,
  });

  await waitForFinalizedTransaction(client, hash);

  return { hash };
}

export const testMarkets: Market[] = [
  {
    id: "1001",
    creator: "0x1234567890123456789012345678901234567890",
    question: "Will Bitcoin reach $100k by December 31, 2026?",
    description: "Resolves to Yes if Coindesk reports Bitcoin price reaching or exceeding 100,000 USD at any point before Dec 31, 2026.",
    resolutionUrl: "https://www.coindesk.com/price/bitcoin",
    resolveAfterTimestamp: (Math.floor(Date.now() / 1000) + 86400).toString(),
    status: "open",
    outcome: "none",
    aiReasoning: "",
    poolYes: "150000000000000000000",
    poolNo: "50000000000000000000",
    source: "demo",
  },
  {
    id: "1002",
    creator: "0x1234567890123456789012345678901234567890",
    question: "Will AI Studio release Gen 4.0 models?",
    description: "Resolves to Yes if an official blog post announces Gen 4.0 models from Gemini.",
    resolutionUrl: "https://blog.google/technology/ai/",
    resolveAfterTimestamp: (Math.floor(Date.now() / 1000) - 86400).toString(),
    status: "resolved",
    outcome: "yes",
    aiReasoning: "Based on the official blog post at the provided URL, the Gen 4.0 models were successfully announced.",
    poolYes: "35000000000000000000",
    poolNo: "12000000000000000000",
    source: "demo",
  },
];

export async function getLiveMarkets() {
  let items: Market[] = [];
  try {
    const raw = await readJson("list_markets");
    const parsed = parseJson<
      Array<{
        id: string;
        creator: string;
        question: string;
        description: string;
        resolution_url: string;
        resolve_after_timestamp: string;
        status: Market["status"];
        outcome: Market["outcome"];
        ai_reasoning: string;
        pool_yes: string;
        pool_no: string;
      }>
    >(raw, "list_markets");
    
    items = parsed.map(mapMarket);
  } catch (err) {
    console.warn("Failed to load live markets, falling back to test markets.", err);
  }

  return [...items.sort((left, right) => Number(right.id) - Number(left.id)), ...testMarkets];
}

export async function getLiveMarketById(id: string) {
  const testMarket = testMarkets.find((m) => m.id === id);
  if (testMarket) return testMarket;

  try {
    const raw = await readJson("get_market", [BigInt(id)]);
    const parsed = parseJson<
      | {
          id: string;
          creator: string;
          question: string;
          description: string;
          resolution_url: string;
          resolve_after_timestamp: string;
          status: Market["status"];
          outcome: Market["outcome"];
          ai_reasoning: string;
          pool_yes: string;
          pool_no: string;
        }
      | null
    >(raw, "get_market");

    return parsed ? mapMarket(parsed) : null;
  } catch {
    return null;
  }
}

export async function getLiveBet(id: string, userAddress: string) {
  const testMarket = testMarkets.find((m) => m.id === id);
  if (testMarket) return { bet_yes: "10000000000000000000", bet_no: "0", claimed: false };

  try {
    const raw = await readJson("get_bet", [BigInt(id), userAddress]);
    const parsed = parseJson<
      | {
          bet_yes: string;
          bet_no: string;
          claimed: boolean;
        }
      | null
    >(raw, "get_bet");
    return parsed;
  } catch {
    return null;
  }
}

export function createMarket(account: Address, question: string, description: string, resolutionUrl: string, resolveAfterTimestamp: bigint) {
  return write(account, "create_market", [
    question,
    description,
    resolutionUrl,
    resolveAfterTimestamp,
  ]);
}

export function placeBet(account: Address, marketId: string, isYes: boolean, valueWei: bigint) {
  return write(account, "bet", [BigInt(marketId), isYes], valueWei);
}

export function resolveMarket(account: Address, marketId: string) {
  return write(account, "resolve_market", [BigInt(marketId)]);
}

export function claimWinnings(account: Address, marketId: string) {
  return write(account, "claim_winnings", [BigInt(marketId)]);
}
