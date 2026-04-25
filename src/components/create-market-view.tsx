"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createMarket } from "@/lib/contract";
import { useAccount } from "wagmi";

export function CreateMarketView() {
  const router = useRouter();
  const { address: account } = useAccount();
  const [isPending, setIsPending] = useState(false);
  const [formData, setFormData] = useState({
     question: "",
     description: "",
     resolutionUrl: "",
     resolveAfterLocal: ""
  });

  async function handleSubmit(e: React.FormEvent) {
     e.preventDefault();
     if (!account) return alert("Please connect your wallet");
     
     const resolveAfterTimestamp = Math.floor(new Date(formData.resolveAfterLocal).getTime() / 1000);
     
     try {
       setIsPending(true);
       await createMarket(account, formData.question, formData.description, formData.resolutionUrl, BigInt(resolveAfterTimestamp));
       router.push("/markets");
     } catch (err: any) {
       alert(err.message || "Failed to create market");
     } finally {
       setIsPending(false);
     }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">Create a Prediction Market</h1>
        <p className="text-zinc-600 dark:text-zinc-400 text-sm">Deploy an AI-resolved prediction market on the GenLayer testnet.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 text-zinc-900 dark:text-zinc-50">
           {/* Abstract generic icon */}
           <svg width="120" height="120" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L2 22h20L12 2zm0 4.5l6.5 13h-13L12 6.5z"/>
           </svg>
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Market Question</label>
          <input 
             required 
             value={formData.question}
             onChange={e => setFormData({...formData, question: e.target.value})}
             className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-50 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
             placeholder="e.g. Will SpaceX launch Starship in May 2026?"
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Description</label>
          <textarea 
             required 
             value={formData.description}
             onChange={e => setFormData({...formData, description: e.target.value})}
             rows={4}
             className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-50 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 transition-all resize-none shadow-sm"
             placeholder="Provide more details about the market condition..."
          />
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Resolution Source (URL)</label>
          <input 
             required 
             type="url"
             value={formData.resolutionUrl}
             onChange={e => setFormData({...formData, resolutionUrl: e.target.value})}
             className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-50 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm"
             placeholder="e.g. https://www.spacex.com/launches/"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">The AI will read this page to resolve the market.</p>
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">Resolution Date / Deadline</label>
          <input 
             required 
             type="datetime-local"
             value={formData.resolveAfterLocal}
             onChange={e => setFormData({...formData, resolveAfterLocal: e.target.value})}
             className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-lg px-4 py-3 text-zinc-900 dark:text-zinc-50 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
          />
        </div>

        <div className="pt-4 relative z-10">
           <button 
              disabled={isPending || !account}
              type="submit" 
              className="w-full bg-blue-600 text-white font-semibold py-3.5 rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
           >
              {isPending ? "Deploying Market..." : "Deploy Prediction Market"}
           </button>
        </div>
      </form>
    </div>
  );
}
