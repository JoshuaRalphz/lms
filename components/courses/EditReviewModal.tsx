"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { Star } from "lucide-react";

interface EditReviewModalProps {
  review: {
    id: string;
    text: string;
    rating: number;
  };
  courseId: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedText: string, updatedRating: number) => void;
}

export const EditReviewModal = ({ 
  review,
  courseId,
  isOpen,
  onClose,
  onSave
}: EditReviewModalProps) => {
  const [text, setText] = useState(review.text);
  const [rating, setRating] = useState(review.rating);

  useEffect(() => {
    setText(review.text);
    setRating(review.rating);
  }, [review]);

  const handleSubmit = async () => {
    try {
      await axios.patch(`/api/courses/${courseId}/reviews/${review.id}`, {
        text,
        rating
      });
      onSave(text, rating);
      onClose();
    } catch (error) {
      console.error("Error updating review:", error);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Review</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`h-6 w-6 cursor-pointer ${star <= rating ? 'fill-yellow-500' : ''}`}
                onClick={() => setRating(star)}
              />
            ))}
          </div>
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Edit your review..."
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}; 