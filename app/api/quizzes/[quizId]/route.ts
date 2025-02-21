import { db } from "@/lib/db";
import { isTeacher } from "@/lib/instructor";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const GET = async (req: Request, { params }: { params: { quizId: string } }) => {
  try {
    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId },
      include: { questions: true }
    });

    if (!quiz) return new NextResponse("Quiz not found", { status: 404 });

    return NextResponse.json(quiz);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const DELETE = async (req: Request, { params }: { params: { quizId: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const isInstructor = isTeacher(userId);
    if (!isInstructor) return new NextResponse("Forbidden", { status: 403 });

    const quiz = await db.quiz.findUnique({
      where: { id: params.quizId },
      include: { questions: true }
    });

    if (!quiz) return new NextResponse("Quiz not found", { status: 404 });
    if (quiz.instructorId !== userId) return new NextResponse("Unauthorized", { status: 401 });

    // Delete related questions first
    await db.question.deleteMany({
      where: { quizId: params.quizId }
    });

    // Then delete the quiz
    await db.quiz.delete({
      where: { id: params.quizId }
    });

    return new NextResponse("Quiz deleted", { status: 200 });
  } catch (error) {
    console.error("Delete error:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};

export const PUT = async (req: Request, { params }: { params: { quizId: string } }) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { title, description, difficulty, categoryId, questions } = await req.json();
    
    // First delete all existing questions
    await db.question.deleteMany({
      where: { quizId: params.quizId }
    });

    // Then create new questions
    const updatedQuiz = await db.quiz.update({
      where: { id: params.quizId },
      data: {
        title,
        description,
        difficulty,
        categoryId,
        questions: {
          create: questions.map((q: any) => ({
            question: q.question,
            type: q.type,
            options: q.options?.join('|') || null,
            correctAnswer: q.correctAnswer.toString()
          }))
        }
      },
      include: { questions: true }
    });

    return NextResponse.json(updatedQuiz);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 