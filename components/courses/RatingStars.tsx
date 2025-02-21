import { Star, StarHalf } from "lucide-react";

interface RatingStarsProps {
  rating: number;
  className?: string;
}

export const RatingStars = ({ rating, className }: RatingStarsProps) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;

  return (
    <div className={`flex gap-1 text-yellow-500 ${className}`}>
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