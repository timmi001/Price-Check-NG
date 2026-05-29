import { motion } from "framer-motion";
import { GitCompare } from "lucide-react";

const MOCK_COMPARE = [
  { product: "Bags of Rice (50kg)", vendors: [
    { name: "Shoprite Nigeria", price: 61500 },
    { name: "AP Plaza Market", price: 62000 },
    { name: "Jumia", price: 62800 },
  ]},
];

export default function Compare() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <GitCompare className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Compare</h1>
          </div>
          <p className="text-sm text-muted-foreground mb-6">Side-by-side vendor prices for a product</p>

          {MOCK_COMPARE.map((item) => (
            <div key={item.product} className="rounded-xl border border-border bg-card overflow-hidden">
              <div className="px-4 py-3 border-b border-border bg-muted/30">
                <p className="font-medium text-foreground">{item.product}</p>
              </div>
              <ul className="divide-y divide-border">
                {item.vendors.map((v, i) => (
                  <li
                    key={v.name}
                    className={`flex items-center justify-between px-4 py-3 text-sm ${
                      i === 0 ? "bg-primary/5" : ""
                    }`}
                  >
                    <span className="text-foreground">{v.name}</span>
                    <span className={`font-semibold ${i === 0 ? "text-primary" : "text-foreground"}`}>
                      ₦{v.price.toLocaleString()}
                      {i === 0 && (
                        <span className="ml-2 text-xs font-normal text-primary">Lowest</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
