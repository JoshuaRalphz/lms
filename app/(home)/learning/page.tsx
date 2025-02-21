import CourseCard from "@/components/courses/CourseCard"
import QuizCard from "@/components/quiz/QuizCard"
import { db } from "@/lib/db"
import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button";
import Link from "next/link";

import { UserGreeting } from "@/components/layout/UserGreeting";
import { StatisticsSection } from "@/components/learning/StatisticsSection";
import { EmptyState } from "@/components/learning/EmptyState";

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

const LearningPage = async () => {
  const { userId } = await auth()

  if (!userId) {
    return redirect('/sign-in')
  }

  // Check if user has preferences
  const userInterests = await db.userInterest.findMany({
    where: { userId }
  });

  if (userInterests.length === 0) {
    return redirect('/preference');
  }

  // Fetch purchased courses
  const purchasedCourses = await db.course.findMany({
    where: {
      isPublished: true,
      purchases: {
        some: {
          customerId: userId
        }
      }
    },
    include: {
      category: true,
      sections: {
        where: {
          isPublished: true,
        },
        include: {
          progress: { where: { studentId: userId } }
        }
      },
      Review: true,
      purchases: { select: { id: true } },
      level: true
    },
  })

  // Fetch taken quizzes
  const takenQuizzes = await db.quizAttempt.findMany({
    where: {
      userId: userId
    },
    include: {
      quiz: {
        include: {
          questions: true,
          category: true
        }
      }
    },
    orderBy: {
      createdAt: "desc"
    },
    distinct: ['quizId']
  }).catch(error => {
    console.error("Error fetching quiz attempts:", error);
    return [];
  });

  const completionRate = purchasedCourses.length > 0 
    ? `${Math.round((purchasedCourses.filter(course => {
        const completed = course.sections?.filter(s => 
          s.progress?.some(p => p.isCompleted)
        ).length || 0;
        const total = course.sections?.length || 0;
        return completed === total;
      }).length / purchasedCourses.length) * 100)}%`
    : '0%';

  // Generate chart data for learning progress
  const chartData = purchasedCourses.map((course, index) => {
    const completed = course.sections?.filter(s => 
      s.progress?.some(p => p.isCompleted)
    ).length || 0;
    const total = course.sections?.length || 0;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    console.log('Course:', course.title);
    console.log('Sections:', course.sections);
    console.log('Progress data:', course.sections?.map(s => s.progress));
    console.log('Progress:', progress);
    
    return {
      name: `Course ${index + 1}`,
      value: progress
    };
  });

  // Calculate quiz average score
  const quizScores = takenQuizzes.map(quiz => quiz.score);
  const quizAverageScore = quizScores.length > 0 
    ? `${Math.round((quizScores.reduce((a, b) => a + b, 0) / quizScores.length) * 100)}%`
    : '0%';

  const recommendedContent = await getRecommendedContent(userId);

  return (
    <div className="px-2 py-4 sm:px-4 sm:py-6 md:mt-5 md:px-6 lg:px-8 xl:px-10">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <UserGreeting />
        <Link href="/preference" className="w-full sm:w-auto">
          <Button variant="outline" className="w-full sm:w-auto">
            Change Interests
          </Button>
        </Link>
      </div>

      <h1 className="text-xl sm:text-2xl font-bold mt-6 sm:mt-8 mb-4 sm:mb-5">My Learning Dashboard</h1>

      <StatisticsSection 
        purchasedCoursesCount={purchasedCourses.length}
        takenQuizzesCount={takenQuizzes.length}
        completionRate={completionRate}
        quizAverageScore={quizAverageScore}
        chartData={chartData}
      >
        <div className="space-y-3 sm:space-y-4">
          {chartData.map((course, index) => (
            <div key={index} className="space-y-1 sm:space-y-2">
              <div className="flex justify-between text-xs sm:text-sm">
                <span>{course.name}</span>
                <span>{course.value}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${course.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </StatisticsSection>

      <div className="space-y-8 sm:space-y-12">
        {/* Recommended Courses Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Recommended Courses</h2>
            <Link href="/vid" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Explore More</Button>
            </Link>
          </div>
          {recommendedContent.courses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recommendedContent.courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={{
                    ...course,
                    sections: course.sections.map(section => ({
                      ...section,
                      progress: section.progress.map(p => ({
                        ...p,
                        studentId: userId
                      }))
                    }))
                  }} 
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No recommended courses found based on your interests."
              buttonText="Explore All Courses"
              href="/vid"
            />
          )}
        </section>

        {/* Recommended Quizzes Section */}
        <section>
          <div className="flex flex-col sm:flex-row justify-between items-center mb-3 sm:mb-4 gap-2">
            <h2 className="text-lg sm:text-xl font-semibold">Recommended Quizzes</h2>
            <Link href="/quizzes" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto">Explore More</Button>
            </Link>
          </div>
          {recommendedContent.quizzes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {recommendedContent.quizzes.map((quiz) => (
                <QuizCard 
                  key={quiz.id}
                  quiz={{
                    ...quiz,
                    description: quiz.description || "",
                    instructorId: quiz.instructorId,
                    difficulty: "medium",
                    attempts: 0,
                    averageScore: 0,
                    categoryId: quiz.category?.id
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              message="No recommended quizzes found based on your interests."
              buttonText="Explore All Quizzes"
              href="/quizzes"
            />
          )}
        </section>

        {/* Purchased Courses Section */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">My Courses</h2>
          {purchasedCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {purchasedCourses.map((course) => {
                const completed = course.sections?.filter(s => 
                  s.progress?.some(p => p.isCompleted)
                ).length || 0;
                const total = course.sections?.length || 0;
                const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
                console.log('Course:', course.title);
                console.log('Sections:', course.sections);
                console.log('Progress data:', course.sections?.map(s => s.progress));
                console.log('Progress:', progress);
                
                return (
                  <CourseCard 
                    key={course.id} 
                    course={course} 
                    progressPercentage={progress}
                  />
                )
              })}
            </div>
          ) : (
            <EmptyState 
              message="You haven't enrolled in any courses yet."
              buttonText="Explore Courses"
              href="/vid"
            />
          )}
        </section>

        {/* Taken Quizzes Section */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">My Quiz Attempts</h2>
          {takenQuizzes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {takenQuizzes.map((attempt) => (
                <QuizCard 
                  key={attempt.id}
                  quiz={{
                    id: attempt.quiz.id,
                    title: attempt.quiz.title,
                    description: attempt.quiz.description || "",
                    instructorId: attempt.quiz.instructorId,
                    difficulty: attempt.quiz.difficulty,
                    categoryId: attempt.quiz.category?.id,
                    questions: attempt.quiz.questions,
                    attempts: attempt.quiz.attempts,
                    averageScore: attempt.score
                  }}
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              message="You haven't taken any quizzes yet."
              buttonText="Explore Quizzes"
              href="/quizzes"
            />
          )}
        </section>
      </div>
    </div>
  )
}

export default LearningPage