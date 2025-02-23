import { clerkClient } from '@clerk/clerk-sdk-node';
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { trackAnalytics } from "@/lib/analytics";
import { db } from "@/lib/db";
import ReadText from "@/components/custom/ReadText";
import SectionMenu from "@/components/layout/SectionMenu";
import { CourseCompletion } from "@/components/courses/certificates/CourseCompletion";
import { ReviewSection } from '@/components/courses/ReviewSection';
import { EnrollButton } from "@/components/courses/EnrollButton";
import { RatingStars } from "@/components/courses/RatingStars";
import TrackViewButton from "@/components/analytics/TrackViewButton";
import { Course } from '@prisma/client';

type CourseWithReviews = Course & {
  Review: { rating: number }[];
  sections: {
    id: string;
    title: string;
    description: string | null;
    isPublished: boolean;
    isFree: boolean;
    createdAt: Date;
    updatedAt: Date;
    courseId: string;
    videoUrl: string | null;
    position: number;
  }[];
};

const CourseOverview = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = await auth();
  
  try {
    const course = await db.course.findUnique({
      where: { id: params.courseId, isPublished: true },
      include: {
        sections: {
          where: { isPublished: true },
          include: { progress: true }
        },
        Review: true,
        courseAnalytics: true
      }
    }) as CourseWithReviews | null;

    if (!course) {
      return redirect("/");
    }

    const [instructor, analytics] = await Promise.all([
      clerkClient.users.getUser(course.instructorId),
      trackAnalytics({
        type: 'course_view',
        userId: userId || undefined,
        courseId: params.courseId
      })
    ]);

    const [purchase, progressCount] = await Promise.all([
      db.purchase.findUnique({
        where: {
          customerId_courseId: {
            customerId: userId!,
            courseId: params.courseId,
          }
        }
      }),
      db.progress.count({
        where: {
          studentId: userId!,
          sectionId: {
            in: course?.sections?.map(section => section.id) || [],
          },
          isCompleted: true,
        }
      })
    ]);

    const totalSections = course.sections?.length || 0;
    const isCourseCompleted = totalSections > 0 && progressCount === totalSections;
    const isInstructor = course.instructorId === userId;

    const reviewCount = course.Review.length;
    const averageRating = reviewCount > 0 
      ? course.Review.reduce((sum: number, review: { rating: number }) => sum + review.rating, 0) / reviewCount
      : 0;

    await db.course.update({
      where: { id: params.courseId },
      data: { views: { increment: 1 } }
    });

    return (
      <div className="px-4 sm:px-6 py-4 flex flex-col gap-5 text-sm">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold">{course.title}</h1>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {!purchase && !isInstructor && (
              <EnrollButton 
                courseId={params.courseId}
                price={course.price ?? 0}
                isInstructor={isInstructor}
                className="flex-1 sm:flex-none"
              />
            )}
            <SectionMenu course={course} />
          </div>
        </div>

        {/* Course Info */}
        <h2 className="font-medium text-lg">Speaker: {course.subtitle}</h2>

        <div className="space-y-4">

          {/* Price and Level */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex gap-2">
              <p className="font-bold">Price:</p>
              <p>{course.price === 0 || isInstructor ? "Free" : `₱ ${course.price}`}</p>
            </div>
          </div>

          {/* Rating and Views */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1">
              <RatingStars rating={averageRating} />
              <span className="text-sm text-gray-600">
                ({course.Review.length} reviews)
              </span>
            </div>
            <div className="flex gap-2">
              <p className="font-bold">Views:</p>
              <p>{course.views?.toLocaleString() || 0}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="flex flex-col gap-2">
          <p className="font-bold">Description:</p>
          <ReadText value={course.description!} />
        </div>

        {isCourseCompleted && <CourseCompletion courseId={course.id} />}
        <ReviewSection 
          courseId={params.courseId}
          userId={userId!}
          isFree={course.price === 0}
        />

        <TrackViewButton courseId={params.courseId} userId={userId} />
      </div>
    );
  } catch (error) {
    console.error("Error in CourseOverview:", error);
    return redirect("/");
  }
};

export default CourseOverview;
