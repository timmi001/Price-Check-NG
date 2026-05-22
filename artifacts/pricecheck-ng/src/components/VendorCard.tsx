import { motion } from "framer-motion";
import { MapPin, Clock, MessageCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import type { PriceEntry } from "@workspace/api-client-react";

interface VendorCardProps {
  entry: PriceEntry;
  index: number;
  onViewDetails?: () => void;
}

function getRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function VendorCard({ entry, index, onViewDetails }: VendorCardProps) {
  const whatsappUrl = entry.vendor_whatsapp
    ? `https://wa.me/${entry.vendor_whatsapp}?text=Hi%2C%20I%20found%20your%20listing%20on%20PriceCheck%20NG.%20Is%20this%20price%20still%20available%3F`
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.07 }}
      data-testid={`vendor-card-${entry.id}`}
      className={`relative bg-card border rounded-xl p-4 flex gap-4 hover:shadow-md transition-all duration-200 ${
        entry.is_cheapest ? "border-primary/40 ring-1 ring-primary/20" : "border-border"
      }`}
    >
      {/* Cheapest badge */}
      {entry.is_cheapest && (
        <div className="absolute -top-2.5 left-4">
          <Badge className="bg-primary text-primary-foreground text-xs font-semibold px-2 py-0.5" data-testid={`badge-cheapest-${entry.id}`}>
            Best Price
          </Badge>
        </div>
      )}

      {/* Vendor logo / avatar */}
      <div className="flex-shrink-0">
        <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
          {entry.vendor_logo_url ? (
            <img src={entry.vendor_logo_url} alt={entry.vendor_name} className="w-full h-full object-contain" />
          ) : (
            <span className="text-lg font-bold text-muted-foreground">
              {entry.vendor_name.charAt(0)}
            </span>
          )}
        </div>
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-semibold text-foreground text-sm truncate" data-testid={`vendor-name-${entry.id}`}>
                {entry.vendor_name}
              </h3>
              {entry.vendor_verified && (
                <ShieldCheck className="w-3.5 h-3.5 text-primary flex-shrink-0" data-testid={`verified-badge-${entry.id}`} />
              )}
            </div>
            <div className="flex items-center gap-3 mt-0.5">
              <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`vendor-location-${entry.id}`}>
                <MapPin className="w-3 h-3" /> {entry.vendor_location}
              </span>
              <span className="flex items-center gap-1 text-xs text-muted-foreground" data-testid={`vendor-updated-${entry.id}`}>
                <Clock className="w-3 h-3" /> {getRelativeTime(entry.updated_at)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">{entry.quantity}</p>
          </div>

          {/* Price */}
          <div className="text-right flex-shrink-0">
            <p className={`text-xl font-bold ${entry.is_cheapest ? "text-primary" : "text-foreground"}`} data-testid={`price-${entry.id}`}>
              {formatNaira(Number(entry.price))}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3">
          <Button
            size="sm"
            variant="outline"
            className="text-xs h-8 flex-1"
            onClick={onViewDetails}
            data-testid={`btn-view-details-${entry.id}`}
          >
            View Details <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
          {whatsappUrl && (
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="flex-1" data-testid={`btn-whatsapp-${entry.id}`}>
              <Button size="sm" className="w-full text-xs h-8 bg-[#25D366] hover:bg-[#22c55e] text-white border-0 gap-1">
                <MessageCircle className="w-3 h-3" /> WhatsApp
              </Button>
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
