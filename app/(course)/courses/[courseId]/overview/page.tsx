import { clerkClient } from '@clerk/clerk-sdk-node'; // Correct import
import Image from "next/image";
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

const CourseOverview = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = await auth();
  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      isPublished: true,
    },
    include: {
      sections: {
        where: {
          isPublished: true,
        },
        include: {
          progress: true
        }
      },
      Review: true,
      courseAnalytics: true
    },
  });

  if (!course) {
    return redirect("/");
  }

  const instructor = await clerkClient.users.getUser(course.instructorId);

  // Check if course is completed
  const completedSections = await db.progress.count({
    where: {
      studentId: userId!,
      sectionId: {
        in: course.sections?.map(section => section.id) || [],
      },
      isCompleted: true,
    }
  });

  const totalSections = course.sections?.length || 0;
  const isCourseCompleted = totalSections > 0 && 
    completedSections === totalSections;

  const isInstructor = course.instructorId === userId;

  const purchase = await db.purchase.findUnique({
    where: {
      customerId_courseId: {
        customerId: userId!,
        courseId: params.courseId,
      },
    },
  });

  const reviewCount = course.Review.length;
  const averageRating = reviewCount > 0 
    ? course.Review.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  console.log('Tracking course view:', params.courseId);
  await trackAnalytics({
    type: 'course_view',
    userId: userId || undefined,
    courseId: params.courseId
  });

  // Update course views count
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
      <p className="font-medium text-lg">{course.subtitle}</p>

      <div className="space-y-4">
        {/* Instructor */}
        <div className="flex gap-2 items-center">
          <Image
            src={instructor.imageUrl || "/avatar_placeholder.jpg"}
            alt={instructor.fullName || "Instructor photo"}
            width={30}
            height={30}
            className="rounded-full"
          />
          <p className="font-bold">Instructor:</p>
          <p>{instructor.fullName}</p>
        </div>

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
};

export default CourseOverview;
