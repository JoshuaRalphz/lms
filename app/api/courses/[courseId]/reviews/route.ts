import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest, { params }: { params: { courseId: string } }) => {
  try {
    const reviews = await db.review.findMany({
      where: { courseId: params.courseId },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const POST = async (req: NextRequest, { params }: { params: { courseId: string } }) => {
  try {
    const { userId } = await auth();
    const body = await req.json();
    
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    // Add course ownership check
    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { instructorId: true }
    });

    if (!course) return new NextResponse("Course not found", { status: 404 });

    const isInstructor = course.instructorId === userId;
    const purchase = await db.purchase.findUnique({
      where: { customerId_courseId: { customerId: userId, courseId: params.courseId } }
    });

    if (!isInstructor && !purchase) return new NextResponse("Course not purchased", { status: 403 });

    const existingReview = await db.review.findFirst({
      where: {
        userId,
        courseId: params.courseId
      }
    });

    if (existingReview) {
      return new NextResponse("You've already reviewed this course", { status: 400 });
    }

    const clerkClientInstance = await clerkClient();
    const clerkUser = await clerkClientInstance.users.getUser(userId);
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Anonymous";

    const review = await db.review.create({
      data: {
        ...body,
        courseId: params.courseId,
        userId,
        userName: fullName,
        userImage: clerkUser.imageUrl
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 