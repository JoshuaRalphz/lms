import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request, { params }: { params: { quizId: string } }) => {
  try {
    const quiz = await db.quiz.update({
      where: { id: params.quizId },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json(quiz);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 