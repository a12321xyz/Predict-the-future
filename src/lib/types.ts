export type MarketStatus = "open" | "resolved";
export type MarketOutcome = "yes" | "no" | "invalid" | "none";
export type DataSource = "live" | "demo";

export interface Market {
  id: string;
  creator: string;
  question: string;
  description: string;
  resolutionUrl: string;
  resolveAfterTimestamp: string;
  status: MarketStatus;
  outcome: MarketOutcome;
  aiReasoning: string;
  poolYes: string;
  poolNo: string;
  createdAt?: string;
  source: DataSource;
}

export interface DemoTemplate {
  id: string;
  question: string;
  description: string;
  resolutionUrl: string;
}

export interface CreateMarketFormValues {
  question: string;
  description: string;
  resolutionUrl: string;
  resolveAfterLocal: string;
}

export interface WriteResult {
  hash: `0x${string}`;
}

