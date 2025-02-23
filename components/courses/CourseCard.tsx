"use client";

import Image from "next/image";
import Link from "next/link";
import { Course } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { RatingStars } from "./RatingStars";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface CourseCardProps {
  course: Course & {
    category?: { name: string };
    level?: { name: string };
    Review?: { rating: number }[];
    purchases?: { id: string }[];
    courseAnalytics?: { views: number };
    imagePriority?: boolean;
    imageLoading?: "eager" | "lazy";
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  if (!course) {
    return <div className="border rounded-lg p-4">Course information not available</div>;
  }

  const reviewCount = course?.Review?.length || 0;
  const averageRating = reviewCount > 0 
    ? (course?.Review?.reduce((sum, review) => sum + review.rating, 0) || 0) / reviewCount
    : 0;

  const enrollmentCount = course?.purchases?.length || 0;
  const views = course?.courseAnalytics?.views || 0;

  const handleClick = () => {
    if (!course?.id) return;
    
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      router.push(`/courses/${course.id}/overview`);
    }
  };

  return (
    <div className="h-full border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="relative aspect-video">
        <Image
          src={course?.imageUrl || "/course_placeholder.jpg"}
          alt={course?.title || "Course"}
          fill
          priority={course?.imagePriority}
          loading={course?.imageLoading}
          className="object-cover"
        />
      </div>

      <div className="p-4 flex flex-col gap-2">
        <h3 className="font-semibold line-clamp-2">
          {course.title}
        </h3>

        {course.category && (
          <span className="text-sm text-gray-500">
            {course.category.name}
          </span>
        )}

        <div className="flex items-center gap-2">
          <RatingStars rating={averageRating} />
          <span className="text-sm text-gray-500">
            ({reviewCount} reviews)
          </span>
        </div>

        <div className="flex items-center justify-between mt-2">
          <div className="flex flex-col">
            <span className="text-sm text-gray-500">
              {enrollmentCount} students
            </span>
            <span className="text-sm text-gray-500">
              {views.toLocaleString()} views
            </span>
          </div>

          <span className="font-semibold">
            {course.price === 0 || course.isFree ? "Free" : formatPrice(course.price || 0)}
          </span>
        </div>

        <Button 
          onClick={handleClick}
          className="mt-4 w-full"
          variant="outline"
        >
          View Course
        </Button>
      </div>
    </div>
  );
}
