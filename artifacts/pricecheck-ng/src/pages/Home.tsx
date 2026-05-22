import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, TrendingDown, TrendingUp, Bell, ArrowRight, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import VendorCard from "@/components/VendorCard";
import PriceTrendChart from "@/components/PriceTrendChart";
import {
  useListCategories,
  useListPrices,
  useGetPriceHistory,
  useGetPriceSummary,
  useGetTrendingProducts,
  useCreateAlert,
} from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";

const POPULAR_TAGS = ["Rice", "Gasoline", "iPhone 14", "Samsung A14", "Indomie"];
const CATEGORY_ICONS: Record<string, string> = {
  "Food Items": "🌾",
  "Beverages": "☕",
  "Phones": "📱",
  "Electronics": "🖥️",
  "Gas & Fuel": "⛽",
  "Beauty": "✨",
  "Household": "🏠",
};

const FEATURED_PRODUCT_ID = 1;

export default function Home() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("low_to_high");
  const [alertEmail, setAlertEmail] = useState("");
  const [alertPrice, setAlertPrice] = useState("");
  const [alertSubmitted, setAlertSubmitted] = useState(false);

  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: prices, isLoading: pricesLoading } = useListPrices({
    product_id: FEATURED_PRODUCT_ID,
    sort: sortOrder as "low_to_high" | "high_to_low" | "nearest" | "recently_updated",
  });
  const { data: history, isLoading: historyLoading } = useGetPriceHistory({ product_id: FEATURED_PRODUCT_ID });
  const { data: summary } = useGetPriceSummary({ product_id: FEATURED_PRODUCT_ID });
  const { data: trending, isLoading: trendingLoading } = useGetTrendingProducts();

  const createAlert = useCreateAlert();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setLocation(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleTagClick = (tag: string) => {
    setLocation(`/search?q=${encodeURIComponent(tag)}`);
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (alertEmail && alertPrice) {
      createAlert.mutate(
        { data: { product_id: FEATURED_PRODUCT_ID, target_price: Number(alertPrice), email: alertEmail } },
        { onSuccess: () => setAlertSubmitted(true) }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-secondary/30 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
              <Badge className="mb-4 bg-primary/10 text-primary border-0 text-xs font-medium">
                #1 Price Comparison in Nigeria
              </Badge>
              <h1 className="text-4xl lg:text-5xl font-bold text-foreground leading-tight mb-4">
                Find the best prices{" "}
                <span className="text-primary">near you.</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
                Compare prices across thousands of stores and vendors in Nigeria. Save more, shop smarter.
              </p>

              <form onSubmit={handleSearch} className="flex gap-2 max-w-xl">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    data-testid="hero-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="1 bag of rice"
                    className="pl-9 h-12 text-base bg-card border-border"
                  />
                </div>
                <Button type="submit" size="lg" className="h-12 px-6 font-semibold" data-testid="hero-search-button">
                  Search
                </Button>
              </form>

              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-xs text-muted-foreground self-center">Popular:</span>
                {POPULAR_TAGS.map((tag) => (
                  <button
                    key={tag}
                    data-testid={`tag-${tag.toLowerCase().replace(/\s/g, "-")}`}
                    onClick={() => handleTagClick(tag)}
                    className="text-xs px-3 py-1.5 bg-card border border-border rounded-full text-foreground hover:border-primary hover:text-primary transition-colors cursor-pointer"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="hidden lg:flex items-center justify-center"
            >
              <div className="relative w-80 h-80">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/40 rounded-3xl rotate-3" />
                <div className="absolute inset-0 bg-card border-2 border-primary/20 rounded-3xl flex flex-col items-center justify-center gap-4 p-8">
                  <div className="text-7xl">🛒</div>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    {[
                      { name: "Rice 50kg", price: "₦62,000", badge: "Best" },
                      { name: "Indomie", price: "₦7,500", badge: null },
                      { name: "Veg. Oil 5L", price: "₦11,500", badge: "Deal" },
                      { name: "Petrol/L", price: "₦890", badge: "Low" },
                    ].map((item) => (
                      <div key={item.name} className="bg-muted rounded-xl p-2.5 relative">
                        {item.badge && (
                          <span className="absolute -top-1.5 -right-1.5 bg-primary text-primary-foreground text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                            {item.badge}
                          </span>
                        )}
                        <p className="text-xs font-medium text-foreground truncate">{item.name}</p>
                        <p className="text-sm font-bold text-primary">{item.price}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 border-b border-border bg-card/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {catsLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="w-24 h-16 rounded-xl flex-shrink-0" />
                ))
              : categories?.map((cat, i) => (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    data-testid={`category-${cat.id}`}
                    onClick={() => setLocation(`/categories?cat=${cat.id}`)}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 bg-card border border-border rounded-xl hover:border-primary hover:shadow-sm transition-all duration-200 cursor-pointer"
                  >
                    <span className="text-2xl">{CATEGORY_ICONS[cat.name] ?? "📦"}</span>
                    <span className="text-xs font-medium text-foreground whitespace-nowrap">{cat.name}</span>
                  </motion.button>
                ))}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              onClick={() => setLocation("/categories")}
              data-testid="view-all-categories"
              className="flex-shrink-0 flex flex-col items-center gap-1.5 px-5 py-3 bg-primary/5 border border-primary/20 rounded-xl hover:bg-primary/10 transition-all duration-200 cursor-pointer"
            >
              <ArrowRight className="w-6 h-6 text-primary" />
              <span className="text-xs font-medium text-primary whitespace-nowrap">View All</span>
            </motion.button>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Price comparison results */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-foreground">Price comparison results</h2>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Showing prices for: <span className="font-medium text-foreground">50kg bag of rice in Lagos</span>
                    {summary && (
                      <span className={`ml-2 text-xs font-semibold ${summary.price_change_pct > 0 ? "text-destructive" : "text-primary"}`}>
                        {summary.price_change_pct > 0 ? (
                          <><TrendingUp className="w-3 h-3 inline" /> +{summary.price_change_pct}% (30d)</>
                        ) : (
                          <><TrendingDown className="w-3 h-3 inline" /> {summary.price_change_pct}% (30d)</>
                        )}
                      </span>
                    )}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="gap-1 text-xs" data-testid="filter-button">
                    <SlidersHorizontal className="w-3.5 h-3.5" /> Filter
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
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <Skeleton key={i} className="h-28 rounded-xl" />
                    ))
                  : prices?.map((entry, i) => (
                      <VendorCard
                        key={entry.id}
                        entry={entry}
                        index={i}
                        onViewDetails={() => setLocation(`/product/${entry.product_id}`)}
                      />
                    ))}
                {!pricesLoading && prices?.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No prices available yet.
                  </div>
                )}
              </div>
            </div>

            {/* Right Sidebar */}
            <div className="flex flex-col gap-5">
              {/* Price trend card */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="price-trend-card">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-sm text-foreground">Price Trend (30 days)</h3>
                  {summary && (
                    <span className={`text-xs font-semibold flex items-center gap-0.5 ${summary.price_change_pct > 0 ? "text-destructive" : "text-primary"}`}>
                      {summary.price_change_pct > 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {Math.abs(summary.price_change_pct)}%
                    </span>
                  )}
                </div>
                {summary && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Average</p>
                      <p className="text-sm font-bold text-foreground">{formatNaira(summary.average_price)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Lowest</p>
                      <p className="text-sm font-bold text-primary">{formatNaira(summary.min_price)}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs text-muted-foreground">Highest</p>
                      <p className="text-sm font-bold text-foreground">{formatNaira(summary.max_price)}</p>
                    </div>
                  </div>
                )}
                <PriceTrendChart data={history ?? []} loading={historyLoading} />
              </div>

              {/* Price Alert card */}
              <div className="bg-card border border-border rounded-xl p-4" data-testid="price-alert-card">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bell className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Price Alert</h3>
                    <p className="text-xs text-muted-foreground">Get notified when prices drop</p>
                  </div>
                </div>
                {alertSubmitted ? (
                  <div className="text-center py-3">
                    <div className="text-2xl mb-2">✓</div>
                    <p className="text-sm font-medium text-primary">Alert set successfully!</p>
                    <p className="text-xs text-muted-foreground mt-1">We'll email you when the price drops.</p>
                  </div>
                ) : (
                  <form onSubmit={handleAlertSubmit} className="flex flex-col gap-2">
                    <Input
                      type="email"
                      placeholder="Your email"
                      value={alertEmail}
                      onChange={(e) => setAlertEmail(e.target.value)}
                      className="h-8 text-xs"
                      data-testid="alert-email-input"
                    />
                    <Input
                      type="number"
                      placeholder="Target price (₦)"
                      value={alertPrice}
                      onChange={(e) => setAlertPrice(e.target.value)}
                      className="h-8 text-xs"
                      data-testid="alert-price-input"
                    />
                    <Button type="submit" size="sm" className="h-8 text-xs w-full" disabled={createAlert.isPending} data-testid="alert-submit-button">
                      {createAlert.isPending ? "Setting..." : "Set Price Alert"}
                    </Button>
                  </form>
                )}
              </div>

              {/* Benefits card */}
              <div className="bg-gradient-to-br from-primary/10 to-secondary/40 border border-primary/20 rounded-xl p-4" data-testid="benefits-card">
                <h3 className="font-semibold text-sm text-foreground mb-3">Why PriceCheck NG?</h3>
                <div className="flex flex-col gap-2.5">
                  {[
                    { icon: "💰", title: "Save more money", desc: "Always find the lowest price nearby" },
                    { icon: "🧠", title: "Make smart choices", desc: "Real-time data from verified vendors" },
                    { icon: "🤝", title: "Support local vendors", desc: "Discover deals from Nigerian stores" },
                  ].map((b) => (
                    <div key={b.title} className="flex items-start gap-2.5">
                      <span className="text-lg flex-shrink-0">{b.icon}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground">{b.title}</p>
                        <p className="text-xs text-muted-foreground">{b.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Products */}
      <section className="py-8 bg-muted/30 border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-foreground">Trending Products</h2>
            <Button variant="ghost" size="sm" className="text-primary text-xs gap-1" onClick={() => setLocation("/categories")} data-testid="view-all-products">
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
            {trendingLoading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="w-44 h-40 rounded-xl flex-shrink-0" />
                ))
              : trending?.slice(0, 8).map((product, i) => (
                  <motion.div
                    key={product.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.06 }}
                    data-testid={`trending-card-${product.id}`}
                    className="flex-shrink-0 w-44 bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
                    onClick={() => setLocation(`/product/${product.id}`)}
                  >
                    <div className="text-3xl mb-2 text-center">
                      {product.category_name === "Gas & Fuel" ? "⛽" :
                       product.category_name === "Phones" ? "📱" :
                       product.category_name === "Beverages" ? "☕" :
                       product.category_name === "Household" ? "🏠" : "🛒"}
                    </div>
                    <p className="text-xs font-semibold text-foreground truncate mb-1">{product.name}</p>
                    <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
                    <p className="text-base font-bold text-primary">{formatNaira(product.average_price)}</p>
                    <div className="flex items-center gap-1 mt-1">
                      {product.price_change_pct > 0 ? (
                        <TrendingUp className="w-3 h-3 text-destructive" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-primary" />
                      )}
                      <span className={`text-xs font-medium ${product.price_change_pct > 0 ? "text-destructive" : "text-primary"}`}>
                        {Math.abs(product.price_change_pct)}%
                      </span>
                    </div>
                    <Button size="sm" variant="outline" className="w-full mt-3 h-7 text-xs" data-testid={`btn-view-prices-${product.id}`}>
                      View Prices
                    </Button>
                  </motion.div>
                ))}
          </div>
        </div>
      </section>
    </div>
  );
}
