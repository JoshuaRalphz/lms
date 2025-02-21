import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { quizId, score } = await req.json();

    const attempt = await db.quizAttempt.create({
      data: {
        userId,
        quizId,
        score
      }
    });

    return NextResponse.json(attempt);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 