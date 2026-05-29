import { motion } from "framer-motion";
import { Link } from "wouter";
import { Heart, ChevronRight } from "lucide-react";

const SAVED_ITEMS = [
  { id: 1, name: "iPhone 14 Pro", minPrice: 420000 },
  { id: 2, name: "Petrol (Per Litre)", minPrice: 890 },
  { id: 3, name: "Bags of Rice (50kg)", minPrice: 61500 },
];

export default function Saved() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Heart className="w-5 h-5 text-red-500 fill-red-500/20" />
            <h1 className="text-xl font-bold text-foreground">Saved</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Products you bookmarked for later</p>

          {SAVED_ITEMS.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">No saved items yet.</p>
          ) : (
            <ul className="space-y-2">
              {SAVED_ITEMS.map((item) => (
                <li key={item.id}>
                  <Link href="/search">
                    <span className="flex items-center justify-between rounded-xl border border-border bg-card px-4 py-3 hover:border-primary/30 transition-colors cursor-pointer">
                      <div>
                        <p className="font-medium text-foreground text-sm">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          From ₦{item.minPrice.toLocaleString()}
                        </p>
                      </div>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </div>
    </div>
  );
}
