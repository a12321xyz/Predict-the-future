"use client";

import { useState } from "react";
import { createClient } from "genlayer-js";
import { testnetBradbury } from "genlayer-js/chains";
import { TransactionStatus } from "genlayer-js/types";
import { applyWalletShim } from "@/lib/genlayer";

export default function DeployPage() {
  const [status, setStatus] = useState<string>("Ready to deploy");
  const [contractAddress, setContractAddress] = useState<string>("");
  const [isDeploying, setIsDeploying] = useState(false);

  const deploy = async () => {
    try {
      setIsDeploying(true);
      setStatus("Fetching contract code...");
      const res = await fetch("/api/contract");
      const { code } = await res.json();

      if (!code) throw new Error("Could not load contract code");

      setStatus("Connecting to wallet...");
      if (!window.ethereum) throw new Error("No wallet detected (MetaMask, Rabby, etc.)");

      // Apply wallet shim for non-MetaMask wallets (Rabby, etc.)
      applyWalletShim();

      const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });

      setStatus("Deploying to Bradbury (Please approve in wallet)...");
      const client = createClient({
        chain: testnetBradbury,
        endpoint: process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://rpc-bradbury.genlayer.com",
        provider: window.ethereum as never,
        account: account,
      });

      // Required for wallet-based transactions on GenLayer
      await client.connect("testnetBradbury");

      const hash = await client.deployContract({
        code: code,
      });

      setStatus(`Transaction sent! Waiting for acceptance... Hash: ${hash}`);
      
      const receipt = await client.waitForTransactionReceipt({
        hash: hash as never,
        status: TransactionStatus.ACCEPTED,
        interval: 5_000,
        retries: 60,
      });
      
      setStatus("Deployed successfully!");
      const decoded = receipt.txDataDecoded as any;
      if (decoded?.contractAddress) {
        setContractAddress(decoded.contractAddress);
      } else if (receipt.recipient) {
        setContractAddress(receipt.recipient);
      }
    } catch (error: any) {
      console.error(error);
      setStatus(`Error: ${error.message || "Deployment failed"}`);
    } finally {
      setIsDeploying(false);
    }
  };


  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">Deploy Contract</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">
          Deploy the PredictionMarket contract directly from your browser. Make sure your wallet is connected to Bradbury Testnet (Chain ID 4221).
        </p>
      </div>

      <button
        onClick={deploy}
        disabled={isDeploying}
        className="w-full sm:w-auto rounded-xl bg-blue-600 px-8 py-3.5 font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 shadow-sm hover:shadow-md active:scale-[0.98]"
      >
        {isDeploying ? "Deploying..." : "Deploy to Bradbury"}
      </button>

      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-sm space-y-6">
        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Status</h2>
          <p className={`text-sm font-medium ${status.startsWith("Error") ? "text-rose-500 dark:text-rose-400" : status.includes("success") ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-50"}`}>{status}</p>
        </div>

        <div>
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Finding Your Contract</h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Open your wallet, click the &quot;Contract Deployment&quot; transaction you just approved, and click &quot;View on block explorer&quot;. Your contract address will be there.
          </p>
        </div>

        {contractAddress && (
          <div className="space-y-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Contract Address</h2>
            <div className="rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 font-mono text-sm text-zinc-900 dark:text-zinc-50 break-all">
              {contractAddress}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              ✅ Copy this address and put it in your <code className="text-blue-600 dark:text-blue-400 font-semibold">.env</code> file under <code className="text-blue-600 dark:text-blue-400 font-semibold">NEXT_PUBLIC_CONTRACT_ADDRESS</code>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
