"use client";

import { useEffect, useState, useCallback } from "react";
import { parseEther } from "viem";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getLiveMarketById, getLiveBet, placeBet, resolveMarket, claimWinnings } from "@/lib/contract";
import { formatGen } from "@/lib/format";
import type { Market } from "@/lib/types";
import { useAccount } from "wagmi";

function getYesProbability(m: Market): number {
  const yes = Number(BigInt(m.poolYes || "0"));
  const no = Number(BigInt(m.poolNo || "0"));
  const total = yes + no;
  if (total === 0) return 50;
  return Math.round((yes / total) * 100);
}

export function MarketDetailView({ id }: { id: string }) {
  const [market, setMarket] = useState<Market | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txError, setTxError] = useState<string | null>(null);
  const [txSuccess, setTxSuccess] = useState<string | null>(null);
  const [betAmount, setBetAmount] = useState<string>("10");
  const { address: account } = useAccount();
  const [isTxPending, setIsTxPending] = useState(false);
  const [userBet, setUserBet] = useState<{bet_yes: string, bet_no: string, claimed: boolean} | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await getLiveMarketById(id);
      setMarket(data);
      if (account && data) {
         const bet = await getLiveBet(id, account);
         setUserBet(bet);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load market");
    }
  }, [id, account]);

  useEffect(() => {
    // eslint-disable-next-line
    load();
  }, [load]);

  function clearMessages() {
    setTxError(null);
    setTxSuccess(null);
  }

  async function handleBet(isYes: boolean) {
    clearMessages();
    if (!account) { setTxError("Please connect your wallet first."); return; }
    try {
      setIsTxPending(true);
      await placeBet(account, id, isYes, parseEther(betAmount));
      setTxSuccess(`Successfully bet ${betAmount} GEN on ${isYes ? "YES" : "NO"}!`);
      await load();
    } catch (err: any) {
      setTxError(err.message || "Failed to place bet");
    } finally {
      setIsTxPending(false);
    }
  }

  async function handleResolve() {
    clearMessages();
    if (!account) { setTxError("Please connect your wallet first."); return; }
    try {
      setIsTxPending(true);
      await resolveMarket(account, id);
      setTxSuccess("Market resolved successfully!");
      await load();
    } catch (err: any) {
      setTxError(err.message || "Failed to resolve market");
    } finally {
      setIsTxPending(false);
    }
  }

  async function handleClaim() {
    clearMessages();
    if (!account) { setTxError("Please connect your wallet first."); return; }
    try {
      setIsTxPending(true);
      await claimWinnings(account, id);
      setTxSuccess("Winnings claimed successfully!");
      await load();
    } catch (err: any) {
      setTxError(err.message || "Failed to claim winnings");
    } finally {
      setIsTxPending(false);
    }
  }

  if (error) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/markets" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Markets
      </Link>
      <div className="text-rose-500 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-sm font-medium">{error}</div>
    </div>
  );

  if (!market) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <Link href="/markets" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Markets
      </Link>
      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 animate-pulse space-y-4">
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/4" />
        <div className="h-6 bg-zinc-200 dark:bg-zinc-800 rounded w-3/4" />
        <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-full" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-950 rounded-xl w-full" />
      </div>
    </div>
  );

  const yesPct = getYesProbability(market);
  const noPct = 100 - yesPct;

  return (
    <div className="space-y-4 max-w-2xl mx-auto">
      <Link href="/markets" className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back to Markets
      </Link>

      <div className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8">
        <div className="flex justify-between items-center mb-6 border-b border-zinc-200 dark:border-zinc-800 pb-4">
           <span className="text-blue-600 dark:text-blue-400 text-sm font-semibold tracking-wider">Market #{market.id}</span>
           <span className={`px-3 py-1 rounded-md text-xs font-semibold uppercase ${market.status === 'open' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>{market.status}</span>
        </div>
        
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 leading-snug">{market.question}</h1>
        <p className="text-zinc-600 dark:text-zinc-400 mb-6">{market.description}</p>

        {/* Probability Bar */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between text-sm font-bold">
            <span className="text-blue-600 dark:text-blue-400">YES {yesPct}%</span>
            <span className="text-rose-500 dark:text-rose-400">NO {noPct}%</span>
          </div>
          <div className="h-4 w-full rounded-full bg-rose-200 dark:bg-rose-900/40 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-700"
              style={{ width: `${yesPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            <span>{formatGen(market.poolYes)} in YES pool</span>
            <span>{formatGen(market.poolNo)} in NO pool</span>
          </div>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-5 mb-8 border border-zinc-200 dark:border-zinc-800 space-y-3">
           <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium">Resolution Source</div>
           <a href={market.resolutionUrl} target="_blank" rel="noreferrer" className="text-blue-600 dark:text-blue-400 text-sm hover:underline break-all">{market.resolutionUrl}</a>
           <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mt-4">Resolve After</div>
           <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{new Date(Number(market.resolveAfterTimestamp) * 1000).toLocaleString()}</div>
        </div>

        {/* Transaction Feedback */}
        {txError && (
          <div className="mb-6 rounded-xl border border-rose-200 dark:border-rose-800 bg-rose-50 dark:bg-rose-950/30 p-4 text-sm font-medium text-rose-600 dark:text-rose-400 flex items-start gap-3">
            <span className="shrink-0 mt-0.5">⚠️</span>
            <div>
              <div className="font-semibold mb-1">Transaction Failed</div>
              <div className="text-rose-500 dark:text-rose-300 text-xs break-all">{txError}</div>
            </div>
            <button onClick={() => setTxError(null)} className="ml-auto shrink-0 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300">✕</button>
          </div>
        )}
        {txSuccess && (
          <div className="mb-6 rounded-xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/30 p-4 text-sm font-medium text-emerald-600 dark:text-emerald-400 flex items-start gap-3">
            <span className="shrink-0 mt-0.5">✅</span>
            <div>{txSuccess}</div>
            <button onClick={() => setTxSuccess(null)} className="ml-auto shrink-0 text-emerald-400 hover:text-emerald-600 dark:hover:text-emerald-300">✕</button>
          </div>
        )}

        {market.status === 'open' && (
           <div className="bg-blue-50/50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/50 rounded-xl p-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-4">Place your bet</h3>
              <div className="flex gap-4 items-center mb-6">
                 <input 
                    type="number"
                    value={betAmount}
                    onChange={(e) => setBetAmount(e.target.value)}
                    className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-50 font-mono flex-1 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 shadow-sm"
                    placeholder="GEN Amount"
                    min="0"
                    step="any"
                 />
                 <span className="text-zinc-600 dark:text-zinc-400 font-semibold">GEN</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                 <button disabled={isTxPending} onClick={() => handleBet(true)} className="flex-1 bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]">
                   {isTxPending ? "Processing..." : "Bet YES"}
                 </button>
                 <button disabled={isTxPending} onClick={() => handleBet(false)} className="flex-1 bg-rose-500 text-white font-semibold py-3 rounded-lg hover:bg-rose-600 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]">
                   {isTxPending ? "Processing..." : "Bet NO"}
                 </button>
              </div>
           </div>
        )}

        {market.status === 'resolved' && (
           <div className="bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-6 space-y-5">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">Market Resolved</h3>
              <div className="flex gap-4">
                 <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 flex-1 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-1">Outcome</div>
                    <div className={`text-xl font-bold uppercase ${market.outcome === 'yes' ? 'text-blue-600 dark:text-blue-400' : market.outcome === 'no' ? 'text-rose-500 dark:text-rose-400' : 'text-zinc-400 dark:text-zinc-500'}`}>{market.outcome}</div>
                 </div>
              </div>
              {market.aiReasoning && (
                <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                   <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-2">AI Reasoning</div>
                   <p className="text-sm text-zinc-900 dark:text-zinc-100 leading-relaxed">{market.aiReasoning}</p>
                </div>
              )}
           </div>
        )}

        {account && userBet && (userBet.bet_no !== '0' || userBet.bet_yes !== '0') && (
           <div className="mt-8 border-t border-zinc-200 dark:border-zinc-800 pt-6">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-50 mb-4">Your Position</h4>
              <div className="flex justify-between items-center bg-zinc-50 dark:bg-zinc-950/50 rounded-xl p-5 border border-zinc-200 dark:border-zinc-800 shadow-sm">
                 <div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-1">YES Bet</div>
                    <div className="font-mono text-blue-600 dark:text-blue-400 font-semibold">{formatGen(userBet.bet_yes)}</div>
                 </div>
                 <div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-1">NO Bet</div>
                    <div className="font-mono text-rose-500 dark:text-rose-400 font-semibold">{formatGen(userBet.bet_no)}</div>
                 </div>
              </div>
              
              {market.status === 'resolved' && !userBet.claimed && (
                 <button disabled={isTxPending} onClick={handleClaim} className="mt-6 w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-all shadow-sm active:scale-[0.98]">
                   {isTxPending ? "Claiming..." : "Claim Winnings"}
                 </button>
              )}
              {market.status === 'resolved' && userBet.claimed && (
                 <div className="mt-6 text-center text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 rounded-lg py-3 border border-emerald-200 dark:border-emerald-800">✅ Winnings Claimed</div>
              )}
           </div>
        )}

        {market.status === 'open' && (
           <div className="mt-8 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex justify-end">
              <button disabled={isTxPending} onClick={handleResolve} className="text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 transition-colors border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 bg-white dark:bg-zinc-900 shadow-sm active:scale-[0.98]">
                {isTxPending ? "Resolving..." : "Trigger AI Resolution"}
              </button>
           </div>
        )}
      </div>
    </div>
  );
}
