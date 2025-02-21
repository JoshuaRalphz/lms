import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request, { params }: { params: { quizId: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { question, type, options, correctAnswer } = await req.json();
    
    const newQuestion = await db.question.create({
      data: {
        quizId: params.quizId,
        question,
        type,
        options,
        correctAnswer
      }
    });

    return NextResponse.json(newQuestion);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 