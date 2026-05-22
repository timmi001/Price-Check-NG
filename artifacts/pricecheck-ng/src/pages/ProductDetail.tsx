import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { motion } from "framer-motion";
import { ArrowLeft, TrendingDown, TrendingUp, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import VendorCard from "@/components/VendorCard";
import PriceTrendChart from "@/components/PriceTrendChart";
import {
  useGetProduct,
  getGetProductQueryKey,
  useListPrices,
  useGetPriceHistory,
  useGetPriceSummary,
  useCreateAlert,
} from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductDetail() {
  const params = useParams<{ id: string }>();
  const productId = parseInt(params.id ?? "0", 10);
  const [, setLocation] = useLocation();
  const [sortOrder, setSortOrder] = useState("low_to_high");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const hasId = productId > 0;

  const { data: product, isLoading: productLoading } = useGetProduct(productId, {
    query: { enabled: hasId, queryKey: getGetProductQueryKey(productId) },
  });

  const { data: prices, isLoading: pricesLoading } = useListPrices(
    { product_id: productId, sort: sortOrder as "low_to_high" | "high_to_low" | "nearest" | "recently_updated" },
    { query: { enabled: hasId } }
  );

  const { data: history, isLoading: historyLoading } = useGetPriceHistory(
    { product_id: productId },
    { query: { enabled: hasId } }
  );

  const { data: summary } = useGetPriceSummary(
    { product_id: productId },
    { query: { enabled: hasId } }
  );

  const createAlert = useCreateAlert();

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail && alertPrice && hasId) {
      createAlert.mutate(
        { data: { product_id: productId, target_price: Number(alertPrice), email: alertEmail } },
        { onSuccess: () => setAlertSubmitted(true) }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={() => setLocation("/")} data-testid="back-button">
          <ArrowLeft className="w-4 h-4" /> Back to results
        </Button>

        {/* Product header */}
        <div className="mb-6">
          {productLoading ? (
            <Skeleton className="h-20 rounded-xl" />
          ) : product ? (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-4">
              <div className="w-16 h-16 bg-muted rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                {product.category_name === "Gas & Fuel" ? "⛽" :
                 product.category_name === "Phones" ? "📱" :
                 product.category_name === "Beverages" ? "☕" : "🛒"}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-foreground" data-testid="product-name">{product.name}</h1>
                  {product.category_name && (
                    <Badge variant="secondary" className="text-xs">{product.category_name}</Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm mt-0.5">{product.unit}</p>
                {product.description && <p className="text-sm text-muted-foreground mt-1">{product.description}</p>}
                <div className="flex items-center gap-4 mt-2 text-sm flex-wrap">
                  {summary && (
                    <>
                      <span>
                        <span className="text-muted-foreground">Avg: </span>
                        <span className="font-bold text-foreground" data-testid="avg-price">{formatNaira(summary.average_price)}</span>
                      </span>
                      <span>
                        <span className="text-muted-foreground">Best: </span>
                        <span className="font-bold text-primary" data-testid="min-price">{formatNaira(summary.min_price)}</span>
                      </span>
                      <span className={`flex items-center gap-0.5 text-xs font-semibold ${summary.price_change_pct > 0 ? "text-destructive" : "text-primary"}`}>
                        {summary.price_change_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(summary.price_change_pct)}% vs last month
                      </span>
                    </>
                  )}
                  {product.vendor_count != null && (
                    <span className="text-muted-foreground text-xs">{product.vendor_count} vendors</span>
                  )}
                </div>
              </div>
            </motion.div>
          ) : (
            !productLoading && <p className="text-muted-foreground">Product not found.</p>
          )}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Price comparison */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                Compare Prices
                {prices && <span className="text-muted-foreground font-normal text-sm ml-2">({prices.length} vendors)</span>}
              </h2>
              <Select value={sortOrder} onValueChange={setSortOrder}>
                <SelectTrigger className="w-40 h-8 text-xs" data-testid="sort-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low_to_high">Low to High</SelectItem>
                  <SelectItem value="high_to_low">High to Low</SelectItem>
                  <SelectItem value="recently_updated">Recently Updated</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              {pricesLoading
                ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                : prices?.map((entry, i) => (
                    <VendorCard key={entry.id} entry={entry} index={i} />
                  ))}
              {!pricesLoading && prices?.length === 0 && (
                <div className="text-center py-12 text-sm text-muted-foreground bg-card border border-border rounded-xl">
                  No prices available yet.
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Price history chart */}
            <div className="bg-card border border-border rounded-xl p-4" data-testid="history-chart-card">
              <h3 className="font-semibold text-sm text-foreground mb-3">30-Day Price History</h3>
              <PriceTrendChart data={history ?? []} loading={historyLoading} />
            </div>

            {/* Price summary stats */}
            {summary && (
              <div className="bg-card border border-border rounded-xl p-4" data-testid="price-summary-card">
                <h3 className="font-semibold text-sm text-foreground mb-3">Price Summary</h3>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "Average", value: formatNaira(summary.average_price), cls: "text-foreground" },
                    { label: "Lowest", value: formatNaira(summary.min_price), cls: "text-primary" },
                    { label: "Highest", value: formatNaira(summary.max_price), cls: "text-foreground" },
                    { label: "Best from", value: summary.cheapest_vendor ?? "—", cls: "text-foreground" },
                  ].map((row) => (
                    <div key={row.label} className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{row.label}</span>
                      <span className={`font-semibold ${row.cls}`}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alert form */}
            <div className="bg-card border border-border rounded-xl p-4" data-testid="alert-form-card">
              <div className="flex items-center gap-2 mb-3">
                <Bell className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">Price Drop Alert</h3>
              </div>
              {alertSubmitted ? (
                <div className="text-center py-2 text-sm text-primary font-medium">Alert set! We'll email you.</div>
              ) : (
                <form onSubmit={handleAlertSubmit} className="flex flex-col gap-2">
                  <Input type="email" placeholder="Your email" value={alertEmail} onChange={(e) => setAlertEmail(e.target.value)} className="h-8 text-xs" data-testid="detail-alert-email" />
                  <Input type="number" placeholder="Target price (₦)" value={alertPrice} onChange={(e) => setAlertPrice(e.target.value)} className="h-8 text-xs" data-testid="detail-alert-price" />
                  <Button type="submit" size="sm" className="h-8 text-xs" disabled={createAlert.isPending} data-testid="detail-alert-submit">
                    {createAlert.isPending ? "Setting..." : "Set Alert"}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
