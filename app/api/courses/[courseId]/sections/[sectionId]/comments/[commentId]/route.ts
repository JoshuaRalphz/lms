import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export const PATCH = async (
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; commentId: string } }
) => {
  try {
    const { userId } = await auth();
    const body = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const comment = await db.comment.update({
      where: {
        id: params.commentId,
        userId: userId
      },
      data: {
        text: body.text
      }
    });

    return NextResponse.json(comment);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (
  req: Request,
  { params }: { params: { courseId: string; sectionId: string; commentId: string } }
) => {
  try {
    const { userId } = await auth();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await db.comment.delete({
      where: {
        id: params.commentId,
        userId: userId
      }
    });

    return new NextResponse("Comment deleted", { status: 200 });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};
