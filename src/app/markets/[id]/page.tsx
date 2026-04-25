import { MarketDetailView } from "@/components/market-detail-view";

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <MarketDetailView id={id} />;
}
