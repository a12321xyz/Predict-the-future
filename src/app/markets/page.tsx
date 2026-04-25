import { Suspense } from "react";
import { MarketListView } from "@/components/market-list-view";

export default function MarketsPage() {
  return (
    <Suspense fallback={<div className="text-center py-12">Loading markets...</div>}>
      <MarketListView />
    </Suspense>
  );
}
