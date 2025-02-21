"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import { Star, StarHalf, MoreVertical, Pencil, Trash } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { EditReviewModal } from "./EditReviewModal";
import toast from "react-hot-toast";
import Image from 'next/image';

interface Review {
  id: string;
  rating: number;
  text: string;
  createdAt: string;
  userName: string;
  userImage: string;
  userId: string;
}

interface ReviewSectionProps {
  courseId: string;
  userId: string;
  isFree: boolean;
}

const RatingStars = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className="flex gap-1 text-yellow-500">
      {[...Array(5)].map((_, i) => (
        <span key={i}>
          {i < fullStars ? (
            <Star className="w-5 h-5 fill-current" />
          ) : hasHalfStar && i === fullStars ? (
            <StarHalf className="w-5 h-5 fill-current" />
          ) : (
            <Star className="w-5 h-5" />
          )}
        </span>
      ))}
    </div>
  );
};

export const ReviewSection = ({ courseId, userId, isFree }: ReviewSectionProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ text: "", rating: 5 });
  const { userId: currentUserId } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [editingReview, setEditingReview] = useState<Review | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/reviews`);
        setReviews(response.data);
      } catch (error) {
        console.error("Error fetching reviews:", error);
      }
    };
    fetchReviews();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.text.trim()) return;

    try {
      const response = await axios.post(`/api/courses/${courseId}/reviews`, {
        text: newReview.text,
        rating: newReview.rating,
        userId
      });
      
      setReviews([response.data, ...reviews]);
      setNewReview({ text: "", rating: 5 });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 403) {
          setShowPurchaseModal(true);
        } else if (error.response?.status === 400) {
          toast.error("You can only submit one review per course");
        }
      }
      console.error("Error posting review:", error);
    }
  };

  const handleDelete = async (reviewId: string) => {
    try {
      await axios.delete(`/api/courses/${courseId}/reviews/${reviewId}`);
      setReviews(reviews.filter(r => r.id !== reviewId));
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleEditSave = async (reviewId: string) => {
    try {
      const response = await axios.patch(`/api/courses/${courseId}/reviews/${reviewId}`, {
        text: editText,
        rating: editRating
      });
      setReviews(reviews.map(review => 
        review.id === reviewId 
          ? { ...review, text: editText, rating: editRating }
          : review
      ));
      setEditingId(null);
    } catch (error) {
      console.error("Update failed:", error);
    }
  };

  const handlePurchase = async () => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.error("Failed to initiate purchase");
    }
  };

  return (
    <div className="mt-8 border-t pt-6">
      <h3 className="text-lg font-semibold mb-4">Reviews ({reviews.length})</h3>
      
      <form onSubmit={handleSubmit} className="mb-6 space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">Rating:</span>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => setNewReview(prev => ({ ...prev, rating }))}
                className={`text-2xl ${newReview.rating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
              >
                ★
              </button>
            ))}
          </div>
        </div>
        <Input
          value={newReview.text}
          onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
          placeholder="Write your review..."
          className="h-24"
        />
        <Button type="submit" disabled={!newReview.text.trim()}>
          Submit Review
        </Button>
      </form>

      <div className="space-y-6">
        {reviews.map((review) => (
          <div key={review.id} className="border-b pb-6 group relative">
            <div className="flex items-center gap-2 mb-2">
              <Image 
                src={review.userImage} 
                alt={review.userName}
                width={50}
                height={50}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <div className="font-medium">{review.userName}</div>
                <RatingStars rating={review.rating} />
              </div>
              <span className="text-sm text-gray-500 ml-2">
                {formatDistanceToNow(new Date(review.createdAt))} ago
              </span>
            </div>
            {editingId === review.id ? (
              <div className="space-y-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setEditRating(rating)}
                      className={`text-2xl ${editRating >= rating ? 'text-yellow-500' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                />
                <div className="flex gap-2">
                  <Button onClick={() => handleEditSave(review.id)}>Save</Button>
                  <Button variant="outline" onClick={() => setEditingId(null)}>Cancel</Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700">{review.text}</p>
            )}
            
            {currentUserId === review.userId && (
              <div className="absolute top-0 right-0 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => {
                    setEditingId(review.id);
                    setEditText(review.text);
                    setEditRating(review.rating);
                  }}
                  className="text-gray-500 hover:text-blue-600"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(review.id)}
                  className="text-gray-500 hover:text-red-600"
                >
                  <Trash className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Purchase Modal (similar to your CommentSection) */}
      <Dialog open={showPurchaseModal} onOpenChange={setShowPurchaseModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isFree ? "Enroll in Course" : "Purchase Required"}
            </DialogTitle>
          </DialogHeader>
          <p>
            {isFree 
              ? "Please enroll in this free course to leave reviews"
              : "You need to purchase this course to leave reviews"}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPurchaseModal(false)}>
              Cancel
            </Button>
            <Button onClick={handlePurchase}>
              {isFree ? "Enroll Now" : "Purchase Course"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 