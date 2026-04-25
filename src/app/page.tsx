import Link from "next/link";
import { Database, ArrowRight, BrainCircuit, Globe, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="space-y-12">
      {/* --- HERO SECTION --- */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-indigo-50/50 via-white to-emerald-50/50 dark:from-indigo-950/20 dark:via-zinc-900 dark:to-emerald-950/20 border border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-200/20 dark:shadow-zinc-950 p-8 md:p-16 lg:p-20">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-blue-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-emerald-400/10 blur-3xl" />

        <div className="relative max-w-5xl space-y-10">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-900/30 px-4 py-1.5 text-sm font-medium text-blue-700 dark:text-blue-400 shadow-sm">
                <BrainCircuit className="h-4 w-4" />
                Next-Generation Consensus Engine
            </div>
            
            <h1 className="max-w-[14ch] text-5xl font-extrabold leading-[1.1] tracking-tight text-zinc-900 dark:text-zinc-50 md:text-7xl lg:text-[5rem]">
              Predict the <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-500">Future.</span>
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400 md:text-xl font-light">
              Create and trade on the outcome of any event. 
              Our autonomous AI agents browse the web, verify facts, and resolve markets instantly—no human middlemen required.
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row w-full sm:w-auto pt-4">
            <Link
              href="/markets"
              className="group inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-blue-600 px-8 py-4 text-base font-bold text-white shadow-md shadow-blue-500/20 transition-all hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98]"
            >
              Explore Markets
            </Link>
            <Link
              href="/create-market"
              className="group inline-flex w-full sm:w-auto items-center justify-center rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-8 py-4 text-base font-bold text-zinc-800 dark:text-zinc-200 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:scale-[1.02] active:scale-[0.98]"
            >
              <span className="flex items-center gap-2">
                Create a Market <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Section */}
      <section className="grid gap-6 md:grid-cols-3 pt-8">
        {[
          {
            title: "Autonomous Agents",
            description: "Markets are resolved by independent AI agents that gather real-time data from across the web.",
            icon: Globe,
            color: "text-blue-500 dark:text-blue-400",
            bg: "bg-blue-50 dark:bg-blue-950"
          },
          {
            title: "Zero Dispute Delays",
            description: "No more waiting days for human committees to vote. Consensus is reached in minutes.",
            icon: Activity,
            color: "text-emerald-500 dark:text-emerald-400",
            bg: "bg-emerald-50 dark:bg-emerald-950"
          },
          {
            title: "Verifiable Truth",
            description: "Every resolution comes with cryptographically verifiable proofs and source citations.",
            icon: Database,
            color: "text-purple-500 dark:text-purple-400",
            bg: "bg-purple-50 dark:bg-purple-950"
          },
        ].map((item) => (
          <div
            key={item.title}
            className="group bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-[2rem] p-8 transition-all hover:-translate-y-1 hover:shadow-md dark:hover:shadow-zinc-950"
          >
            <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${item.bg} ${item.color}`}>
              <item.icon className="h-7 w-7" />
            </div>
            <h3 className="mb-3 text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {item.title}
            </h3>
            <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed">
              {item.description}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
