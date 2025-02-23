import { db } from "@/lib/db";
import QuizCard from "@/components/quiz/QuizCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import  Topbar  from "@/components/layout/Topbar";
import { cn } from "@/lib/utils";

const difficulties = [
  { label: "All", value: "all" },
  { label: "Beginner", value: "Beginner" },
  { label: "Intermediate", value: "Intermediate" },
  { label: "Advanced", value: "Advanced" }
];

const QuizzesPage = async ({ searchParams }: { searchParams: { difficulty?: string; category?: string } }) => {
  const difficulty = searchParams.difficulty;
  const category = searchParams.category;

  const quizzes = await db.quiz.findMany({
    where: {
      difficulty: difficulty && difficulty !== 'all' ? difficulty : undefined,
      categoryId: category || undefined
    },
    include: {
      questions: true,
      category: true
    },
    orderBy: {
      attempts: 'desc'
    }
  });

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  // Get most participated quizzes
  const mostParticipated = [...quizzes].sort((a, b) => b.attempts - a.attempts).slice(0, 6);

  // Get recently created quizzes
  const recentlyCreated = [...quizzes].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  ).slice(0, 6);

  // Get selected category name
  const selectedCategory = category ? categories.find(c => c.id === category) : null;

  return (
    <>
          <Topbar />
    <div className="md:mt-5 md:px-10 xl:px-16 pb-16 bg-gradient-to-b from-white to-gray-100">
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 min-h-[40vh] md:min-h-[50vh] flex items-center">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 px-2">
            {selectedCategory ? `${selectedCategory.name} Quizzes` : "Test Your Knowledge"}
          </h1>
          <p className="text-base md:text-lg text-gray-200 mb-6 max-w-2xl mx-auto px-4">
            Challenge yourself with our interactive assessment and track your progress as you learn.
          </p>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 max-w-4xl mx-auto px-2">
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{quizzes.length}</h3>
              <p className="text-xs md:text-sm text-gray-200">Quizzes</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {quizzes.reduce((sum, quiz) => sum + quiz.attempts, 0)}
              </h3>
              <p className="text-xs md:text-sm text-gray-200">Attempts</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {quizzes.reduce((sum, quiz) => sum + quiz.questions.length, 0)}
              </h3>
              <p className="text-xs md:text-sm text-gray-200">Questions</p>
            </div>
            <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
              <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                {mostParticipated.length > 0 ? mostParticipated[0].attempts : '0'}
              </h3>
              <p className="text-xs md:text-sm text-gray-200">Most Attempts</p>
            </div>
          </div>
        </div>
      </div>

      {/* Difficulty Filters */}
      <div className="flex gap-2 justify-center mb-8 flex-wrap mt-20">
        {difficulties.map((diff) => (
          <Link
            key={diff.value}
            href={`/quizzes?difficulty=${diff.value}${category ? `&category=${category}` : ''}`}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              "border hover:shadow-md",
              difficulty === diff.value
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            )}
          >
            {diff.label}
          </Link>
        ))}
        {(difficulty || category) && (
          <Link
            href="/quizzes"
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all",
              "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100"
            )}
          >
            Clear All Filters
          </Link>
        )}
      </div>

      {selectedCategory ? (
        <div className="my-10">
          <h2 className="text-2xl font-bold mb-6">{selectedCategory.name} Assesments</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
            {quizzes.map((quiz) => (
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
      ) : (
        <>
          {/* Featured Quizzes Section */}
          <div className="my-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Most Popular</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
              {mostParticipated.map((quiz) => (
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

          {/* Recently Added Section */}
          <div className="my-10">
            <h2 className="text-2xl font-bold mb-6 text-center">Recently Added</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
              {recentlyCreated.map((quiz) => (
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

          {/* All Quizzes Section */}
          <div className="my-10">
            <h2 className="text-2xl font-bold mb-6 text-center">All Assesments</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 px-4">
              {quizzes.map((quiz) => (
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
        </>
      )}

      {/* Categories Section */}
      <div className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Explore Assesments Categories
            <span className="block mt-2 text-lg font-normal text-gray-600">
              Choose a category to find topic that match your interests
            </span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/quizzes?category=${category.id}`}
                className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600 opacity-90 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-8 h-56 flex flex-col justify-center items-center text-center">
                  <h3 className="text-2xl font-bold text-white mb-3 group-hover:scale-105 transition-transform">
                    {category.name}
                  </h3>
                  <div className="w-12 h-1 bg-white mb-4 transform group-hover:scale-x-125 transition-transform" />
                  <p className="text-gray-200 text-sm text-center">
                    {quizzes.filter(q => q.categoryId === category.id).length} Assesments available
                  </p>
                </div>
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="animate-bounce">
                    <svg 
                      className="w-16 h-16 text-white" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M13 7l5 5m0 0l-5 5m5-5H6" 
                      />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default QuizzesPage; 