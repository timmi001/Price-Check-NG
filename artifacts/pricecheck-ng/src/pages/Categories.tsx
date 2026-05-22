import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useListCategories, useListProducts } from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";

const CATEGORY_ICONS: Record<string, string> = {
  "Food Items": "🌾",
  "Beverages": "☕",
  "Phones": "📱",
  "Electronics": "🖥️",
  "Gas & Fuel": "⛽",
  "Beauty": "✨",
  "Household": "🏠",
};

export default function Categories() {
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState<number | null>(null);

  const { data: categories, isLoading: catsLoading } = useListCategories();
  const { data: products, isLoading: productsLoading } = useListProducts(
    selectedCat ? { category_id: selectedCat } : searchQuery ? { search: searchQuery } : undefined
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCat(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground mb-1">Browse Categories</h1>
          <p className="text-sm text-muted-foreground">Find products by category or search by name</p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative max-w-md mb-8">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            data-testid="category-search"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setSelectedCat(null); }}
            placeholder="Search any product..."
            className="pl-9 h-11"
          />
        </form>

        {/* Category grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 mb-8">
          {catsLoading
            ? Array.from({ length: 7 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)
            : categories?.map((cat, i) => (
                <motion.button
                  key={cat.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  data-testid={`category-btn-${cat.id}`}
                  onClick={() => { setSelectedCat(selectedCat === cat.id ? null : cat.id); setSearchQuery(""); }}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                    selectedCat === cat.id
                      ? "bg-primary/10 border-primary text-primary"
                      : "bg-card border-border text-foreground hover:border-primary/50 hover:shadow-sm"
                  }`}
                >
                  <span className="text-3xl">{CATEGORY_ICONS[cat.name] ?? "📦"}</span>
                  <span className="text-xs font-medium text-center leading-tight">{cat.name}</span>
                  {cat.product_count != null && (
                    <span className="text-xs text-muted-foreground">{cat.product_count} items</span>
                  )}
                </motion.button>
              ))}
        </div>

        {/* Products */}
        {(selectedCat !== null || searchQuery) && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-foreground">
                {selectedCat ? categories?.find((c) => c.id === selectedCat)?.name : `"${searchQuery}"`}
                {products && <span className="text-muted-foreground font-normal text-sm ml-2">({products.length} products)</span>}
              </h2>
              {selectedCat && (
                <button onClick={() => setSelectedCat(null)} className="text-xs text-muted-foreground hover:text-foreground">Clear filter</button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {productsLoading
                ? Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-xl" />)
                : products?.map((product, i) => (
                    <motion.div
                      key={product.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      data-testid={`product-card-${product.id}`}
                      onClick={() => setLocation(`/product/${product.id}`)}
                      className="bg-card border border-border rounded-xl p-4 hover:shadow-md hover:border-primary/30 transition-all duration-200 cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="text-3xl">
                          {product.category_name === "Gas & Fuel" ? "⛽" :
                           product.category_name === "Phones" ? "📱" :
                           product.category_name === "Beverages" ? "☕" : "🛒"}
                        </div>
                        {product.vendor_count != null && product.vendor_count > 0 && (
                          <span className="text-xs text-muted-foreground">{product.vendor_count} vendors</span>
                        )}
                      </div>
                      <h3 className="font-semibold text-sm text-foreground mb-0.5">{product.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{product.unit}</p>
                      {product.average_price != null ? (
                        <div>
                          <p className="text-base font-bold text-primary">{formatNaira(product.average_price)}</p>
                          {product.min_price != null && product.min_price < product.average_price && (
                            <p className="text-xs text-muted-foreground">from {formatNaira(product.min_price)}</p>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground italic">No prices yet</p>
                      )}
                      <div className="mt-3 flex items-center gap-1 text-primary text-xs font-medium">
                        View Prices <ArrowRight className="w-3 h-3" />
                      </div>
                    </motion.div>
                  ))}
            </div>
          </div>
        )}

        {!selectedCat && !searchQuery && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Select a category or search above to browse products
          </div>
        )}
      </div>
    </div>
  );
}
