"use client"

import { useMemo, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

interface QuizCardProps {
  quiz: {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    categoryId?: string;
    questions: {
      id: string;
    }[];
    attempts: number;
    averageScore: number;
  };
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
  const { isSignedIn } = useAuth();
  const router = useRouter();

  const difficultyColors = useMemo(() => ({
    Beginner: "bg-green-100 text-green-800",
    Intermediate: "bg-yellow-100 text-yellow-800",
    Advanced: "bg-red-100 text-red-800",
  } as const), []);

  const thumbnail = useMemo(() => {
    if (!quiz.categoryId || !categoryThumbnails[quiz.categoryId]) {
      return "/image_placeholder.webp";
    }
    const images = categoryThumbnails[quiz.categoryId];
    const randomIndex = Math.floor(Math.random() * images.length);
    return images[randomIndex];
  }, [quiz.categoryId]);

  const formattedScore = useMemo(() => 
    `${(quiz.averageScore * 100).toFixed(1)}%`, 
    [quiz.averageScore]
  );

  const handleClick = () => {
    if (!isSignedIn) {
      router.push('/sign-in');
    } else {
      router.push(`/quizzes/${quiz.id}`);
    }
  };

  useEffect(() => {
    if (isSignedIn) {
      router.prefetch(`/quizzes/${quiz.id}`);
    }
  }, [isSignedIn, quiz.id, router]);

  return (
    <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
      <div className="relative h-48">
        <Image
          src={thumbnail}
          alt={quiz.title}
          fill
          className="object-cover"
          onError={(e) => {
            e.currentTarget.src = '/image_placeholder.webp';
          }}
        />
      </div>

      <div className="p-4 space-y-3">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg line-clamp-2">{quiz.title}</h3>
          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${difficultyColors[quiz.difficulty as keyof typeof difficultyColors]}`}>
            {quiz.difficulty}
          </span>
        </div>

        <p className="text-sm text-gray-600 line-clamp-3">{quiz.description}</p>

        <div className="text-sm text-gray-500">
          <div className="flex gap-2 items-center">
            <span>{quiz.questions.length} questions</span>
            <span>•</span>
            <span>{quiz.attempts} participants</span>
            {quiz.attempts > 0 && (
              <>
                <span>•</span>
                <span>Avg: {formattedScore}</span>
              </>
            )}
          </div>
        </div>

        <Button 
          onClick={handleClick}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Take Assessment
        </Button>
      </div>
    </div>
  );
};

export default QuizCard; 


