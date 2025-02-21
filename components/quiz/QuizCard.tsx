"use client"

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useUser, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    instructorId: string;
    difficulty: string;
    categoryId?: string;
    questions: {
      id: string;
    }[];
    attempts: number;
    averageScore: number;
  };
}

interface Instructor {
  imageUrl?: string;
  fullName?: string;
}

const categoryThumbnails: Record<string, string[]> = {
  "2f31393c-985c-499f-a247-e0a43baba37b": [
    "/thumbnails/cy/cy1.png",
    "/thumbnails/cy/cy2.jpeg",
    "/thumbnails/cy/cy3.jpeg",
  ],
  "abca63e4-9888-49a7-a3fc-2119707bdfb0": [
    "/thumbnails/uix/ui1.jpeg",
    "/thumbnails/uix/ui2.jpeg",
    "/thumbnails/uix/ui3.jpeg",
  ],
  "af1ab27e-c3cb-44b7-90d6-d7ad26b67dfc": [
    "/thumbnails/prs/p1.jpg",
    "/thumbnails/prs/p2.jpeg",
    "/thumbnails/prs/p3.jpeg",
  ],
  "feec9ddf-6689-46da-9ada-256d792fa141": [
    "/thumbnails/3d/3d1.jpeg",
    "/thumbnails/3d/3d2.jpeg",
    "/thumbnails/3d/3d3.jpg",
  ],
  "ea9ec2b7-cea2-4fd6-b8a6-63509aea37d4": [
    "/thumbnails/wd/w1.jpg",
    "/thumbnails/wd/w2.jpeg",
    "/thumbnails/wd/w3.jpeg",
  ],
  "f121b336-4da1-4abb-b19a-afa5d6c100f3": [
    "/thumbnails/sd/s1.jpeg",
    "/thumbnails/sd/s2.jpg",
    "/thumbnails/sd/s3.jpg",
  ],
  "9c5774af-3ac8-404a-914b-30adedc49e00": [
    "/thumbnails/cc/cc1.jpeg",
    "/thumbnails/cc/cc2.jpeg",
    "/thumbnails/cc/cc3.jpeg",
  ],
  "70461442-dd8e-4055-b49d-69779f63405f": [
    "/thumbnails/ds/ds1.webp",
    "/thumbnails/ds/ds2.jpeg",
    "/thumbnails/ds/ds3.jpg",
  ],
  

};

const QuizCard = ({ quiz }: QuizCardProps) => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const router = useRouter();
  const [instructor, setInstructor] = useState<Instructor | null>(null);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const response = await fetch(`/api/users/${quiz.instructorId}`);
        const data = await response.json();
        setInstructor({imageUrl: data.imageUrl,
        fullName: `${data.firstName} ${data.lastName}`});
      } catch (error) {
        console.error("Error fetching instructor:", error);
      }
    };

    fetchInstructor();
  }, [quiz.instructorId]);

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800",
  };

  // Get thumbnail based on category
  const getRandomThumbnail = (categoryId?: string) => {
    if (!categoryId || !categoryThumbnails[categoryId]) {
      return "/image_placeholder.webp";
    }
    
    const images = categoryThumbnails[categoryId];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  };

  const thumbnail = getRandomThumbnail(quiz.categoryId);
  console.log("Category ID:", quiz.categoryId);

  // Add this function to format the average score
  const formatScore = (score: number) => {
    return `${(score * 100).toFixed(1)}%`;
  };

  const handleClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      router.push(`/quizzes/${quiz.id}`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className="cursor-pointer border rounded-lg p-4 shadow-sm transition-all duration-300 bg-white group hover:shadow-xl hover:-translate-y-1 hover:border-blue-200 hover:bg-gradient-to-br hover:from-white hover:to-blue-50"
    >
      <div className="relative overflow-hidden">
        <Image
          src={thumbnail}
          alt={quiz.title}
          width={500}
          height={300}
          className="rounded-t-lg w-full h-48 object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#34495E]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      <div className="pt-4">
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2">{quiz.title}</h3>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full min-w-[80px] text-center ${difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}`}>
            {quiz.difficulty}
          </span>
        </div>
        
        <p className="text-sm text-gray-600 mb-4 line-clamp-3">{quiz.description}</p>

        <div className="text-sm text-gray-500 space-y-2">
          <div className="flex flex-wrap gap-x-2 items-center">
            <span>{quiz.questions.length} questions</span>
            <span>•</span>
            <span>{quiz.attempts} participants</span>
            {quiz.attempts > 0 && (
              <>
                <span>•</span>
                <span>Avg: {formatScore(quiz.averageScore)}</span>
              </>
            )}
          </div>

          {instructor && (
            <div className="flex gap-2 items-center pt-2">
              <Image
                src={instructor.imageUrl || "/avatar_placeholder.jpg"}
                alt={instructor.fullName || "Instructor photo"}
                width={28}
                height={28}
                className="rounded-full border"
              />
              <span className="text-sm">By {instructor.fullName}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard; 


