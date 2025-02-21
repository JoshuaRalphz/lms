import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";

export const GET = async (req: NextRequest, { params }: { params: { courseId: string; sectionId: string } }) => {
  try {
    const comments = await db.comment.findMany({
      where: {
        sectionId: params.sectionId
      },
      orderBy: {
        createdAt: "desc"
      }
    });

    return NextResponse.json(comments);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const POST = async (req: NextRequest, { params }: { params: { courseId: string; sectionId: string } }) => {
  try {
    const { userId } = await auth();
    const body = await req.json();
    
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Check course ownership or purchase
    const course = await db.course.findUnique({
      where: { id: params.courseId },
      select: { instructorId: true }
    });

    if (!course) {
      return new NextResponse("Course not found", { status: 404 });
    }

    const isInstructor = course.instructorId === userId;
    const purchase = await db.purchase.findUnique({
      where: {
        customerId_courseId: {
          customerId: userId,
          courseId: params.courseId
        }
      }
    });

    if (!isInstructor && !purchase) {
      return new NextResponse("Course not purchased", { status: 403 });
    }

    // Get Clerk user data
    const clerkClientInstance = await clerkClient();
const clerkUser = await clerkClientInstance.users.getUser(userId);
    const fullName = [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || "Anonymous";
    const userImage = clerkUser.imageUrl;

    // Create comment with user relation
    const comment = await db.comment.create({
      data: {
        text: body.text,
        sectionId: params.sectionId,
        userId: userId,
        userName: fullName,
        userImage: userImage
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};