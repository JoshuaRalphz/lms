import { db } from "@/lib/db";
import CourseCard from "@/components/courses/CourseCard";
import Link from "next/link";
import QuizCard from "@/components/quiz/QuizCard";
import Topbar from "@/components/layout/Topbar";
import { Button } from "@/components/ui/button";
import { clerkClient } from "@clerk/clerk-sdk-node";

const getLandingStats = async () => {
  const totalCourses = await db.course.count({
    where: { isPublished: true }
  });

  const totalQuizzes = await db.quiz.count();

  const totalEnrollments = await db.purchase.count();

  const quizzes = await db.quiz.findMany();
  const totalParticipants = quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0);

  // Get total user count from Clerk
  const users = await clerkClient.users.getUserList();
  const totalUsers = users.data.length;

  return {
    totalCourses,
    totalQuizzes,
    totalEnrollments,
    totalParticipants,
    totalUsers
  };
};

export default async function Vid() {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  const stats = await getLandingStats();

  const courses = await db.course.findMany({
    where: { isPublished: true },
    include: {
      sections: {
        include: {
          progress: true
        }
      },
      level: true,
      category: true,
      Review: true,
      purchases: true
    }
  });

  // Get top rated courses
  const topRatedCourses = courses
    .map(course => ({
      ...course,
      averageRating: course.Review.length > 0 
        ? course.Review.reduce((sum, review) => sum + review.rating, 0) / course.Review.length 
        : 0
    }))
    .filter(course => course.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 6);

  // Get most popular courses (based on enrollments)
  const mostPopularCourses = courses
    .map(course => ({
      ...course,
      enrollmentCount: course.purchases?.length || 0
    }))
    .filter(course => course.enrollmentCount > 0)
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 6);

  // Get most participated quizzes
  const quizzes = await db.quiz.findMany({
    include: {
      questions: true,
      category: true
    }
  });
  
  const mostParticipatedQuizzes = quizzes
    .sort((a, b) => b.attempts - a.attempts)
    .slice(0, 6);

  return (
    <div className="bg-white">
      <Topbar />
      {/* Hero Section with integrated stats */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[url('/hero-pattern.svg')] opacity-10"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6">
            Learn New Skills <br className="hidden md:block" /> Online
          </h1>
          <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
            Explore thousands of courses taught by industry experts. Start your learning journey today!
          </p>
          

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8 bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{stats.totalCourses}</h3>
              <p className="text-sm md:text-base text-gray-200">Courses Available</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{stats.totalQuizzes}</h3>
              <p className="text-sm md:text-base text-gray-200">Quizzes Available</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{stats.totalEnrollments}</h3>
              <p className="text-sm md:text-base text-gray-200">Total Enrollments</p>
            </div>
            <div className="text-center">
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-2">{stats.totalUsers}</h3>
              <p className="text-sm md:text-base text-gray-200">Total Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Expert Instructors</h3>
              <p className="text-gray-600">Learn from industry professionals with real-world experience.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Flexible Learning</h3>
              <p className="text-gray-600">Study at your own pace, anytime, anywhere.</p>
            </div>
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-shadow">
              <h3 className="text-2xl font-bold mb-4">Hands-On Projects</h3>
              <p className="text-gray-600">Apply your knowledge with practical, real-world projects.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Sections */}
      <div className="container mx-auto px-4 py-20">
        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Most Popular Courses</h2>
            <Link href="/vid">
              <Button variant="outline">Explore More</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mostPopularCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Top Rated Courses</h2>
            <Link href="/vid">
              <Button variant="outline">Explore More</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {topRatedCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>

        <div className="mb-20">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">Most Popular Quizzes</h2>
            <Link href="/quizzes">
              <Button variant="outline">Explore More</Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {mostParticipatedQuizzes.map((quiz) => (
              <QuizCard 
                key={quiz.id} 
                quiz={{
                  ...quiz,
                  description: quiz.description || "",
                  categoryId: quiz.category?.id
                }} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 py-20 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Start Learning Today</h2>
          <p className="text-xl mb-8">Join thousands of students and start your learning journey.</p>
          <Link 
            href="/sign-up" 
            className="inline-block bg-white text-blue-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors"
          >
            Sign Up Now
          </Link>
        </div>
      </div>
    </div>
  );
}