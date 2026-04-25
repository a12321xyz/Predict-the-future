"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";

import { formatAddress } from "@/lib/format";

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const connector = connectors[0];

  if (isConnected && address) {
    return (
      <button
        type="button"
        onClick={() => disconnect()}
        className="group flex items-center gap-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-4 py-2 text-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 shadow-sm"
      >
        <span className="font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            {formatAddress(address)}
        </span>
        <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 transition-colors group-hover:text-rose-500 dark:group-hover:text-rose-400">
            Disconnect
        </span>
      </button>
    );
  }

  return (
    <button
      type="button"
      disabled={!connector || isPending}
      onClick={() => connector && connect({ connector })}
      className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-all hover:bg-blue-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60 shadow-sm hover:shadow"
    >
      <span className="relative">
        {isPending ? "Connecting..." : "Connect Wallet"}
      </span>
    </button>
  );
}
