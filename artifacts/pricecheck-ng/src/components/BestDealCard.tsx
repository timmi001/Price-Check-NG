import { motion } from "framer-motion";
import { Trophy, Star, Flame, MessageCircle, ShoppingCart, ShieldCheck, Package, Truck, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import type { BestDeal } from "@workspace/api-client-react";

interface BestDealCardProps {
  deal: BestDeal;
  productName: string;
  onOrder: (option: BestDeal["options"][0]) => void;
}

const BADGE_ICONS: Record<string, React.ReactNode> = {
  "💰 Cheapest": <Trophy className="w-4 h-4 text-yellow-500" />,
  "⭐ Top Rated": <Star className="w-4 h-4 text-blue-500" />,
  "🔥 Popular": <Flame className="w-4 h-4 text-orange-500" />,
};

const OPTION_COLORS = [
  "border-primary/40 bg-primary/5",
  "border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950/30",
  "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950/30",
];
const BADGE_COLORS = [
  "bg-primary text-primary-foreground",
  "bg-blue-600 text-white",
  "bg-orange-500 text-white",
];

export default function BestDealCard({ deal, productName, onOrder }: BestDealCardProps) {
  if (!deal.options || deal.options.length === 0) return null;

  const whatsappUrl = (option: BestDeal["options"][0], qty = 1) => {
    if (!option.vendor_whatsapp) return null;
    const msg = encodeURIComponent(
      `Hi ${option.vendor_name}, I found you on PriceCheck NG.\n\nI'd like to order:\n📦 ${productName}\n🔢 Quantity: ${qty} × ${option.quantity}\n💰 Price: ${formatNaira(option.price)} per ${option.quantity}\n\nIs this still available?`
    );
    return `https://wa.me/${option.vendor_whatsapp}?text=${msg}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-6"
      data-testid="best-deal-card"
    >
      <div className="flex items-center gap-2 mb-3">
        <Trophy className="w-5 h-5 text-yellow-500" />
        <h2 className="text-lg font-bold text-foreground">Best Deal Options</h2>
        <Badge variant="secondary" className="text-xs">Auto-updated</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {deal.options.map((option, i) => {
          const wa = whatsappUrl(option);
          return (
            <motion.div
              key={option.vendor_id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              data-testid={`best-deal-option-${i}`}
              className={`relative border-2 rounded-xl p-4 ${OPTION_COLORS[i] ?? OPTION_COLORS[0]}`}
            >
              {/* Label badge */}
              <div className={`absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${BADGE_COLORS[i] ?? BADGE_COLORS[0]}`}>
                {option.badge}
              </div>

              {/* Vendor info */}
              <div className="flex items-start gap-3 mt-1">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border flex-shrink-0 text-lg font-bold text-muted-foreground">
                  {option.vendor_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-foreground truncate">{option.vendor_name}</p>
                    {option.vendor_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </div>
                  <p className="text-xs text-muted-foreground">{option.vendor_location}</p>
                  {option.vendor_rating != null && option.vendor_rating > 0 && (
                    <div className="flex items-center gap-0.5 mt-0.5">
                      <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-medium">{option.vendor_rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="mt-3 mb-3">
                <p className="text-2xl font-bold text-foreground">{formatNaira(option.price)}</p>
                <p className="text-xs text-muted-foreground">{option.quantity}</p>
              </div>

              {/* Stock & delivery */}
              <div className="flex items-center gap-3 mb-3 text-xs">
                <span className={`flex items-center gap-1 font-medium ${option.vendor_stock_available ? "text-primary" : "text-destructive"}`}>
                  <Package className="w-3 h-3" />
                  {option.vendor_stock_available ? "In stock" : "Out of stock"}
                </span>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <Button
                  size="sm"
                  className="w-full h-8 text-xs font-semibold gap-1"
                  onClick={() => onOrder(option)}
                  data-testid={`btn-order-${i}`}
                  disabled={!option.vendor_stock_available}
                >
                  <ShoppingCart className="w-3 h-3" /> Order Now
                </Button>
                {wa && (
                  <a href={wa} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="outline" className="w-full h-8 text-xs gap-1 bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20">
                      <MessageCircle className="w-3 h-3" /> WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
