import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET = async (req: Request, { params }: { params: { courseId: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const course = await db.course.findUnique({
      where: { id: params.courseId }
    });

    if (!course) return new NextResponse("Course not found", { status: 404 });

    const isInstructor = course.instructorId === userId;
    const purchase = await db.purchase.findUnique({
      where: { customerId_courseId: { customerId: userId, courseId: params.courseId } }
    });

    return NextResponse.json({ 
      hasPurchase: !!purchase || isInstructor 
    });
    
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};