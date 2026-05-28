import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { ArrowLeft, Store, User, ShieldCheck, Zap, Package, BarChart2, MessageCircle, ChevronRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

type SellerType = "independent" | "vendor" | null;

const INDEPENDENT_FEATURES = [
  { icon: <Package className="w-4 h-4" />, text: "List up to 20 products" },
  { icon: <MessageCircle className="w-4 h-4" />, text: "WhatsApp buyer connections" },
  { icon: <BarChart2 className="w-4 h-4" />, text: "Basic analytics" },
  { icon: <Zap className="w-4 h-4" />, text: "Instant listing (no approval)" },
];

const VENDOR_FEATURES = [
  { icon: <ShieldCheck className="w-4 h-4" />, text: "Verified store badge" },
  { icon: <Package className="w-4 h-4" />, text: "Unlimited product listings" },
  { icon: <BarChart2 className="w-4 h-4" />, text: "Advanced analytics & orders" },
  { icon: <MessageCircle className="w-4 h-4" />, text: "Priority WhatsApp placement" },
  { icon: <Store className="w-4 h-4" />, text: "Business profile page" },
  { icon: <Zap className="w-4 h-4" />, text: "Featured in Best Deals engine" },
];

export default function SellerUpgrade() {
  const [, setLocation] = useLocation();
  const [selected, setSelected] = useState<SellerType>(null);

  const handleContinue = () => {
    if (selected) setLocation("/seller-dashboard");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-lg mx-auto px-4 py-6">
        <Button variant="ghost" size="sm" className="mb-4 gap-1 text-muted-foreground" onClick={() => setLocation("/profile")}>
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Start Selling</h1>
          <p className="text-sm text-muted-foreground mt-1.5 max-w-xs mx-auto">
            Choose the type of seller account that fits your needs
          </p>
        </motion.div>

        {/* Cards */}
        <div className="flex flex-col gap-4 mb-6">
          {/* Independent Seller */}
          <motion.button
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            onClick={() => setSelected("independent")}
            data-testid="card-independent"
            className={`text-left rounded-2xl border-2 p-5 transition-all ${
              selected === "independent"
                ? "border-[#F4B400] bg-[#F4B400]/5 ring-2 ring-[#F4B400]/20"
                : "border-border bg-card hover:border-[#F4B400]/50"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selected === "independent" ? "bg-[#F4B400]" : "bg-[#F4B400]/10"}`}>
                  <User className={`w-5 h-5 ${selected === "independent" ? "text-white" : "text-[#F4B400]"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Independent Seller</h3>
                  <p className="text-xs text-muted-foreground">Personal / Side hustle</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                selected === "independent" ? "bg-[#F4B400] border-[#F4B400]" : "border-border"
              }`}>
                {selected === "independent" && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="space-y-2">
              {INDEPENDENT_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-[#F4B400]">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border">
              <span className="text-lg font-bold text-foreground">Free</span>
              <span className="text-xs text-muted-foreground ml-1.5">forever</span>
            </div>
          </motion.button>

          {/* Vendor */}
          <motion.button
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 }}
            onClick={() => setSelected("vendor")}
            data-testid="card-vendor"
            className={`text-left rounded-2xl border-2 p-5 transition-all relative overflow-hidden ${
              selected === "vendor"
                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                : "border-border bg-card hover:border-primary/50"
            }`}
          >
            {/* Popular tag */}
            <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              RECOMMENDED
            </div>

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${selected === "vendor" ? "bg-primary" : "bg-primary/10"}`}>
                  <Store className={`w-5 h-5 ${selected === "vendor" ? "text-white" : "text-primary"}`} />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Verified Vendor</h3>
                  <p className="text-xs text-muted-foreground">Business / Store</p>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                selected === "vendor" ? "bg-primary border-primary" : "border-border"
              }`}>
                {selected === "vendor" && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <div className="space-y-2">
              {VENDOR_FEATURES.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-foreground">
                  <span className="text-primary">{f.icon}</span>
                  {f.text}
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex items-end gap-2">
              <div>
                <span className="text-lg font-bold text-foreground">₦2,500</span>
                <span className="text-xs text-muted-foreground ml-1">/month</span>
              </div>
              <span className="text-xs text-[#1DBF73] font-medium mb-0.5">Includes verification</span>
            </div>
          </motion.button>
        </div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
          <Button
            className="w-full h-12 font-semibold text-base gap-2"
            disabled={!selected}
            onClick={handleContinue}
            data-testid="btn-continue-seller"
          >
            Continue as {selected === "vendor" ? "Verified Vendor" : selected === "independent" ? "Independent Seller" : "..."} <ChevronRight className="w-4 h-4" />
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-3">
            You can upgrade or downgrade your plan anytime.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
