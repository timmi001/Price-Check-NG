import { useState } from "react";
import { motion } from "framer-motion";
import { Store, Package, Edit3, Check, X, TrendingUp, ShoppingBag, Star, Clock, Truck, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useListVendors, useGetVendorProducts, useUpdatePrice, useUpdateVendor, useListOrders, useUpdateOrderStatus } from "@workspace/api-client-react";
import { formatNaira } from "@/lib/format";

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  confirmed: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
  delivered: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
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
        <button onClick={() => setEditing(true)} className="text-muted-foreground hover:text-primary" data-testid={`edit-price-${priceId}`}>
          <Edit3 className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      <Input value={price} onChange={(e) => setPrice(e.target.value)} className="h-7 w-24 text-xs" type="number" />
      <Input value={qty} onChange={(e) => setQty(e.target.value)} className="h-7 w-20 text-xs" />
      <button onClick={handleSave} disabled={updatePrice.isPending} className="text-primary hover:text-primary/80" data-testid={`save-price-${priceId}`}>
        <Check className="w-4 h-4" />
      </button>
      <button onClick={() => setEditing(false)} className="text-muted-foreground hover:text-foreground">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

export default function VendorDashboard() {
  const [selectedVendorId, setSelectedVendorId] = useState<number>(0);
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
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

  const handleStockToggle = () => {
    if (!selectedVendor) return;
    updateVendor.mutate({
      id: selectedVendorId,
      data: { stock_available: !selectedVendor.stock_available },
    });
  };

  const handleOrderStatus = (orderId: number, status: string) => {
    updateOrderStatus.mutate({ id: orderId, data: { status } });
  };

  const pendingOrders = orders?.filter((o) => o.status === "pending").length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
            <Store className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Vendor Dashboard</h1>
            <p className="text-sm text-muted-foreground">Manage your products, prices, and orders</p>
          </div>
        </div>

        {/* Vendor selector */}
        <div className="bg-card border border-border rounded-xl p-4 mb-6" data-testid="vendor-selector-card">
          <label className="text-sm font-semibold text-muted-foreground mb-2 block">Select Your Store</label>
          {vendorsLoading ? (
            <Skeleton className="h-10 rounded-lg" />
          ) : (
            <Select
              value={selectedVendorId ? String(selectedVendorId) : ""}
              onValueChange={(v) => setSelectedVendorId(Number(v))}
            >
              <SelectTrigger className="w-full" data-testid="vendor-dropdown">
                <SelectValue placeholder="Choose a vendor to manage..." />
              </SelectTrigger>
              <SelectContent>
                {vendors?.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)} data-testid={`vendor-option-${v.id}`}>
                    <div className="flex items-center gap-2">
                      <span>{v.name}</span>
                      {v.verified && <Badge className="text-[10px] bg-primary/10 text-primary border-0 py-0">Verified</Badge>}
                      <span className="text-xs text-muted-foreground">— {v.location}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {selectedVendorId > 0 && selectedVendor && (
          <>
            {/* Vendor stats bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: <Package className="w-4 h-4 text-primary" />, label: "Products", value: products?.length ?? "—" },
                { icon: <ShoppingBag className="w-4 h-4 text-blue-500" />, label: "Orders", value: orders?.length ?? "—" },
                { icon: <Star className="w-4 h-4 text-yellow-500" />, label: "Rating", value: selectedVendor.average_rating ? `${selectedVendor.average_rating.toFixed(1)}/5` : "—" },
                { icon: <TrendingUp className="w-4 h-4 text-green-500" />, label: "Pending", value: pendingOrders, highlight: pendingOrders > 0 },
              ].map((stat) => (
                <div key={stat.label} className={`bg-card border rounded-xl p-3 flex items-center gap-3 ${stat.highlight ? "border-yellow-300 dark:border-yellow-700" : "border-border"}`}>
                  <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center flex-shrink-0">
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className={`font-bold text-sm ${stat.highlight ? "text-yellow-600 dark:text-yellow-400" : "text-foreground"}`}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Stock toggle & delivery info */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground">Stock Status</p>
                  <p className={`text-sm font-bold ${selectedVendor.stock_available ? "text-primary" : "text-destructive"}`}>
                    {selectedVendor.stock_available ? "✓ In Stock" : "✗ Out of Stock"}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant={selectedVendor.stock_available ? "destructive" : "default"}
                  className="h-8 text-xs"
                  onClick={handleStockToggle}
                  disabled={updateVendor.isPending}
                  data-testid="toggle-stock-btn"
                >
                  {selectedVendor.stock_available ? "Mark Out of Stock" : "Mark In Stock"}
                </Button>
              </div>
              {selectedVendor.delivery_options && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Truck className="w-4 h-4" /> {selectedVendor.delivery_options}
                </div>
              )}
              {selectedVendor.response_time && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" /> Responds {selectedVendor.response_time}
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              {(["products", "orders"] as const).map((tab) => (
                <button
                  key={tab}
                  data-testid={`tab-${tab}`}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                    activeTab === tab ? "bg-primary text-primary-foreground" : "bg-card border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab}
                  {tab === "orders" && pendingOrders > 0 && (
                    <span className="ml-1.5 bg-yellow-500 text-white text-xs px-1.5 py-0.5 rounded-full">{pendingOrders}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Products tab */}
            {activeTab === "products" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden" data-testid="products-table">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm text-foreground">Your Listings ({products?.length ?? 0})</h3>
                  <p className="text-xs text-muted-foreground">Click the edit icon to update price or quantity</p>
                </div>
                {productsLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-xl" />)}
                  </div>
                ) : products?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No products listed yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {products?.map((p, i) => (
                      <motion.div
                        key={p.price_id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-4 py-3 flex items-center justify-between gap-4"
                        data-testid={`product-row-${p.price_id}`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-foreground truncate">{p.product_name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {p.category_name && <span>{p.category_name}</span>}
                            <span>•</span><span>{p.unit}</span>
                          </div>
                        </div>
                        <div className="flex-shrink-0">
                          <EditablePrice
                            priceId={p.price_id}
                            currentPrice={p.price}
                            currentQty={p.quantity}
                            onSave={() => setRefreshKey((k) => k + 1)}
                          />
                        </div>
                        <Badge className={`text-xs flex-shrink-0 border-0 ${p.stock_available ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                          {p.stock_available ? "In Stock" : "Out of Stock"}
                        </Badge>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Orders tab */}
            {activeTab === "orders" && (
              <div className="bg-card border border-border rounded-xl overflow-hidden" data-testid="orders-table">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="font-semibold text-sm text-foreground">Incoming Orders ({orders?.length ?? 0})</h3>
                </div>
                {ordersLoading ? (
                  <div className="p-4 space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
                  </div>
                ) : orders?.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">No orders yet.</div>
                ) : (
                  <div className="divide-y divide-border">
                    {orders?.map((order, i) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.04 }}
                        className="px-4 py-4"
                        data-testid={`order-row-${order.id}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="font-semibold text-sm text-foreground">#{order.id}</span>
                              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[order.status] ?? ""}`}>
                                {order.status}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-foreground">{order.product_name}</p>
                            <p className="text-xs text-muted-foreground">
                              Qty: {order.quantity} • Customer: {order.buyer_name}
                              {order.buyer_phone && ` • ${order.buyer_phone}`}
                            </p>
                            {order.notes && (
                              <p className="text-xs text-muted-foreground mt-0.5 italic">"{order.notes}"</p>
                            )}
                            {order.price_at_order != null && (
                              <p className="text-sm font-bold text-primary mt-1">{formatNaira(order.price_at_order * order.quantity)}</p>
                            )}
                          </div>
                          {order.status === "pending" && (
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              <Button
                                size="sm"
                                className="h-7 text-xs"
                                onClick={() => handleOrderStatus(order.id, "confirmed")}
                                data-testid={`btn-confirm-${order.id}`}
                              >
                                Confirm
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="h-7 text-xs text-destructive border-destructive/30"
                                onClick={() => handleOrderStatus(order.id, "cancelled")}
                                data-testid={`btn-cancel-${order.id}`}
                              >
                                Cancel
                              </Button>
                            </div>
                          )}
                          {order.status === "confirmed" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs flex-shrink-0 bg-green-600 hover:bg-green-700"
                              onClick={() => handleOrderStatus(order.id, "delivered")}
                              data-testid={`btn-delivered-${order.id}`}
                            >
                              Mark Delivered
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}

        {!selectedVendorId && (
          <div className="text-center py-16 text-muted-foreground">
            <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Select your store above to manage products and orders</p>
          </div>
        )}
      </div>
    </div>
  );
}
