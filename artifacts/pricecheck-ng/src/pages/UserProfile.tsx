import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  User, MapPin, Heart, ShoppingBag, Star, ChevronRight,
  Bell, Settings, LogOut, Store, Package, Bookmark, Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

const PREFERENCES = [
  { key: "budgetFriendly", label: "Budget Friendly First", color: "text-[#F4B400]", bg: "bg-[#F4B400]/10" },
  { key: "bestValue", label: "Best Value", color: "text-primary", bg: "bg-primary/10" },
  { key: "trustedOnly", label: "Trusted Sellers Only", color: "text-[#1DBF73]", bg: "bg-[#1DBF73]/10" },
  { key: "nearMe", label: "Near Me", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
  { key: "fastDelivery", label: "Fast Delivery", color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
];

const MOCK_ORDERS = [
  { id: 1, product: "Bags of Rice (50kg)", vendor: "AP Plaza Market", price: 62000, status: "delivered" },
  { id: 2, product: "Indomie Noodles (40 packs)", vendor: "Shoprite Nigeria", price: 8200, status: "pending" },
];

const SAVED = [
  { id: 1, name: "iPhone 14 Pro", minPrice: 420000 },
  { id: 2, name: "Petrol (Per Litre)", minPrice: 890 },
];

export default function UserProfile() {
  const [, setLocation] = useLocation();
  const [prefs, setPrefs] = useState({
    budgetFriendly: true, bestValue: true, trustedOnly: false, nearMe: true, fastDelivery: false,
  });
  const [activeSection, setActiveSection] = useState<"overview" | "orders" | "saved" | "preferences">("overview");

  const togglePref = (key: string) =>
    setPrefs((p) => ({ ...p, [key]: !p[key as keyof typeof p] }));

  const STATUS_COLORS: Record<string, string> = {
    pending: "bg-[#F4B400]/15 text-[#c49000]",
    confirmed: "bg-[#3B82F6]/15 text-[#3B82F6]",
    delivered: "bg-[#1DBF73]/15 text-[#1DBF73]",
    cancelled: "bg-destructive/15 text-destructive",
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-6">

        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-2xl overflow-hidden mb-6"
        >
          <div className="h-24 bg-gradient-to-r from-primary to-emerald-400" />
          <div className="bg-card border border-border px-5 pb-5">
            <div className="flex items-end justify-between -mt-10 mb-3">
              <div className="w-20 h-20 rounded-2xl bg-primary/20 border-4 border-card flex items-center justify-center">
                <User className="w-8 h-8 text-primary" />
              </div>
              <Button variant="outline" size="sm" className="mb-1 gap-1.5 text-xs">
                <Settings className="w-3.5 h-3.5" /> Edit Profile
              </Button>
            </div>
            <h2 className="text-xl font-bold text-foreground">Emeka Okonkwo</h2>
            <div className="flex items-center gap-1.5 text-sm text-[#3B82F6] mt-0.5">
              <MapPin className="w-3.5 h-3.5" /> Lagos, Nigeria
            </div>
            <div className="flex items-center gap-3 mt-3">
              <Badge className="bg-[#1DBF73]/10 text-[#1DBF73] border-0 text-xs gap-1">
                <Star className="w-3 h-3 fill-current" /> Verified User
              </Badge>
              <span className="text-xs text-muted-foreground">+234 801 234 5678</span>
            </div>
          </div>
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          {[
            { icon: <ShoppingBag className="w-4 h-4 text-primary" />, label: "Orders", value: "12" },
            { icon: <Bookmark className="w-4 h-4 text-[#F4B400]" />, label: "Saved", value: "5" },
            { icon: <Activity className="w-4 h-4 text-[#1DBF73]" />, label: "Searches", value: "48" },
          ].map((s) => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-3 text-center">
              <div className="flex justify-center mb-1">{s.icon}</div>
              <p className="font-bold text-foreground text-lg">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
          {(["overview", "orders", "saved", "preferences"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSection(tab)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                activeSection === tab
                  ? "bg-primary text-primary-foreground"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeSection === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {[
              { icon: <ShoppingBag className="w-4 h-4 text-primary" />, label: "My Orders", sub: "Track your purchases", onClick: () => setActiveSection("orders") },
              { icon: <Bookmark className="w-4 h-4 text-[#F4B400]" />, label: "Saved Items", sub: "Products you bookmarked", onClick: () => setActiveSection("saved") },
              { icon: <Bell className="w-4 h-4 text-[#3B82F6]" />, label: "Price Alerts", sub: "3 active alerts", onClick: () => {} },
              { icon: <Settings className="w-4 h-4 text-muted-foreground" />, label: "Preferences", sub: "Ranking & filter settings", onClick: () => setActiveSection("preferences") },
            ].map((item) => (
              <button
                key={item.label}
                onClick={item.onClick}
                className="w-full bg-card border border-border rounded-xl px-4 py-3.5 flex items-center gap-3 hover:border-primary/30 transition-colors text-left"
              >
                <div className="w-9 h-9 bg-muted rounded-xl flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm text-foreground">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.sub}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Orders */}
        {activeSection === "orders" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {MOCK_ORDERS.map((order) => (
              <div key={order.id} className="bg-card border border-border rounded-xl p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-sm text-foreground">{order.product}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{order.vendor}</p>
                    <p className="text-sm font-bold text-primary mt-1">₦{order.price.toLocaleString()}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
            {MOCK_ORDERS.length === 0 && (
              <div className="text-center py-12 text-muted-foreground text-sm">No orders yet.</div>
            )}
          </motion.div>
        )}

        {/* Saved items */}
        {activeSection === "saved" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {SAVED.map((item) => (
              <button
                key={item.id}
                onClick={() => setLocation(`/product/${item.id}`)}
                className="w-full bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/30 transition-colors text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Package className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                    <p className="text-xs text-[#F4B400] font-semibold">From ₦{item.minPrice.toLocaleString()}</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </button>
            ))}
          </motion.div>
        )}

        {/* Preferences */}
        {activeSection === "preferences" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="text-xs text-muted-foreground mb-2">These preferences control how products are ranked for you.</p>
            {PREFERENCES.map((pref) => (
              <div key={pref.key} className="bg-card border border-border rounded-xl px-4 py-3.5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${pref.bg} ${pref.color}`}>
                    {pref.label}
                  </span>
                </div>
                <Switch
                  checked={prefs[pref.key as keyof typeof prefs]}
                  onCheckedChange={() => togglePref(pref.key)}
                />
              </div>
            ))}
          </motion.div>
        )}

        {/* Become a Seller CTA */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mt-6 rounded-2xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary to-emerald-400 p-5 text-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base">Become a Seller</h3>
                <p className="text-xs text-white/80">List your products and reach buyers</p>
              </div>
            </div>
            <Button
              className="w-full bg-white text-primary hover:bg-white/90 font-semibold h-10"
              onClick={() => setLocation("/seller-upgrade")}
              data-testid="become-seller-btn"
            >
              Get Started →
            </Button>
          </div>
        </motion.div>

        {/* Sign out */}
        <button className="w-full mt-4 flex items-center justify-center gap-2 py-3 text-sm text-muted-foreground hover:text-destructive transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}
