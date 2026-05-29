import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle, ShieldCheck, Star, Package, Truck, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import type { PriceEntry } from "@workspace/api-client-react";

interface VendorCardProps {
  entry: PriceEntry;
  index: number;
  onOrder?: () => void;
  onViewVendor?: () => void;
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StarDisplay({ rating, count }: { rating: number; count: number }) {
  const full = Math.round(rating);
  return (
    <div className="flex items-center gap-1">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star key={n} className={`w-3 h-3 ${n <= full ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
        ))}
      </div>
      <span className="text-xs font-medium text-foreground">{rating.toFixed(1)}</span>
      <span className="text-xs text-muted-foreground">({count})</span>
    </div>
  );
}

export default function VendorCard({ entry, index, onOrder, onViewVendor }: VendorCardProps) {
  const whatsappUrl = entry.vendor_whatsapp
    ? `https://wa.me/${entry.vendor_whatsapp}?text=Hi%2C%20I%20found%20your%20listing%20on%20PriceCheck%20NG.%20Is%20this%20price%20still%20available%3F`
    : null;

  const hasRating = entry.vendor_rating != null && entry.vendor_rating > 0;
  const isBestRated = entry.is_best_rated && hasRating;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      data-testid={`vendor-card-${entry.id}`}
      className={`relative bg-card border rounded-xl p-4 flex gap-4 hover:shadow-md transition-all duration-200 ${
        entry.is_cheapest
          ? "border-[#F4B400]/40 ring-1 ring-[#F4B400]/20"
          : isBestRated
          ? "border-primary/30 ring-1 ring-primary/15"
          : "border-border"
      }`}
    >
      {/* Badges */}
      <div className="absolute -top-2.5 left-4 flex gap-1.5">
        {entry.is_cheapest && (
          <span className="bg-[#F4B400] text-white text-xs font-bold px-2.5 py-0.5 rounded-full" data-testid={`badge-cheapest-${entry.id}`}>
            💰 Best Price
          </span>
        )}
        {isBestRated && !entry.is_cheapest && (
          <span className="bg-primary text-primary-foreground text-xs font-bold px-2.5 py-0.5 rounded-full" data-testid={`badge-best-rated-${entry.id}`}>
            ⭐ Top Rated
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center overflow-hidden">
          {entry.vendor_logo_url ? (
            <img src={entry.vendor_logo_url} alt={entry.vendor_name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-lg font-bold text-primary">{entry.vendor_name.charAt(0)}</span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                className="font-semibold text-foreground text-sm truncate hover:text-primary transition-colors text-left"
                onClick={onViewVendor}
                data-testid={`vendor-name-${entry.id}`}
              >
                {entry.vendor_name}
              </button>
              {entry.vendor_verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-[#1DBF73] flex-shrink-0" data-testid={`verified-badge-${entry.id}`} />
              )}
            </div>

            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <span className="flex items-center gap-1 text-xs text-[#3B82F6]" data-testid={`vendor-location-${entry.id}`}>
                <MapPin className="w-3 h-3" /> {entry.vendor_location}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`vendor-updated-${entry.id}`}>
                <Clock className="w-3 h-3" /> {getRelativeTime(entry.updated_at)}
              </span>
            </div>

            {hasRating && (
              <div className="mt-1">
                <StarDisplay rating={entry.vendor_rating!} count={entry.vendor_rating_count ?? 0} />
              </div>
            )}

            <div className="flex items-center gap-2.5 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">{entry.quantity}</span>
              <span className={`flex items-center gap-0.5 text-xs font-medium ${entry.vendor_stock_available ? "text-[#1DBF73]" : "text-destructive"}`} data-testid={`stock-status-${entry.id}`}>
                <Package className="w-3 h-3" /> {entry.vendor_stock_available ? "In stock" : "Out of stock"}
              </span>
              {entry.vendor_delivery_options && (
                <span className="flex items-center gap-0.5 text-xs text-[#3B82F6]" data-testid={`delivery-${entry.id}`}>
                  <Truck className="w-3 h-3" /> {entry.vendor_delivery_options}
                </span>
              )}
            </div>
          </div>

          <div className="text-right flex-shrink-0">
            <p
              className={`text-xl font-bold ${entry.is_cheapest ? "text-[#F4B400]" : "text-foreground"}`}
              data-testid={`price-${entry.id}`}
            >
              {formatNaira(Number(entry.price))}
            </p>
            {entry.vendor_response_time && (
              <p className="text-xs text-muted-foreground mt-0.5">{entry.vendor_response_time}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 flex-1 gap-1"
            onClick={onViewVendor}
            data-testid={`btn-view-vendor-${entry.id}`}
          >
            Vendor Profile
          </Button>
          <Button
            size="sm"
            className="text-xs h-8 flex-1 gap-1"
            onClick={onOrder}
            data-testid={`btn-order-${entry.id}`}
            disabled={!entry.vendor_stock_available}
          >
            <ShoppingCart className="w-3 h-3" /> Order
          </Button>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" data-testid={`btn-whatsapp-${entry.id}`}>
              <Button size="sm" className="text-xs h-8 gap-1 bg-[#25D366] hover:bg-[#22c55e] text-white border-0 px-2">
                <MessageCircle className="w-3 h-3" />
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
