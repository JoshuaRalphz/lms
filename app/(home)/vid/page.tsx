import { db } from "@/lib/db";
import CourseCard from "@/components/courses/CourseCard";
import { CourseCategories } from "@/components/courses/CourseCategories";

// Utility function to calculate average rating
const calculateAverageRating = (reviews: { rating: number }[]) => {
  return reviews.length > 0 
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
    : 0;
};

const CoursesPage = async ({ searchParams }: { searchParams: { category?: string } }) => {
  const category = searchParams.category;

  // Fetch data in parallel
  const [courses, categories] = await Promise.all([
    db.course.findMany({
      where: {
        isPublished: true,
        categoryId: category || undefined
      },
      include: {
        sections: {
          where: { isPublished: true },
          include: { progress: true }
        },
        Review: true,
        purchases: true,
        category: true,
        courseAnalytics: {
          select: { views: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    db.category.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  // Calculate statistics once
  const courseStats = {
    totalCourses: courses.length,
    totalEnrollments: courses.reduce((sum, course) => sum + course.purchases.length, 0),
    totalLessons: courses.reduce((sum, course) => sum + course.sections.length, 0),
    totalViews: courses.reduce((sum, course) => sum + (course.courseAnalytics?.views || 0), 0)
  };

  // Process courses once
  const processedCourses = courses.map(course => ({
    ...course,
    averageRating: calculateAverageRating(course.Review),
    enrollmentCount: course.purchases.length
  }));

  // Get filtered lists
  const mostPopular = [...processedCourses]
    .filter(course => course.enrollmentCount > 0)
    .sort((a, b) => b.enrollmentCount - a.enrollmentCount)
    .slice(0, 6);

  const topRated = [...processedCourses]
    .filter(course => course.averageRating > 0)
    .sort((a, b) => b.averageRating - a.averageRating)
    .slice(0, 6);

  const freeCourses = processedCourses.filter(course => course.price === 0 || course.isFree);
  const recentlyUploaded = [...processedCourses]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 6);

  const selectedCategory = category ? categories.find(c => c.id === category) : null;

  return (
    <>
      {/* <Topbar /> */}
      <div className="md:mt-5 md:px-10 xl:px-16 pb-16 bg-gradient-to-b from-white to-gray-100">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 min-h-[40vh] md:min-h-[50vh] flex items-center">
          <div className="container mx-auto px-4 text-center relative z-10">
            <h1 className="text-3xl md:text-4xl lg:text-6xl font-bold text-white mb-4 px-2 mt-10">
              {selectedCategory ? `${selectedCategory.name} Courses` : "Expand Your Knowledge"}
            </h1>
            <p className="text-base md:text-lg text-gray-200 mb-6 max-w-2xl mx-auto px-4">
              Explore our comprehensive courses taught by industry experts and take your skills to the next level.
            </p>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4 max-w-4xl mx-auto px-2 mb-10">
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">{courseStats.totalCourses}</h3>
                <p className="text-xs md:text-sm text-gray-200">Courses</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {courseStats.totalEnrollments}
                </h3>
                <p className="text-xs md:text-sm text-gray-200">Enrollments</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {courseStats.totalLessons}
                </h3>
                <p className="text-xs md:text-sm text-gray-200">Lessons</p>
              </div>
              <div className="text-center p-3 bg-white/10 rounded-lg backdrop-blur-sm border border-white/20">
                <h3 className="text-xl md:text-2xl font-bold text-white mb-1">
                  {courseStats.totalViews.toLocaleString()}
                </h3>
                <p className="text-xs md:text-sm text-gray-200">Views</p>
              </div>
            </div>
          </div>
        </div>

        <CourseCategories categories={categories} />

        {selectedCategory ? (
          <div className="my-6 md:my-10 px-4 md:px-0">
            <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">{selectedCategory.name} Courses</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {courses.map((course) => (
                <CourseCard 
                  key={course.id} 
                  course={{
                    ...course,
                    subtitle: course.subtitle || "",
                    price: course.price ?? undefined,
                    imageUrl: course.imageUrl || undefined,
                    courseAnalytics: course.courseAnalytics || undefined
                  }} 
                />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Most Popular Section */}
            <div className="my-6 md:my-10 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Most Popular</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {mostPopular.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={{
                      ...course,
                      subtitle: course.subtitle || "",
                      price: course.price ?? undefined,
                      imageUrl: course.imageUrl || undefined,
                      courseAnalytics: course.courseAnalytics || undefined
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Top Rated Section */}
            <div className="my-6 md:my-10 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Top Rated</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {topRated.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={{
                      ...course,
                      subtitle: course.subtitle || "",
                      price: course.price ?? undefined,
                      imageUrl: course.imageUrl || undefined,
                      courseAnalytics: course.courseAnalytics || undefined
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Recently Uploaded Section */}
            <div className="my-6 md:my-10 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Recently Uploaded</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {recentlyUploaded.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={{
                      ...course,
                      subtitle: course.subtitle || "",
                      price: course.price ?? undefined,
                      imageUrl: course.imageUrl || undefined,
                      courseAnalytics: course.courseAnalytics || undefined
                    }} 
                  />
                ))}
              </div>
            </div>

            {/* Free Courses Section */}
            <div className="my-6 md:my-10 px-4 md:px-0">
              <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-center">Free Webinar&apos;s</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                {freeCourses.map((course) => (
                  <CourseCard 
                    key={course.id} 
                    course={{
                      ...course,
                      subtitle: course.subtitle || "",
                      price: course.price ?? undefined,
                      imageUrl: course.imageUrl || undefined,
                      courseAnalytics: course.courseAnalytics || undefined
                    }} 
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CoursesPage;