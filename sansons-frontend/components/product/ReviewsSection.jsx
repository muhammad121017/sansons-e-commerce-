"use client";

import { useEffect, useState, useRef } from "react";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import { formatDate } from "@/lib/utils";
import { BadgeCheck, Camera, Image as ImageIcon, Star, Trash2, Plus, X, UploadCloud, MessageSquare } from "lucide-react";
import { useToast } from "@/lib/context/ToastContext";
import api from "@/lib/api";

export default function ReviewsSection({ product }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [authorName, setAuthorName] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [activeImageModal, setActiveImageModal] = useState(null);

  const galleryInputRef = useRef(null);
  const cameraInputRef = useRef(null);
  const { showToast } = useToast();

  const fetchReviews = async () => {
    if (!product?.id) return;
    setLoading(true);
    try {
      const res = await api.get(`products/reviews/?product=${product.id}`);
      const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
      setReviews(list);
    } catch (err) {
      console.warn("Failed to fetch product reviews", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product?.id]);

  const handleFilesSelected = (files) => {
    if (!files || files.length === 0) return;
    
    Array.from(files).forEach((file) => {
      if (file.size > 5 * 1024 * 1024) {
        if (showToast) showToast(`Image ${file.name} exceeds 5MB limit`, "warning");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setImages((prev) => [...prev, e.target.result]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!product?.id) return;
    if (!comment.trim()) {
      if (showToast) showToast("Please enter your review feedback", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        product: product.id,
        rating,
        author_name: authorName.trim() || "Verified Buyer",
        comment: comment.trim(),
        images,
      };

      const res = await api.post("products/reviews/", payload);
      if (showToast) showToast("Thank you! Your review with photos has been posted.", "success");
      
      setComment("");
      setImages([]);
      setShowForm(false);
      
      // Instantly add to live list
      const newRev = res.data;
      setReviews((prev) => [newRev, ...prev]);
    } catch (err) {
      if (showToast) showToast("Failed to post review. Please try again.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / reviews.length).toFixed(1)
    : (product?.rating || 5.0);

  return (
    <div className="space-y-8">
      {/* Reviews Header & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-6 bg-paper p-6 border border-line rounded-lg">
        <div className="flex items-center gap-6">
          <div className="text-center shrink-0">
            <p className="font-display text-4xl font-bold text-forest">{avgRating}</p>
            <StarRating rating={parseFloat(avgRating)} showCount={false} size={16} />
            <p className="text-xs text-ink2 mt-1 font-medium">{reviews.length} Customer Reviews</p>
          </div>
          <div className="hidden sm:block border-l border-line pl-6">
            <h3 className="font-medium text-sm text-ink mb-1">Customer Reviews &amp; Photos</h3>
            <p className="text-xs text-ink2 leading-relaxed max-w-sm">
              Real feedback from verified purchasers. Share your experience and upload photos directly from your camera or gallery.
            </p>
          </div>
        </div>

        <Button onClick={() => setShowForm(!showForm)} variant="primary" size="sm">
          {showForm ? <X size={15} /> : <MessageSquare size={15} />}
          {showForm ? "Cancel Review" : "Write a Customer Review"}
        </Button>
      </div>

      {/* Write Review Form Card */}
      {showForm && (
        <form onSubmit={handleSubmitReview} className="bg-paper border-2 border-forest/30 rounded-lg p-6 space-y-6 shadow-soft">
          <h3 className="font-display text-lg text-ink font-semibold border-b border-line pb-3 flex items-center gap-2">
            <Star className="text-forest fill-forest" size={18} /> Share Your Experience &amp; Photos
          </h3>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Your Name</label>
              <input
                type="text"
                required
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="e.g. Ali Raza"
                className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Overall Rating</label>
              <div className="flex items-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform focus:outline-none"
                  >
                    <Star
                      size={24}
                      className={star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}
                    />
                  </button>
                ))}
                <span className="text-xs font-semibold text-ink ml-2">{rating} of 5 Stars</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-ink2 mb-2 font-medium">Review Comment / Feedback</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Tell us about the quality, fit, craftsmanship, and overall experience..."
              className="w-full border border-line rounded-sm px-3.5 py-2.5 bg-canvas outline-none focus:border-forest text-sm"
            />
          </div>

          {/* Photo Upload Options: Gallery & Camera */}
          <div className="space-y-3">
            <label className="block text-xs uppercase tracking-wider text-ink2 font-medium">
              Attach Product Photos (Gallery or Live Camera Capture)
            </label>

            {/* File Inputs (Hidden) */}
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={(e) => handleFilesSelected(e.target.files)}
            />

            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => galleryInputRef.current?.click()}
                className="flex items-center gap-2 border border-line bg-canvas hover:border-forest px-4 py-2.5 rounded-sm text-xs font-medium transition-colors"
              >
                <ImageIcon size={16} className="text-forest" /> Select from Gallery
              </button>

              <button
                type="button"
                onClick={() => cameraInputRef.current?.click()}
                className="flex items-center gap-2 border border-line bg-canvas hover:border-forest px-4 py-2.5 rounded-sm text-xs font-medium transition-colors"
              >
                <Camera size={16} className="text-wine" /> Take Photo with Camera
              </button>
            </div>

            {/* Uploaded Photos Thumbnails Grid */}
            {images.length > 0 && (
              <div className="flex flex-wrap gap-3 pt-3">
                {images.map((img, idx) => (
                  <div key={idx} className="relative group w-20 h-20 rounded-md overflow-hidden border border-line bg-paper">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-rose-600 text-white rounded-full p-1 shadow hover:bg-rose-700 transition-colors"
                      title="Remove Photo"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-line">
            <Button type="button" onClick={() => setShowForm(false)} variant="outline" size="sm">
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={submitting}>
              {submitting ? "Posting Review…" : "Submit Review"}
            </Button>
          </div>
        </form>
      )}

      {/* Review List */}
      {loading ? (
        <p className="text-sm text-ink2 py-8 text-center">Loading customer reviews...</p>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-paper border border-line rounded-lg p-8">
          <MessageSquare className="w-10 h-10 text-ink2 mx-auto mb-3 opacity-40" />
          <h4 className="font-medium text-ink mb-1">No Customer Reviews Yet</h4>
          <p className="text-xs text-ink2 mb-4">Be the first customer to share a review and upload photos of this item.</p>
          <Button onClick={() => setShowForm(true)} variant="outline" size="xs">
            <Plus size={14} /> Write First Review
          </Button>
        </div>
      ) : (
        <ul className="divide-y divide-line bg-paper border border-line rounded-lg px-6">
          {reviews.map((r) => {
            const author = r.author_name || r.purchaser_name || "Verified Customer";
            const dateStr = r.date || r.created_at;
            const revImages = Array.isArray(r.images) ? r.images : [];

            return (
              <li key={r.id || r.created_at} className="py-6 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <StarRating rating={r.rating} showCount={false} size={14} />
                    <span className="text-xs font-semibold text-ink">{r.rating}.0 / 5.0</span>
                  </div>
                  {dateStr && <span className="text-xs text-ink2 font-mono">{formatDate(dateStr)}</span>}
                </div>

                <p className="text-sm text-ink leading-relaxed">{r.comment}</p>

                {/* Review Photos Grid */}
                {revImages.length > 0 && (
                  <div className="flex flex-wrap gap-3 pt-1">
                    {revImages.map((imgUrl, imgIdx) => (
                      <button
                        key={imgIdx}
                        onClick={() => setActiveImageModal(imgUrl)}
                        className="relative w-24 h-24 rounded-md overflow-hidden border border-line hover:border-forest transition-all group"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={imgUrl} alt="Customer Photo" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex items-center gap-1.5 text-xs text-ink2 pt-1">
                  <BadgeCheck size={14} className="text-forest" />
                  <span className="font-medium text-ink">{author}</span>
                  <span>· Verified Purchase</span>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Lightbox Image Modal */}
      {activeImageModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setActiveImageModal(null)}>
          <div className="relative max-w-3xl max-h-[90vh]" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setActiveImageModal(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 text-sm flex items-center gap-1 font-medium"
            >
              <X size={20} /> Close
            </button>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={activeImageModal} alt="Enlarged Customer Review Photo" className="max-w-full max-h-[85vh] rounded object-contain shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}
