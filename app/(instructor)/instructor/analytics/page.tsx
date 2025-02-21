import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AnalyticsDashboard from "@/components/analytics/AnalyticsDashboard";
import { getPerformance } from "@/app/actions/getPerformance";

const AnalyticsPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  // Get course IDs for the instructor
  const courseIds = (await db.course.findMany({
    where: { instructorId: userId },
    select: { id: true }
  })).map(c => c.id);

  // Get course analytics with views
  const courseAnalytics = await db.courseAnalytics.findMany({
    where: {
      courseId: { in: courseIds }
    },
  });

  // Get performance data (revenue and sales)
  const performance = await getPerformance(userId);

  // Get recent activity
  const recentActivity = await db.analytics.findMany({
    where: {
      courseId: { in: courseIds },
      type: { in: ['course_view', 'section_completion'] }
    },
    orderBy: {
      createdAt: "desc"
    },
    take: 50,
    include: {
      course: true,
      user: true
    }
  });

  // Get course details for titles
  const courses = await db.course.findMany({
    where: { id: { in: courseIds } },
    select: { id: true, title: true, price: true }
  });

  // Merge course analytics with titles and views
  const mergedCourseAnalytics = courseAnalytics.map(analytic => ({
    ...analytic,
    title: courses.find(c => c.id === analytic.courseId)?.title || 'Untitled',
    views: analytic.views
  }));

  // Format performance data for chart
  const performanceData = performance.data.map(item => ({
    name: item.name,
    price: item.total,
    sales: item.count,
    type: item.total > 0 ? 'paid' : 'free'
  }));

  // Calculate paid revenue and free courses count
  const paidRevenue = performance.data
    .filter(item => item.total > 0)
    .reduce((sum, item) => sum + item.total, 0);

  const freeCoursesCount = performance.data
    .filter(item => item.total === 0)
    .reduce((sum, item) => sum + item.count, 0);

  const totalReviews = await db.review.count({
    where: {
      course: {
        instructorId: userId
      }
    }
  });

  const totalCourses = courseIds.length;
  const avgReviewsPerCourse = (totalCourses > 0 ? (totalReviews / totalCourses).toFixed(1) : 0).toString();

  // After getting courseAnalytics
  const paidViews = courseAnalytics
    .filter(analytic => courses.find(c => c.id === analytic.courseId)?.price! > 0)
    .reduce((sum, analytic) => sum + analytic.views, 0);

  const freeViews = courseAnalytics
    .filter(analytic => courses.find(c => c.id === analytic.courseId)?.price! === 0)
    .reduce((sum, analytic) => sum + analytic.views, 0);

  return (
    <AnalyticsDashboard 
      data={{
        courseAnalytics: mergedCourseAnalytics,
        performanceData,
        recentActivity,
        totalRevenue: performance.totalRevenue,
        paidRevenue,
        freeCoursesCount,
        totalSales: performance.totalSales,
        totalReviews,
        avgReviewsPerCourse,
        viewsData: [
          { name: 'Paid', value: paidViews },
          { name: 'Free', value: freeViews }
        ]
      }}
    />
  );
};

export default AnalyticsPage;