"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { getLiveMarkets } from "@/lib/contract";
import { formatGen } from "@/lib/format";
import type { Market } from "@/lib/types";

function getYesProbability(m: Market): number {
  const yes = Number(BigInt(m.poolYes || "0"));
  const no = Number(BigInt(m.poolNo || "0"));
  const total = yes + no;
  if (total === 0) return 50;
  return Math.round((yes / total) * 100);
}

export function MarketListView() {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const searchParams = useSearchParams();
  const isPending = searchParams.get("pending") === "true";

  useEffect(() => {
    async function load() {
      try {
        const live = await getLiveMarkets();
        setMarkets(live);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">Prediction Markets</h1>
        <Link href="/create-market" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors shadow-sm">
          Create Market
        </Link>
      </div>

      {isPending && (
        <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm font-medium text-blue-600 dark:text-blue-400 flex items-start gap-3">
          <span className="shrink-0 mt-0.5">ℹ️</span>
          <div className="flex-1">Your transaction has been submitted to the GenLayer network! It may take a few minutes for the new market to be finalized and appear below. You can safely refresh this page later.</div>
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 animate-pulse">
              <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded w-1/3 mb-4" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
              <div className="h-5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3 mb-6" />
              <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded w-full mb-2" />
              <div className="h-8 bg-zinc-100 dark:bg-zinc-950 rounded-xl w-full" />
            </div>
          ))}
        </div>
      ) : markets.length === 0 ? (
        <div className="text-zinc-600 dark:text-zinc-400 text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
          No markets found. Be the first to create one!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {markets.map(m => {
            const yesPct = getYesProbability(m);
            const noPct = 100 - yesPct;
            return (
              <Link key={m.id} href={`/markets/${m.id}`}>
                <div className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 transition-all hover:shadow-md dark:hover:shadow-zinc-950 hover:-translate-y-1 relative overflow-hidden h-full">
                  <div className="relative">
                    <div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                      <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Market #{m.id}</span>
                      <span className={`rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider ${m.status === 'open' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'}`}>
                        {m.status}
                      </span>
                    </div>
                    <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">{m.question}</h3>
                    
                    {/* Probability Bar */}
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-blue-600 dark:text-blue-400">YES {yesPct}%</span>
                        <span className="text-rose-500 dark:text-rose-400">NO {noPct}%</span>
                      </div>
                      <div className="h-2.5 w-full rounded-full bg-rose-200 dark:bg-rose-900/40 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
                          style={{ width: `${yesPct}%` }}
                        />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50 p-3">
                       <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Pool YES</span>
                          <span className="text-zinc-900 dark:text-zinc-50 font-mono font-medium">{formatGen(m.poolYes)}</span>
                       </div>
                       <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
                          <span className="font-medium">Pool NO</span>
                          <span className="text-zinc-900 dark:text-zinc-50 font-mono font-medium">{formatGen(m.poolNo)}</span>
                       </div>
                    </div>

                    {m.source === "demo" && (
                      <div className="mt-3 text-center">
                        <span className="text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">Demo</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
