import { Suspense, lazy } from 'react';
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserGreeting } from "@/components/layout/UserGreeting";
import { EmptyState } from "@/components/learning/EmptyState";
import { LearningStatsWrapper } from "@/components/learning/LearningStatsWrapper";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import dynamic from 'next/dynamic';


// Lazy load components
const RecommendedSection = dynamic(
  () => import('@/components/learning/RecommendedSection'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);
const CourseCard = lazy(() => import("@/components/courses/CourseCard"));
const QuizCard = lazy(() => import("@/components/quiz/QuizCard"));
const QuizAttemptsSection = dynamic(
  () => import('@/components/learning/QuizAttemptsSection'),
  { 
    loading: () => <LoadingSpinner />,
    ssr: false 
  }
);

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
        courseAnalytics: { select: { views: true } }
      }
    }),
    db.quiz.findMany({
      where: {
        categoryId: { in: userInterests.map(interest => interest.categoryId) }
      },
      include: {
        questions: true,
        category: true,
        QuizAttempt: {
          select: {
            score: true
          }
        }
      }
    })
  ]);

  // Process quizzes to calculate attempts and average score
  const processedQuizzes = quizzes.map(quiz => ({
    ...quiz,
    attempts: quiz.QuizAttempt.length,
    averageScore: quiz.QuizAttempt.length > 0 
      ? quiz.QuizAttempt.reduce((sum, attempt) => sum + attempt.score, 0) / quiz.QuizAttempt.length
      : 0
  }));

  return { courses, quizzes: processedQuizzes };
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
        include: {
          category: { select: { name: true } },
          sections: {
            where: { isPublished: true },
            include: {
              progress: {
                where: { studentId: userId },
                select: { isCompleted: true }
              }
            }
          },
          Review: { select: { rating: true } },
          purchases: { select: { id: true } },
          courseAnalytics: { select: { views: true } }
        }
      }),
      db.quizAttempt.findMany({
        where: { userId },
        select: {
          id: true,
          score: true,
          createdAt: true,
          quiz: {
            select: {
              id: true,
              title: true,
              questions: { select: { id: true } }
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
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
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <Link href="/verify" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Verify Certificate
              </Button>
            </Link>
            <Link href="/preference" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">
                Change Interests
              </Button>
            </Link>
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-4 sm:mb-5">
          My Learning Dashboard
        </h1>

        <LearningStatsWrapper 
          purchasedCourses={purchasedCourses}
          takenQuizzes={takenQuizzes}
        />

        <div className="space-y-8 sm:space-y-12">
          <Suspense fallback={<LoadingSpinner />}>
            {/* Add Quiz Attempts Section */}
            <QuizAttemptsSection
              attempts={takenQuizzes}
              emptyMessage="You haven't taken any assessments yet."
              buttonText="Take assessment"
              href="/quizzes"
            />

            {/* Recommended Courses */}
            <RecommendedSection 
              title="Recommended Courses"
              items={recommendedContent.courses}
              emptyMessage="No recommended webinar found based on your interests."
              buttonText="Explore More"
              href="/vid"
              renderItem={(item) => (
                <CourseCard 
                  key={item.id}
                  course={{
                    ...item,
                    id: item.id,
                    title: item.title,
                    imageUrl: item.imageUrl || "/course_placeholder.jpg",
                    imagePriority: recommendedContent.courses.indexOf(item) < 3,
                    imageLoading: recommendedContent.courses.indexOf(item) > 2 ? "lazy" : "eager",
                    Review: item.Review || [],
                    purchases: item.purchases || [],
                    courseAnalytics: item.courseAnalytics || { views: 0 },
                    category: item.category || { name: 'Uncategorized' },
                    level: item.level || { name: 'Beginner' },
                    price: item.price || 0,
                    isFree: item.isFree || false
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
                    difficulty: quiz.difficulty || "medium",
                    attempts: quiz.attempts || 0,
                    averageScore: quiz.averageScore || 0,
                    categoryId: quiz.category?.id,
                    questions: quiz.questions || []
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
              renderItem={(item) => (
                <CourseCard 
                  key={item.id}
                  course={{
                    ...item,
                    id: item.id,
                    title: item.title,
                    imageUrl: item.imageUrl || "/course_placeholder.jpg",
                    imagePriority: purchasedCourses.indexOf(item) < 3,
                    imageLoading: purchasedCourses.indexOf(item) > 2 ? "lazy" : "eager",
                    Review: item.Review || [],
                    purchases: item.purchases || [],
                    courseAnalytics: item.courseAnalytics || { views: 0 },
                    category: item.category || { name: 'Uncategorized' },
                    level: item.level || { name: 'Beginner' },
                    price: item.price || 0,
                    isFree: item.isFree || false
                  }}
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