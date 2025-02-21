import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { courseId: string; reviewId: string } }
) => {
  try {
    const { userId } = await auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const review = await db.review.update({
      where: {
        id: params.reviewId,
        userId
      },
      data: {
        text: body.text,
        rating: body.rating
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { courseId: string; reviewId: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.review.delete({
      where: {
        id: params.reviewId,
        userId
      }
    });

    return new NextResponse("Review deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 