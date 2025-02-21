import { db } from "@/lib/db";
import { NextResponse } from "next/server";

export const POST = async (req: Request, { params }: { params: { quizId: string } }) => {
  try {
    const { score } = await req.json();
    
    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId }
    });

    if (!quiz) {
      return new NextResponse("Quiz not found", { status: 404 });
    }

    // Calculate new average score
    const newAverage = (quiz.averageScore * quiz.attempts + score) / (quiz.attempts + 1);

    const updatedQuiz = await db.quiz.update({
      where: { id: params.quizId },
      data: { 
        averageScore: newAverage,
      },
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 