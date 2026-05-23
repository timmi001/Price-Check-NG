import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingCart, MessageCircle, CheckCircle2, ShieldCheck, Star, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatNaira } from "@/lib/format";
import { useCreateOrder } from "@workspace/api-client-react";
import type { BestDeal } from "@workspace/api-client-react";

interface OrderModalProps {
  open: boolean;
  onClose: () => void;
  option: BestDeal["options"][0] | null;
  productId: number;
  productName: string;
}

type Step = "details" | "confirm" | "success";

export default function OrderModal({ open, onClose, option, productId, productName }: OrderModalProps) {
  const [step, setStep] = useState<Step>("details");
  const [buyerName, setBuyerName] = useState("");
  const [buyerPhone, setBuyerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [orderId, setOrderId] = useState<number | null>(null);

  const createOrder = useCreateOrder();

  const reset = () => {
    setStep("details");
    setBuyerName("");
    setBuyerPhone("");
    setNotes("");
    setQuantity(1);
    setOrderId(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleConfirm = async () => {
    if (!option || !buyerName.trim()) return;
    createOrder.mutate(
      {
        data: {
          product_id: productId,
          vendor_id: option.vendor_id,
          quantity,
          buyer_name: buyerName,
          buyer_phone: buyerPhone || undefined,
          notes: notes || undefined,
          price_at_order: option.price,
        },
      },
      {
        onSuccess: (data) => {
          setOrderId(data.id);
          setStep("success");
        },
      }
    );
  };

  const whatsappUrl = () => {
    if (!option?.vendor_whatsapp) return null;
    const msg = encodeURIComponent(
      `Hi ${option.vendor_name}, I found you on PriceCheck NG.\n\nOrder Details:\n📦 Product: ${productName}\n🔢 Quantity: ${quantity} × ${option.quantity}\n💰 Price: ${formatNaira(option.price)} per unit\n👤 Name: ${buyerName}${buyerPhone ? `\n📞 Phone: ${buyerPhone}` : ""}${notes ? `\n📝 Notes: ${notes}` : ""}\n\nPlease confirm my order. Thank you!`
    );
    return `https://wa.me/${option.vendor_whatsapp}?text=${msg}`;
  };

  if (!open || !option) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" data-testid="order-modal">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={handleClose}
        />

        {/* Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-md bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between rounded-t-2xl sm:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-foreground">
                {step === "success" ? "Order Placed! 🎉" : "Place Order"}
              </h2>
            </div>
            <button onClick={handleClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            {step === "details" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                {/* Product summary */}
                <div className="bg-muted/50 rounded-xl p-3 mb-5">
                  <p className="text-xs text-muted-foreground mb-1">Ordering from</p>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                      {option.vendor_name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="font-semibold text-sm">{option.vendor_name}</span>
                        {option.vendor_verified && <ShieldCheck className="w-3.5 h-3.5 text-primary" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{option.vendor_location}</span>
                    </div>
                    {option.vendor_rating != null && option.vendor_rating > 0 && (
                      <div className="ml-auto flex items-center gap-0.5">
                        <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                        <span className="text-xs font-semibold">{option.vendor_rating.toFixed(1)}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-foreground">{productName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-xs text-muted-foreground">{option.quantity}</span>
                    <span className="text-lg font-bold text-primary">{formatNaira(option.price)}</span>
                  </div>
                </div>

                {/* Quantity */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">Quantity</label>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted font-bold"
                    >
                      −
                    </button>
                    <span className="font-bold text-lg w-8 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-foreground hover:bg-muted font-bold"
                    >
                      +
                    </button>
                    <span className="text-sm text-muted-foreground ml-1">
                      = <strong className="text-primary">{formatNaira(option.price * quantity)}</strong>
                    </span>
                  </div>
                </div>

                {/* Buyer details */}
                <div className="flex flex-col gap-3 mb-5">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Your Name *</label>
                    <Input
                      value={buyerName}
                      onChange={(e) => setBuyerName(e.target.value)}
                      placeholder="Emeka Okonkwo"
                      className="h-9 text-sm"
                      data-testid="buyer-name-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Phone Number (optional)</label>
                    <Input
                      value={buyerPhone}
                      onChange={(e) => setBuyerPhone(e.target.value)}
                      placeholder="+234 801 234 5678"
                      className="h-9 text-sm"
                      data-testid="buyer-phone-input"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Notes (optional)</label>
                    <Input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Delivery address, special requests..."
                      className="h-9 text-sm"
                      data-testid="order-notes-input"
                    />
                  </div>
                </div>

                <Button
                  className="w-full h-11 font-semibold gap-2"
                  disabled={!buyerName.trim()}
                  onClick={() => setStep("confirm")}
                  data-testid="btn-next-confirm"
                >
                  Continue to Confirm
                </Button>
              </motion.div>
            )}

            {step === "confirm" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="bg-muted/50 rounded-xl p-4 mb-5 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{productName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Vendor</span><span className="font-medium">{option.vendor_name}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Qty</span><span className="font-medium">{quantity} × {option.quantity}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Your name</span><span className="font-medium">{buyerName}</span></div>
                  {buyerPhone && <div className="flex justify-between"><span className="text-muted-foreground">Phone</span><span className="font-medium">{buyerPhone}</span></div>}
                  {notes && <div className="flex justify-between"><span className="text-muted-foreground">Notes</span><span className="font-medium text-right max-w-[60%]">{notes}</span></div>}
                  <div className="border-t border-border pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span className="text-primary text-lg">{formatNaira(option.price * quantity)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <Button className="w-full h-11 font-semibold gap-2" onClick={handleConfirm} disabled={createOrder.isPending} data-testid="btn-confirm-order">
                    {createOrder.isPending ? "Placing order..." : "✓ Confirm Order"}
                  </Button>
                  {option.vendor_whatsapp && (
                    <a href={whatsappUrl() ?? "#"} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" className="w-full h-10 gap-2 text-sm bg-[#25D366]/10 border-[#25D366]/30 text-[#25D366] hover:bg-[#25D366]/20">
                        <MessageCircle className="w-4 h-4" /> Order via WhatsApp instead
                      </Button>
                    </a>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => setStep("details")} className="text-muted-foreground">
                    ← Go back
                  </Button>
                </div>
              </motion.div>
            )}

            {step === "success" && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-1">Order #{orderId} Placed!</h3>
                <p className="text-sm text-muted-foreground mb-5">
                  Your order has been sent to <strong>{option.vendor_name}</strong>. They'll confirm shortly.
                </p>

                <div className="bg-muted/50 rounded-xl p-4 text-sm text-left mb-5 space-y-1">
                  <div className="flex justify-between"><span className="text-muted-foreground">Status</span><Badge className="text-xs bg-yellow-500/15 text-yellow-700 border-0">Pending</Badge></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Product</span><span className="font-medium">{productName}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Total</span><span className="font-bold text-primary">{formatNaira(option.price * quantity)}</span></div>
                </div>

                {option.vendor_whatsapp && (
                  <a href={whatsappUrl() ?? "#"} target="_blank" rel="noopener noreferrer" className="block mb-3">
                    <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white border-0">
                      <MessageCircle className="w-4 h-4" /> Chat with vendor on WhatsApp
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="w-full" onClick={handleClose}>Done</Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
