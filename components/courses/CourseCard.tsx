"use client";

import { Suspense, lazy, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import  Course  from "@prisma/client";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/formatPrice";
import { RatingStars } from "./RatingStars";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useMemo } from "react";

const SkeletonLoader = () => (
  <div className="h-full border rounded-lg overflow-hidden shadow-sm animate-pulse">
    <div className="aspect-video bg-gray-200" />
    <div className="p-4 space-y-4">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="h-4 bg-gray-200 rounded w-1/2" />
      <div className="h-4 bg-gray-200 rounded w-full" />
      <div className="h-4 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

interface Course {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  category?: {
    name: string;
  };
  price?: number;
  isFree?: boolean;
  Review?: { rating: number }[];
  purchases?: { id: string }[];
  courseAnalytics?: {
    views: number;
  };
  imagePriority?: boolean;
  imageLoading?: "lazy" | "eager";
}

interface CourseCardProps {
  course: Course;
}

export default function CourseCard({ course }: CourseCardProps) {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const cardRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.disconnect();
      }
    };
  }, []);

  const courseStats = useMemo(() => {
    if (!course) return {
      reviewCount: 0,
      averageRating: 0,
      enrollmentCount: 0,
      views: 0
    };

    const reviewCount = course?.Review?.length || 0;
    const averageRating = reviewCount > 0 
      ? (course?.Review?.reduce((sum, review) => sum + review.rating, 0) || 0) / reviewCount
      : 0;

    const enrollmentCount = course?.purchases?.length || 0;
    const views = course?.courseAnalytics?.views || 0;

    return { reviewCount, averageRating, enrollmentCount, views };
  }, [course]);

  const handleClick = useMemo(() => () => {
    if (!course?.id) return;
    
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      router.push(`/courses/${course.id}/overview`);
    }
  }, [course?.id, isSignedIn, router]);

  const imageProps = useMemo(() => ({
    src: course?.imageUrl || "/course_placeholder.jpg",
    alt: course?.title ? `Course image for ${course.title}` : "Course image",
    fill: true,
    priority: course?.imagePriority,
    loading: course?.imageLoading || "lazy",
    className: "object-cover",
    sizes: "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
    onError: (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
      e.currentTarget.src = "/course_placeholder.jpg";
    }
  }), [course]);

  if (!course) {
    return <div className="border rounded-lg p-4">Course information not available</div>;
  }

  return (
    <div ref={cardRef}>
      {isVisible ? (
        <article className="h-full border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="relative aspect-video">
            <Image {...imageProps} />
          </div>

          <div className="p-4 flex flex-col gap-2">
            <h1 className="font-semibold line-clamp-2" title={course.title}>
              {course.title}
            </h1>

            {course.subtitle && (
              <h3 className="text-sm text-gray-500 line-clamp-1" title={course.subtitle}>
                Speaker: {course.subtitle}
              </h3>
            )}

            {course.category && (
              <span className="text-sm text-gray-500">
                {course.category.name}
              </span>
            )}

            <div className="flex items-center gap-2">
              <RatingStars rating={courseStats.averageRating} />
              <span className="text-sm text-gray-500">
                ({courseStats.reviewCount} reviews)
              </span>
            </div>

            <div className="flex items-center justify-between mt-2">
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">
                  {courseStats.enrollmentCount} Participants
                </span>
                <span className="text-sm text-gray-500">
                  {courseStats.views.toLocaleString()} views
                </span>
              </div>

              <span className="font-semibold">
                {course.price === 0 || course.isFree ? "Free" : formatPrice(course.price || 0)}
              </span>
            </div>

            <Button 
              onClick={() => router.push(`/courses/${course.id}/overview`)}
              className="mt-4 w-full"
              variant="outline"
              aria-label={`View course ${course.title}`}
            >
              View Webinar
            </Button>
          </div>
        </article>
      ) : (
        <SkeletonLoader />
      )}
    </div>
  );
}
