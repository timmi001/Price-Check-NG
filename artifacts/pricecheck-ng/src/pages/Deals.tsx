import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { Tag, TrendingDown, ArrowRight, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useListDeals, useListCategories } from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";
import { useState } from "react";

export default function Deals() {
  const [, setLocation] = useLocation();
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const { data: categories } = useListCategories();
  const { data: deals, isLoading } = useListDeals(
    selectedCat ? { category_id: selectedCat } : undefined
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Tag className="w-4 h-4 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Best Deals Today</h1>
          </div>
          <p className="text-muted-foreground text-sm">Lowest prices across all categories right now</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
          <button
            data-testid="filter-all"
            onClick={() => setSelectedCat(null)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              selectedCat === null ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"
            }`}
          >
            All Categories
          </button>
          {categories?.map((cat) => (
            <button
              key={cat.id}
              data-testid={`filter-cat-${cat.id}`}
              onClick={() => setSelectedCat(cat.id)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCat === cat.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border text-foreground hover:border-primary"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Deals grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {isLoading
            ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)
            : deals?.map((deal, i) => (
                <motion.div
                  key={`${deal.product_id}-${i}`}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.04 }}
                  data-testid={`deal-card-${deal.product_id}`}
                  className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
                  onClick={() => setLocation(`/product/${deal.product_id}`)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="text-3xl">
                      {deal.category_name === "Gas & Fuel" ? "⛽" :
                       deal.category_name === "Phones" ? "📱" :
                       deal.category_name === "Beverages" ? "☕" :
                       deal.category_name === "Household" ? "🏠" :
                       deal.category_name === "Electronics" ? "🖥️" :
                       deal.category_name === "Beauty" ? "✨" : "🛒"}
                    </div>
                    {deal.discount_pct > 0 && (
                      <Badge className="bg-primary/10 text-primary border-0 text-xs font-semibold">
                        <TrendingDown className="w-3 h-3 mr-0.5" />
                        -{deal.discount_pct.toFixed(0)}%
                      </Badge>
                    )}
                  </div>

                  <h3 className="font-semibold text-sm text-foreground mb-0.5 line-clamp-2" data-testid={`deal-name-${deal.product_id}`}>
                    {deal.product_name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-1">{deal.unit}</p>

                  <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
                    <span>{deal.vendor_name}</span>
                    {deal.vendor_verified && <ShieldCheck className="w-3 h-3 text-primary" />}
                    <span>·</span>
                    <span>{deal.vendor_location}</span>
                  </div>

                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xl font-bold text-primary" data-testid={`deal-price-${deal.product_id}`}>
                        {formatNaira(deal.price)}
                      </p>
                      {deal.original_avg_price > deal.price && (
                        <p className="text-xs text-muted-foreground line-through">
                          avg {formatNaira(deal.original_avg_price)}
                        </p>
                      )}
                    </div>
                    <Button size="sm" variant="outline" className="text-xs h-7 gap-1" data-testid={`deal-view-${deal.product_id}`}>
                      View <ArrowRight className="w-3 h-3" />
                    </Button>
                  </div>
                </motion.div>
              ))}

          {!isLoading && deals?.length === 0 && (
            <div className="col-span-full text-center py-16 text-muted-foreground text-sm">
              No deals available right now. Check back later.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
