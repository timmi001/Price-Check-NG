import { motion } from "framer-motion";
import { Trophy, Star, Flame, MessageCircle, ShoppingCart, ShieldCheck, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import type { BestDeal } from "@workspace/api-client-react";

interface BestDealCardProps {
  deal: BestDeal;
  productName: string;
  onOrder: (option: BestDeal["options"][0]) => void;
}

const OPTIONS_CONFIG = [
  {
    borderClass: "border-[#F4B400]/40 bg-[#F4B400]/5",
    badgeClass: "bg-[#F4B400] text-white",
    icon: <Trophy className="w-4 h-4 text-[#F4B400]" />,
  },
  {
    borderClass: "border-[#6C4DFF]/30 bg-[#6C4DFF]/5",
    badgeClass: "bg-[#6C4DFF] text-white",
    icon: <Star className="w-4 h-4 text-[#6C4DFF]" />,
  },
  {
    borderClass: "border-[#3B82F6]/30 bg-[#3B82F6]/5",
    badgeClass: "bg-[#3B82F6] text-white",
    icon: <Flame className="w-4 h-4 text-[#3B82F6]" />,
  },
];

export default function BestDealCard({ deal, productName, onOrder }: BestDealCardProps) {
  if (!deal.options || deal.options.length === 0) return null;

  const whatsappUrl = (option: BestDeal["options"][0], qty = 1) => {
    if (!option.vendor_whatsapp) return null;
    const msg = encodeURIComponent(
      `Hi ${option.vendor_name}, I found you on PriceCheck NG.\n\nI'd like to order:\n📦 ${productName}\n🔢 Qty: ${qty} × ${option.quantity}\n💰 Price: ${formatNaira(option.price)}\n\nIs this available?`
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
        <Trophy className="w-5 h-5 text-[#F4B400]" />
        <h2 className="text-lg font-bold text-foreground">Best Deal Options</h2>
        <Badge variant="secondary" className="text-xs">Auto-updated</Badge>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {deal.options.map((option, i) => {
          const cfg = OPTIONS_CONFIG[i] ?? OPTIONS_CONFIG[0];
          const wa = whatsappUrl(option);
          return (
            <motion.div
              key={option.vendor_id}
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.08 }}
              data-testid={`best-deal-option-${i}`}
              className={`relative border-2 rounded-xl p-4 ${cfg.borderClass}`}
            >
              <div className={`absolute -top-2.5 left-3 px-2.5 py-0.5 rounded-full text-xs font-bold ${cfg.badgeClass}`}>
                {option.badge}
              </div>

              <div className="flex items-start gap-3 mt-1">
                <div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center border border-border flex-shrink-0 text-lg font-bold text-muted-foreground">
                  {option.vendor_name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="font-semibold text-sm text-foreground truncate">{option.vendor_name}</p>
                    {option.vendor_verified && <ShieldCheck className="w-3.5 h-3.5 text-[#1DBF73] flex-shrink-0" />}
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

              <div className="mt-3 mb-3">
                <p className="text-2xl font-bold text-foreground">{formatNaira(option.price)}</p>
                <p className="text-xs text-muted-foreground">{option.quantity}</p>
              </div>

              <div className="flex items-center gap-3 mb-3 text-xs">
                <span className={`flex items-center gap-1 font-medium ${option.vendor_stock_available ? "text-[#1DBF73]" : "text-destructive"}`}>
                  <Package className="w-3 h-3" />
                  {option.vendor_stock_available ? "In stock" : "Out of stock"}
                </span>
              </div>

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
