import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description, difficulty, categoryId, questions } = await req.json();
    
    // Create the quiz
    const quiz = await db.quiz.create({
      data: {
        title,
        description,
        difficulty,
        instructorId: userId,
        categoryId: categoryId || null,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            type: q.type,
            options: q.options?.join('|') || null,
            correctAnswer: q.correctAnswer.toString()
          }))
        }
      },
      include: {
        questions: true
      }
    });

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error creating quiz:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const GET = async () => {
  try {
    const quizzes = await db.quiz.findMany({
      include: {
        questions: true
      }
    });

    return NextResponse.json(quizzes);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 