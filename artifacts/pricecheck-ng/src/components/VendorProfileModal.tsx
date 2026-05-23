import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShieldCheck, MapPin, MessageCircle, Package, Truck, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetVendor, useListVendorReviews, useCreateVendorReview } from "@workspace/api-client-react";

interface VendorProfileModalProps {
  vendorId: number | null;
  onClose: () => void;
}

function StarRating({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          data-testid={`star-${n}`}
        >
          <Star
            className={`w-6 h-6 transition-colors ${
              n <= (hovered || value)
                ? "text-yellow-500 fill-yellow-500"
                : "text-muted-foreground"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

export default function VendorProfileModal({ vendorId, onClose }: VendorProfileModalProps) {
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewName, setReviewName] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);
  const [showAllReviews, setShowAllReviews] = useState(false);

  const { data: vendor, isLoading: vendorLoading } = useGetVendor(
    vendorId ?? 0,
    { query: { enabled: vendorId != null && vendorId > 0 } }
  );

  const { data: reviews, isLoading: reviewsLoading } = useListVendorReviews(
    vendorId ?? 0,
    { query: { enabled: vendorId != null && vendorId > 0 } }
  );

  const createReview = useCreateVendorReview();

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorId || !reviewName.trim() || reviewRating === 0) return;
    createReview.mutate(
      {
        id: vendorId,
        data: { rating: reviewRating, reviewer_name: reviewName, comment: reviewComment || undefined },
      },
      { onSuccess: () => setReviewSubmitted(true) }
    );
  };

  if (!vendorId) return null;

  const displayedReviews = showAllReviews ? reviews : reviews?.slice(0, 3);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" data-testid="vendor-profile-modal">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50"
          onClick={onClose}
        />
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 60 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg bg-background rounded-t-2xl sm:rounded-2xl shadow-2xl border border-border max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="sticky top-0 bg-background border-b border-border px-5 py-4 flex items-center justify-between rounded-t-2xl">
            <h2 className="font-bold text-foreground">Vendor Profile</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5">
            {vendorLoading ? (
              <div className="space-y-3">
                <Skeleton className="h-16 rounded-xl" />
                <Skeleton className="h-24 rounded-xl" />
              </div>
            ) : vendor ? (
              <>
                {/* Vendor header */}
                <div className="flex items-start gap-4 mb-5">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
                    {vendor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-bold text-lg text-foreground">{vendor.name}</h3>
                      {vendor.verified && (
                        <Badge className="text-xs bg-primary/10 text-primary border-0 gap-1">
                          <ShieldCheck className="w-3 h-3" /> Verified
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-0.5">
                      <MapPin className="w-3.5 h-3.5" /> {vendor.location}
                    </div>
                    {vendor.address && (
                      <p className="text-xs text-muted-foreground mt-0.5">{vendor.address}</p>
                    )}
                    {vendor.average_rating != null && vendor.average_rating > 0 && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="flex">
                          {[1,2,3,4,5].map((n) => (
                            <Star key={n} className={`w-3.5 h-3.5 ${n <= Math.round(vendor.average_rating!) ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold">{vendor.average_rating.toFixed(1)}</span>
                        <span className="text-xs text-muted-foreground">({vendor.rating_count} reviews)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Info grid */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="bg-muted/50 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Package className="w-3.5 h-3.5" /> Stock Status
                    </div>
                    <p className={`text-sm font-semibold ${vendor.stock_available ? "text-primary" : "text-destructive"}`}>
                      {vendor.stock_available ? "In Stock" : "Out of Stock"}
                    </p>
                  </div>
                  {vendor.response_time && (
                    <div className="bg-muted/50 rounded-xl p-3">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Clock className="w-3.5 h-3.5" /> Response Time
                      </div>
                      <p className="text-sm font-semibold text-foreground">{vendor.response_time}</p>
                    </div>
                  )}
                  {vendor.delivery_options && (
                    <div className="bg-muted/50 rounded-xl p-3 col-span-2">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                        <Truck className="w-3.5 h-3.5" /> Delivery Options
                      </div>
                      <p className="text-sm font-semibold text-foreground">{vendor.delivery_options}</p>
                    </div>
                  )}
                </div>

                {/* WhatsApp button */}
                {vendor.whatsapp && (
                  <a
                    href={`https://wa.me/${vendor.whatsapp}?text=Hi%20${encodeURIComponent(vendor.name)}%2C%20I%20found%20you%20on%20PriceCheck%20NG!`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mb-5"
                  >
                    <Button className="w-full gap-2 bg-[#25D366] hover:bg-[#22c55e] text-white border-0" data-testid="vendor-whatsapp-btn">
                      <MessageCircle className="w-4 h-4" /> Chat on WhatsApp
                    </Button>
                  </a>
                )}

                {/* Reviews */}
                <div className="mb-5">
                  <h4 className="font-semibold text-sm text-foreground mb-3">Customer Reviews</h4>
                  {reviewsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-16 rounded-xl" />
                      <Skeleton className="h-16 rounded-xl" />
                    </div>
                  ) : reviews && reviews.length > 0 ? (
                    <div className="space-y-2">
                      {displayedReviews?.map((r) => (
                        <div key={r.id} className="bg-muted/40 rounded-xl p-3" data-testid={`review-${r.id}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-semibold text-foreground">{r.reviewer_name}</span>
                            <div className="flex">
                              {[1,2,3,4,5].map((n) => (
                                <Star key={n} className={`w-3 h-3 ${n <= r.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                              ))}
                            </div>
                          </div>
                          {r.comment && <p className="text-xs text-muted-foreground">{r.comment}</p>}
                        </div>
                      ))}
                      {reviews.length > 3 && (
                        <button
                          onClick={() => setShowAllReviews(!showAllReviews)}
                          className="text-xs text-primary font-medium flex items-center gap-1 mt-1 hover:underline"
                        >
                          {showAllReviews ? <><ChevronUp className="w-3 h-3" /> Show less</> : <><ChevronDown className="w-3 h-3" /> Show all {reviews.length} reviews</>}
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground">No reviews yet. Be the first!</p>
                  )}
                </div>

                {/* Write a review */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-semibold text-sm text-foreground mb-3">Write a Review</h4>
                  {reviewSubmitted ? (
                    <div className="text-center py-3">
                      <p className="text-sm font-medium text-primary">Thank you for your review! ✓</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitReview} className="space-y-3">
                      <StarRating value={reviewRating} onChange={setReviewRating} />
                      <Input
                        placeholder="Your name"
                        value={reviewName}
                        onChange={(e) => setReviewName(e.target.value)}
                        className="h-9 text-sm"
                        data-testid="review-name-input"
                      />
                      <Input
                        placeholder="Share your experience (optional)"
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        className="h-9 text-sm"
                        data-testid="review-comment-input"
                      />
                      <Button
                        type="submit"
                        size="sm"
                        className="w-full"
                        disabled={reviewRating === 0 || !reviewName.trim() || createReview.isPending}
                        data-testid="submit-review-btn"
                      >
                        {createReview.isPending ? "Submitting..." : "Submit Review"}
                      </Button>
                    </form>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
