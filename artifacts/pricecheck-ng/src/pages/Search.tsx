import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, SlidersHorizontal, ArrowLeft, TrendingDown, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorCard from "@/components/VendorCard";
import PriceTrendChart from "@/components/PriceTrendChart";
import { useListProducts, useListPrices, useGetPriceHistory, useGetPriceSummary } from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";

function getQueryParam(key: string): string {
  const params = new URLSearchParams(window.location.search);
  return params.get(key) ?? "";
}

export default function SearchPage() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState(getQueryParam("q"));
  const [inputVal, setInputVal] = useState(getQueryParam("q"));
  const [sortOrder, setSortOrder] = useState("low_to_high");
  const [selectedProductId, setSelectedProductId] = useState<number>(0);

  const { data: products, isLoading: productsLoading } = useListProducts(
    searchQuery ? { search: searchQuery } : undefined
  );

  useEffect(() => {
    if (products && products.length > 0 && selectedProductId === 0) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId]);

  const hasProduct = selectedProductId > 0;

  const { data: prices, isLoading: pricesLoading } = useListPrices(
    { product_id: selectedProductId, sort: sortOrder as "low_to_high" | "high_to_low" | "nearest" | "recently_updated" },
    { query: { enabled: hasProduct } }
  );

  const { data: history, isLoading: historyLoading } = useGetPriceHistory(
    { product_id: selectedProductId },
    { query: { enabled: hasProduct } }
  );

  const { data: summary } = useGetPriceSummary(
    { product_id: selectedProductId },
    { query: { enabled: hasProduct } }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(inputVal);
    setSelectedProductId(0);
    window.history.replaceState(null, "", `?q=${encodeURIComponent(inputVal)}`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Search header */}
      <div className="bg-card border-b border-border py-4 sticky top-16 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => setLocation("/")} data-testid="back-button">
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  data-testid="search-input"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder="Search products..."
                  className="pl-9 h-10"
                />
              </div>
              <Button type="submit" className="h-10 px-5" data-testid="search-button">Search</Button>
            </form>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left: Product list + prices */}
          <div className="lg:col-span-2">
            {searchQuery && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">
                  Results for: <span className="font-semibold text-foreground">"{searchQuery}"</span>
                  {products && <span> — {products.length} product{products.length !== 1 ? "s" : ""} found</span>}
                </p>
                {productsLoading ? (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="w-32 h-10 rounded-xl flex-shrink-0" />)}
                  </div>
                ) : (
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {products?.map((p) => (
                      <button
                        key={p.id}
                        data-testid={`product-tab-${p.id}`}
                        onClick={() => setSelectedProductId(p.id)}
                        className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                          selectedProductId === p.id
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-card border-border text-foreground hover:border-primary"
                        }`}
                      >
                        {p.name}
                        {p.min_price != null && <span className="ml-1 opacity-70">{formatNaira(p.min_price)}</span>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {hasProduct && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="font-semibold text-foreground text-sm">
                    {products?.find((p) => p.id === selectedProductId)?.name}
                    {summary && (
                      <span className="text-primary font-bold ml-2">{formatNaira(summary.average_price)}</span>
                    )}
                    <span className="text-muted-foreground font-normal text-xs ml-1">avg</span>
                  </h2>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="gap-1 text-xs h-8" data-testid="filter-button">
                      <SlidersHorizontal className="w-3 h-3" /> Filter
                    </Button>
                    <Select value={sortOrder} onValueChange={setSortOrder}>
                      <SelectTrigger className="w-40 h-8 text-xs" data-testid="sort-select">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low_to_high">Low to High</SelectItem>
                        <SelectItem value="high_to_low">High to Low</SelectItem>
                        <SelectItem value="nearest">Nearest</SelectItem>
                        <SelectItem value="recently_updated">Recently Updated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex flex-col gap-3">
                  {pricesLoading
                    ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
                    : prices?.map((entry, i) => (
                        <motion.div key={entry.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                          <VendorCard
                            entry={entry}
                            index={i}
                            onViewDetails={() => setLocation(`/product/${entry.product_id}`)}
                          />
                        </motion.div>
                      ))}
                  {!pricesLoading && prices?.length === 0 && (
                    <div className="text-center py-12 text-muted-foreground text-sm bg-card border border-border rounded-xl">
                      No prices available for this product yet.
                    </div>
                  )}
                </div>
              </>
            )}

            {!searchQuery && (
              <div className="text-center py-16 text-muted-foreground">
                <Search className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Search for a product to compare prices</p>
              </div>
            )}
          </div>

          {/* Right sidebar */}
          <div className="flex flex-col gap-4">
            {hasProduct && (
              <div className="bg-card border border-border rounded-xl p-4" data-testid="search-trend-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-foreground">Price Trend</h3>
                  {summary && (
                    <span className={`text-xs font-semibold ${summary.price_change_pct > 0 ? "text-destructive" : "text-primary"}`}>
                      {summary.price_change_pct > 0
                        ? <TrendingUp className="w-3 h-3 inline" />
                        : <TrendingDown className="w-3 h-3 inline" />}{" "}
                      {Math.abs(summary.price_change_pct)}%
                    </span>
                  )}
                </div>
                {summary && (
                  <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                    <div><span className="text-muted-foreground">Min: </span><span className="font-bold text-primary">{formatNaira(summary.min_price)}</span></div>
                    <div><span className="text-muted-foreground">Max: </span><span className="font-bold">{formatNaira(summary.max_price)}</span></div>
                    <div><span className="text-muted-foreground">Avg: </span><span className="font-bold">{formatNaira(summary.average_price)}</span></div>
                    <div><span className="text-muted-foreground">Vendors: </span><span className="font-bold">{summary.vendor_count}</span></div>
                  </div>
                )}
                <PriceTrendChart data={history ?? []} loading={historyLoading} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
