"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getLiveMarkets } from "@/lib/contract";
import type { Market } from "@/lib/types";

export function MarketListView() {
  const [markets, setMarkets] = useState<Market[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const live = await getLiveMarkets();
        setMarkets(live);
      } catch (err) {
        console.error(err);
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

      {markets.length === 0 ? (
        <div className="text-zinc-600 dark:text-zinc-400 text-center py-12 border border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900 shadow-sm">
          No markets found. Be the first to create one!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {markets.map(m => (
            <Link key={m.id} href={`/markets/${m.id}`}>
              <div className="group rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-6 transition-all hover:shadow-md dark:hover:shadow-zinc-950 hover:-translate-y-1 relative overflow-hidden">
                <div className="relative">
                  <div className="mb-4 flex items-center justify-between border-b border-zinc-200 dark:border-zinc-800 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Market #{m.id}</span>
                    <span className={`rounded-md px-2 py-1 text-xs font-medium uppercase tracking-wider ${m.status === 'open' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-400'}`}>
                      {m.status}
                    </span>
                  </div>
                  <h3 className="mb-4 text-lg font-bold text-zinc-900 dark:text-zinc-50 leading-snug line-clamp-2">{m.question}</h3>
                  
                  <div className="mt-4 flex flex-col gap-2 rounded-xl bg-zinc-50 dark:bg-zinc-950/50 border border-zinc-100 dark:border-zinc-800/50 p-3">
                     <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Pool YES</span>
                        <span className="text-zinc-900 dark:text-zinc-50 font-mono font-medium">{Number(BigInt(m.poolYes)) / 1e18} GEN</span>
                     </div>
                     <div className="flex justify-between items-center text-sm text-zinc-600 dark:text-zinc-400">
                        <span className="font-medium">Pool NO</span>
                        <span className="text-zinc-900 dark:text-zinc-50 font-mono font-medium">{Number(BigInt(m.poolNo)) / 1e18} GEN</span>
                     </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
