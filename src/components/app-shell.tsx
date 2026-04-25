"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ConnectWalletButton } from "@/components/connect-wallet-button";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/markets", label: "Markets" },
  { href: "/create-market", label: "Create Market" },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="relative min-h-screen text-zinc-900 dark:text-zinc-50 font-sans bg-zinc-50 dark:bg-zinc-950 pt-24 md:pt-28">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="/" className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 transition-colors hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
                  PF
                </div>
                PredictTheFuture
              </Link>
              <div className="hidden h-6 w-px bg-zinc-200 dark:bg-zinc-800 md:block" />
              <nav className="hidden items-center gap-1 md:flex">
                {navItems.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full px-5 py-2.5 text-sm font-semibold transition-all ${
                        active
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10 dark:ring-blue-400/20"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <div className="hidden sm:block">
                <ConnectWalletButton />
              </div>
            </div>
          </div>
          {/* Mobile Navigation Row & Wallet Button */}
          <div className="mt-3 flex items-center justify-between gap-3 md:hidden pb-1">
             <nav className="flex items-center gap-2 overflow-x-auto no-scrollbar flex-1">
                {navItems.map((item) => {
                  const active =
                    item.href === "/"
                      ? pathname === "/"
                      : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`rounded-full whitespace-nowrap px-4 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 shadow-sm ring-1 ring-blue-500/10 dark:ring-blue-400/20"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-50"
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
             </nav>
             <div className="flex items-center gap-2 shrink-0">
               <ConnectWalletButton />
             </div>
          </div>
        </div>
      </header>

      <div className="relative mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <main>{children}</main>

        <footer className="mt-20 border-t border-zinc-200 dark:border-zinc-800 py-10 flex flex-col items-center justify-center gap-4 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
               <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
               <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <span>GenLayer Testnet Operational</span>
          </div>
          <p>Powered by GenLayer Intelligent Contracts</p>
        </footer>
      </div>
    </div>
  );
}
