import { useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import {
  ArrowLeft, Store, Package, Edit3, Check, X,
  TrendingUp, ShoppingBag, Star, Clock, Truck, Plus,
  BarChart2, MessageCircle, ShieldCheck, Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListVendors, useGetVendorProducts, useUpdatePrice, useUpdateVendor, useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-[#F4B400]/15 text-[#c49000]",
  confirmed: "bg-[#3B82F6]/15 text-[#3B82F6]",
  delivered: "bg-[#1DBF73]/15 text-[#1DBF73]",
  cancelled: "bg-destructive/15 text-destructive",
};

function EditablePrice({ priceId, currentPrice, currentQty, onSave }: {
  priceId: number;
  currentPrice: number;
  currentQty: string;
  onSave: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [price, setPrice] = useState(String(currentPrice));
  const [qty, setQty] = useState(currentQty);
  const updatePrice = useUpdatePrice();

  const handleSave = () => {
    updatePrice.mutate(
      { id: priceId, data: { price: Number(price), quantity: qty } },
      { onSuccess: () => { setEditing(false); onSave(); } }
    );
  };

  if (!editing) {
    return (
      <div className="flex items-center gap-2">
        <span className="font-bold text-foreground">{formatNaira(currentPrice)}</span>
        <span className="text-xs text-muted-foreground">{currentQty}</span>
        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary">
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-7 w-24 text-xs" type="number" />
      <Input value={qty} onChange={(e) => setQty(e.target.value)} className="h-7 w-20 text-xs" />
      <button onClick={handleSave} disabled={updatePrice.isPending} className="text-primary hover:text-primary/80">
        <Check className="w-4 h-4" />
      </button>
      <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function SellerDashboard() {
  const [, setLocation] = useLocation();
  const [selectedVendorId, setSelectedVendorId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"listings" | "orders" | "analytics">("listings");
  const [refreshKey, setRefreshKey] = useState(0);

  const { data: vendors, isLoading: vendorsLoading } = useListVendors();
  const { data: products, isLoading: productsLoading } = useGetVendorProducts(
    selectedVendorId,
    { query: { enabled: selectedVendorId > 0 } }
  );
  const { data: orders, isLoading: ordersLoading } = useListOrders(
    { vendor_id: selectedVendorId },
    { query: { enabled: selectedVendorId > 0 } }
  );

  const updateVendor = useUpdateVendor();
  const updateOrderStatus = useUpdateOrderStatus();

  const selectedVendor = vendors?.find((v) => v.id === selectedVendorId);
  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;

  const handleStockToggle = () => {
    if (!selectedVendor) return;
    updateVendor.mutate({ id: selectedVendorId, data: { stock_available: !selectedVendor.stock_available } });
  };

  const handleOrderStatus = (orderId: number, status: string) => {
    updateOrderStatus.mutate({ id: orderId, data: { status } });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => setLocation("/profile")} className="text-muted-foreground">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="flex-1">
            <h1 className="text-xl font-bold text-foreground">Seller Dashboard</h1>
            <p className="text-xs text-muted-foreground">Manage listings, orders, and your store</p>
          </div>
          <Button size="sm" className="gap-1.5 text-xs h-8" data-testid="add-product-btn">
            <Plus className="w-3.5 h-3.5" /> Add Product
          </Button>
        </div>

        {/* Store selector */}
        <div className="bg-card border border-border rounded-xl p-4 mb-5">
          <label className="text-xs font-semibold text-muted-foreground mb-2 block">Your Store</label>
          {vendorsLoading ? (
            <Skeleton className="h-10 rounded-lg" />
          ) : (
            <Select value={selectedVendorId ? String(selectedVendorId) : ""} onValueChange={(v) => setSelectedVendorId(Number(v))}>
              <SelectTrigger className="w-full" data-testid="vendor-dropdown">
                <SelectValue placeholder="Select your store..." />
              </SelectTrigger>
              <SelectContent>
                {vendors?.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    <div className="flex items-center gap-2">
                      <span>{v.name}</span>
                      {v.verified && <ShieldCheck className="w-3 h-3 text-[#1DBF73]" />}
                      <span className="text-xs text-muted-foreground">— {v.location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedVendorId > 0 && selectedVendor ? (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { icon: <Package className="w-4 h-4 text-primary" />, label: "Listings", value: products?.length ?? "—", color: "text-primary" },
                { icon: <ShoppingBag className="w-4 h-4 text-[#3B82F6]" />, label: "Orders", value: orders?.length ?? "—", color: "text-[#3B82F6]" },
                { icon: <Star className="w-4 h-4 text-yellow-500" />, label: "Rating", value: selectedVendor.average_rating ? `${selectedVendor.average_rating.toFixed(1)}★` : "—", color: "text-yellow-600" },
                { icon: <TrendingUp className="w-4 h-4 text-[#1DBF73]" />, label: "Pending", value: pendingOrders, color: pendingOrders > 0 ? "text-[#F4B400]" : "text-foreground" },
              ].map((stat) => (
                <div key={stat.label} className={`bg-card border rounded-xl p-3 flex items-center gap-2.5 ${pendingOrders > 0 && stat.label === "Pending" ? "border-[#F4B400]/30" : "border-border"}`}>
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">{stat.label}</p>
                    <p className={`font-bold text-sm ${stat.color}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock + delivery bar */}
            <div className="bg-card border border-border rounded-xl p-4 mb-5 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Stock</p>
                  <p className={`text-sm font-bold ${selectedVendor.stock_available ? "text-[#1DBF73]" : "text-destructive"}`}>
                    {selectedVendor.stock_available ? "✓ Available" : "✗ Out of Stock"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={selectedVendor.stock_available ? "destructive" : "default"}
                  className="h-7 text-xs"
                  onClick={handleStockToggle}
                  disabled={updateVendor.isPending}
                >
                  {selectedVendor.stock_available ? "Mark Out" : "Mark In Stock"}
                </Button>
              </div>
              {selectedVendor.delivery_options && (
                <div className="flex items-center gap-1.5 text-xs text-[#3B82F6]">
                  <Truck className="w-3.5 h-3.5" /> {selectedVendor.delivery_options}
                </div>
              )}
              {selectedVendor.response_time && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" /> {selectedVendor.response_time}
                </div>
              )}
              {selectedVendor.whatsapp && (
                <a href={`https://wa.me/${selectedVendor.whatsapp}`} target="_blank" rel="noopener noreferrer" className="ml-auto">
                  <Button size="sm" className="h-7 text-xs gap-1 bg-[#25D366] hover:bg-[#22c55e] text-white border-0">
                    <MessageCircle className="w-3 h-3" /> WhatsApp
                  </Button>
                </a>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["listings", "orders", "analytics"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-1.5 rounded-full text-xs font-medium capitalize transition-colors ${
                    activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                  {tab === "orders" && pendingOrders > 0 && (
                    <span className="ml-1.5 bg-[#F4B400] text-white text-[10px] px-1.5 py-0.5 rounded-full">{pendingOrders}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Listings tab */}
            {activeTab === "listings" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm text-foreground">Product Listings ({products?.length ?? 0})</h3>
                    <p className="text-xs text-muted-foreground">Tap the pencil icon to update price</p>
                  </div>
                </div>
                {productsLoading ? (
                  <div className="p-4 space-y-3">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}</div>
                ) : !products?.length ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No listings yet. Add your first product!</div>
                ) : (
                  <div className="divide-y divide-border">
                    {products?.map((p, i) => (
                      <motion.div
                        key={p.price_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-4 py-3 flex items-center justify-between gap-4"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{p.product_name}</p>
                          <p className="text-xs text-muted-foreground">{p.category_name} · {p.unit}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <EditablePrice
                            priceId={p.price_id}
                            currentPrice={p.price}
                            currentQty={p.quantity}
                            onSave={() => setRefreshKey((k) => k + 1)}
                          />
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${p.stock_available ? "bg-[#1DBF73]/10 text-[#1DBF73]" : "bg-destructive/10 text-destructive"}`}>
                          {p.stock_available ? "In Stock" : "Out of Stock"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders tab */}
            {activeTab === "orders" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm text-foreground">Incoming Orders ({orders?.length ?? 0})</h3>
                </div>
                {ordersLoading ? (
                  <div className="p-4 space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}</div>
                ) : !orders?.length ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No orders yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {orders.map((order, i) => (
                      <motion.div key={order.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }} className="px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">#{order.id}</span>
                              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[order.status] ?? ""}`}>{order.status}</span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{order.product_name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {order.quantity} · {order.buyer_name}{order.buyer_phone && ` · ${order.buyer_phone}`}</p>
                            {order.notes && <p className="text-xs text-muted-foreground italic mt-0.5">"{order.notes}"</p>}
                            {order.price_at_order != null && (
                              <p className="text-sm font-bold text-[#F4B400] mt-1">{formatNaira(order.price_at_order * order.quantity)}</p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1.5 flex-shrink-0">
                            {order.status === "pending" && (
                              <>
                                <Button size="sm" className="h-7 text-xs" onClick={() => handleOrderStatus(order.id, "confirmed")}>Confirm</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs text-destructive border-destructive/30" onClick={() => handleOrderStatus(order.id, "cancelled")}>Cancel</Button>
                              </>
                            )}
                            {order.status === "confirmed" && (
                              <Button size="sm" className="h-7 text-xs bg-[#1DBF73] hover:bg-[#18a566]" onClick={() => handleOrderStatus(order.id, "delivered")}>Mark Delivered</Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Analytics tab */}
            {activeTab === "analytics" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl p-5 text-center">
                  <BarChart2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                  <p className="text-sm font-medium text-foreground">Analytics Coming Soon</p>
                  <p className="text-xs text-muted-foreground mt-1">View metrics, page views, and order trends</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Profile Views", value: "1,240", change: "+12% this week", color: "text-primary" },
                    { label: "WhatsApp Clicks", value: "88", change: "+5 today", color: "text-[#25D366]" },
                    { label: "Avg. Response", value: "< 30 min", change: "Excellent", color: "text-[#1DBF73]" },
                    { label: "Conversion Rate", value: "6.4%", change: "vs 4.1% avg", color: "text-[#F4B400]" },
                  ].map((m) => (
                    <div key={m.label} className="bg-card border border-border rounded-xl p-4">
                      <p className="text-xs text-muted-foreground mb-1">{m.label}</p>
                      <p className={`text-xl font-bold ${m.color}`}>{m.value}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{m.change}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select your store above to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}
