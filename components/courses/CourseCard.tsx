"use client"

import { useUser, useAuth,  } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { RatingStars } from "@/components/courses/RatingStars";

interface CourseCardProps {
  course: {
    id: string;
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    instructorId: string;
    levelId?: string | null;
    categoryId: string;
    sections: {
      progress: {
        studentId: string;
        isCompleted: boolean;
      }[];
    }[];
    Review: { rating: number }[];
    purchases: { id: string }[];
    level: { name: string } | null;
    category: { name: string };
    price: number | null;
    views?: number;
  };
  progressPercentage?: number;
}

interface Instructor {
  imageUrl?: string;
  fullName?: string;
}

interface Level {
  name: string;
}


const CourseCard = ({ course, progressPercentage }: CourseCardProps) => {
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [instructor, setInstructor] = useState<Instructor | null>(null);
  const [level, setLevel] = useState<Level | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const instructorResponse = await fetch(`/api/users/${course.instructorId}`);
        const instructorData = await instructorResponse.json();
        setInstructor({
          imageUrl: instructorData.imageUrl,
          fullName: `${instructorData.firstName} ${instructorData.lastName}`
        });

        if (course.levelId) {
          const levelResponse = await fetch(`/api/levels/${course.levelId}`);
          const levelData = await levelResponse.json();
          setLevel(levelData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    }
    fetchData();
  }, [course.instructorId, course.levelId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      router.push(`/courses/${course.id}/overview`);
    }
  };

  return (
    <Link 
      href={`/courses/${course.id}/overview`} 
      className="block overflow-hidden cursor-pointer border-2 border-[#A9B5DF] rounded-lg bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-xl hover:border-[#7886C7] group"
    >
      <div className="relative aspect-video w-full">
        <Image
          src={course.imageUrl ? course.imageUrl : "/image_placeholder.webp"}
          alt={course.title}
          fill
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="rounded-t-lg object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#34495E]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="px-4 py-3 flex flex-col gap-2 bg-white relative">
        <h2 className="text-lg font-bold text-[#34495E] group-hover:text-[#7886C7] transition-colors line-clamp-2">
          {course.title}
        </h2>
        
        {instructor && (
          <div className="flex items-center gap-2">
            <div className="relative w-8 h-8">
              <Image
                src={instructor.imageUrl || "/avatar_placeholder.jpg"}
                alt={instructor.fullName || "Instructor photo"}
                fill
                className="rounded-full object-cover"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <p className="text-sm font-medium text-gray-600 line-clamp-1">
              {instructor.fullName}
            </p>
          </div>
        )}

        <div className="flex items-center gap-1">
          <RatingStars 
            rating={course.Review.length > 0 
              ? course.Review.reduce((sum, review) => sum + review.rating, 0) / course.Review.length 
              : 0
            } 
            className="h-4 w-4"
          />

        </div>

        {progressPercentage !== undefined && (
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span className="text-sm text-gray-600">
            ({course.Review.length} reviews)
          </span>
          <span>• {course.purchases.length} enrolled</span>
          <span>• {course.views?.toLocaleString() || 0} views</span>
          <span>•</span>
          <span>{course.level?.name}</span>
        </div>

        <p className="text-sm font-bold">
          {course.price === 0 ? "Free" : `₱ ${course.price}`}
        </p>
      </div>
    </Link>
  );
};

export default CourseCard;
