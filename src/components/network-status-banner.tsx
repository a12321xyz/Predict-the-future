"use client";

import { useQuery } from "@tanstack/react-query";
import { appConfig } from "@/lib/env";

export function NetworkStatusBanner() {
  const { data: balance, isLoading, isError } = useQuery({
    queryKey: ["network-health"],
    queryFn: async () => {
        // Simple ping or balance check to verify network health
        // This is a placeholder for actual health check logic
        return "Connected";
    },
    refetchInterval: 30000,
  });

  return (
    <div className="relative mb-8 overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-4 transition-all duration-300 group hover:shadow-md dark:hover:shadow-zinc-950">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-blue-600/5 opacity-0 transition-opacity group-hover:opacity-100" />
      <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-2.5 w-2.5">
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${isError ? 'bg-rose-400' : 'bg-blue-600'}`}></span>
            <span className={`relative inline-flex h-2.5 w-2.5 rounded-full ${isError ? 'bg-rose-500' : 'bg-blue-600'}`}></span>
          </div>
          <p className="font-medium text-zinc-900 dark:text-zinc-50 text-sm tracking-wide">
            Network: <span className="text-zinc-600 dark:text-zinc-400 capitalize font-normal">{appConfig.network}</span>
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <p className="hidden font-medium text-zinc-900 dark:text-zinc-50 text-sm tracking-wide md:inline">
            Contract: <span className="font-mono text-zinc-600 dark:text-zinc-400 font-normal">{appConfig.contractAddress ? `${appConfig.contractAddress.slice(0, 6)}...${appConfig.contractAddress.slice(-4)}` : "Not Deployed"}</span>
          </p>
          <span className={`rounded-xl px-3 py-1 font-medium text-xs tracking-wide ${isError ? 'bg-rose-500/10 text-rose-500' : 'bg-blue-600/15 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}>
            {isError ? "CONGESTED" : "OPERATIONAL"}
          </span>
        </div>
      </div>
    </div>
  );
}
