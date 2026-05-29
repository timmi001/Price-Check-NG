import { useState } from "react";
import { motion } from "framer-motion";
import { Search as SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";

const SUGGESTIONS = ["Rice 50kg", "Petrol", "iPhone 14", "Indomie", "Cooking gas", "Samsung A14"];

export default function Search() {
  const [query, setQuery] = useState("");

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-xl font-bold text-foreground mb-1">Search</h1>
          <p className="text-sm text-muted-foreground mb-5">Find products and compare vendor prices</p>

          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              data-testid="search-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search rice, fuel, phones..."
              className="pl-10 h-11"
            />
          </div>

          <p className="text-xs font-medium text-muted-foreground mb-2">Popular searches</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-3 py-1.5 rounded-full text-sm bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
              >
                {term}
              </button>
            ))}
          </div>

          {query.trim() && (
            <p className="mt-8 text-sm text-muted-foreground text-center">
              Showing results for &ldquo;{query}&rdquo; — connect the API to load live prices.
            </p>
          )}
        </motion.div>
      </div>
    </div>
  );
}
