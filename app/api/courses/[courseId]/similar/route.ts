import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';

export async function GET(
  req: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the current course
    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { categoryId: true }
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    // Get user's interests
    const userInterests = await db.userInterest.findMany({
      where: { userId },
      select: { categoryId: true }
    });

    // Get similar courses
    const similarCourses = await db.course.findMany({
      where: {
        isPublished: true,
        OR: [
          { categoryId: course.categoryId },
          { categoryId: { in: userInterests.map(interest => interest.categoryId) } }
        ],
        NOT: { id: params.courseId }
      },
      include: {
        category: true,
        sections: true,
        Review: true,
        purchases: true,
      },
      take: 6
    });

    return NextResponse.json(similarCourses, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600',
      }
    });
  } catch (error) {
    console.error("[COURSE_SIMILAR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 