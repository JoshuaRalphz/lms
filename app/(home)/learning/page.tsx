import { Suspense, lazy } from 'react';
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserGreeting } from "@/components/layout/UserGreeting";

import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

// Lazy load components
const RecommendedSection = lazy(() => import("@/components/learning/RecommendedSection"));
const CourseCard = lazy(() => import("@/components/courses/CourseCard"));
const QuizCard = lazy(() => import("@/components/quiz/QuizCard"));

interface QuizAttempt {
  id: string;
  quiz: {
    id: string;
    title: string;
    description: string;
    questions: { id: string }[];
    category?: { id: string };
    attempts: number;
  };
  score: number;
}

const getRecommendedContent = async (userId: string) => {
  const userInterests = await db.userInterest.findMany({
    where: { userId },
    select: { categoryId: true }
  });

  const [courses, quizzes] = await Promise.all([
    db.course.findMany({
      where: {
        isPublished: true,
        categoryId: { in: userInterests.map(interest => interest.categoryId) }
      },
      include: {
        category: true,
        sections: {
          where: { isPublished: true },
          select: {
            progress: {
              where: { studentId: userId },
              select: { isCompleted: true }
            }
          }
        },
        Review: { select: { rating: true } },
        purchases: { select: { id: true } },
        level: true
      }
    }),
    db.quiz.findMany({
      where: {
        categoryId: { in: userInterests.map(interest => interest.categoryId) }
      },
      select: {
        id: true,
        title: true,
        description: true,
        questions: { select: { id: true } },
        category: true,
        instructorId: true
      }
    })
  ]);

  return { courses, quizzes };
};

const getProgress = (sections: any[], userId: string) => {
  const completed = sections?.filter(s => 
    s.progress?.some((p: { isCompleted: boolean }) => p.isCompleted)
  ).length || 0;
  const total = sections?.length || 0;
  return total > 0 ? Math.round((completed / total) * 100) : 0;
};

const LearningPage = async () => {
  const { userId } = await auth();
  if (!userId) return redirect('/sign-in');

  try {
    const [userInterests, purchasedCourses, takenQuizzes, recommendedContent] = await Promise.all([
      db.userInterest.findMany({
        where: { userId },
        select: { categoryId: true }
      }),
      db.course.findMany({
        where: {
          isPublished: true,
          purchases: { some: { customerId: userId } }
        },
        select: {
          id: true,
          title: true,
          imageUrl: true,
          category: { select: { name: true } },
          sections: {
            where: { isPublished: true },
            select: {
              progress: {
                where: { studentId: userId },
                select: { isCompleted: true }
              }
            }
          }
        }
      }),
      db.quizAttempt.findMany({
        where: { userId },
        select: {
          score: true,
          quiz: {
            select: {
              id: true,
              title: true
            }
          }
        }
      }),
      getRecommendedContent(userId)
    ]);

    if (userInterests.length === 0) return redirect('/preference');

    return (
      <div className="px-2 py-4 sm:px-4 sm:py-6 md:mt-5 md:px-6 lg:px-8 xl:px-10">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <UserGreeting />
          <Link href="/preference" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto">
              Change Interests
            </Button>
          </Link>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-4 sm:mb-5">
          My Learning Dashboard
        </h1>

        <div className="space-y-8 sm:space-y-12">
          <Suspense fallback={<LoadingSpinner />}>
            {/* Recommended Courses */}
            <RecommendedSection 
              title="Recommended Courses"
              items={recommendedContent.courses}
              emptyMessage="No recommended courses found based on your interests."
              buttonText="Explore More"
              href="/vid"
              renderItem={(course) => (
                <CourseCard 
                  key={course.id} 
                  course={{
                    ...course,
                    title: course.title,
                    instructorId: course.instructorId,
                    categoryId: course.categoryId,
                    Review: course.Review?.map((r: { rating: number }) => ({ rating: r.rating })) || [],
                    purchases: course.purchases || [],
                    category: course.category || null,
                    price: course.price || 0
                  }} 
                />
              )}
            />

            {/* Recommended Quizzes */}
            <RecommendedSection 
              title="Recommended Quizzes"
              items={recommendedContent.quizzes}
              emptyMessage="No recommended quizzes found based on your interests."
              buttonText="Explore More"
              href="/quizzes"
              renderItem={(quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={{
                    ...quiz,
                    title: quiz.title,
                    description: quiz.description || "",
                    instructorId: quiz.instructorId,
                    difficulty: "medium",
                    attempts: 0,
                    averageScore: 0,
                    categoryId: quiz.category?.id,
                    questions: []
                  }}
                />
              )}
            />

            {/* Purchased Courses */}
            <RecommendedSection 
              title="My Courses"
              items={purchasedCourses}
              emptyMessage="You haven't enrolled in any courses yet."
              buttonText="Explore Courses"
              href="/vid"
              renderItem={(course) => (
                <CourseCard 
                  key={course.id} 
                  course={{
                    id: course.id,
                    title: course.title,
                    description: course.description || "",
                    imageUrl: course.imageUrl || "",
                    instructorId: course.instructorId,
                    categoryId: course.categoryId,
                    price: course.price || 0,
                    category: course.category,
                    Review: course.Review || [],
                    purchases: course.purchases || [],
                    sections: course.sections
                  }}
                  progressPercentage={getProgress(course.sections, userId)}
                />
              )}
            />
          </Suspense>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading learning page:", error);
    return redirect('/');
  }
};

export default LearningPage