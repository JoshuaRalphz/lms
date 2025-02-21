import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { DataTable } from "@/components/custom/DataTable";
import { columns } from "@/components/quiz/Columns";

const QuizPage = async () => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const quizzes = await db.quiz.findMany({
    where: {
      instructorId: userId,
    },
    include: {
      questions: true,
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="px-6 py-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Your Quizzes</h1>
        <Link href="/instructor/quiz/create-quiz">
          <Button>Create New Quiz</Button>
        </Link>
      </div>

      <div className="mt-5">
        <DataTable columns={columns} data={quizzes} />
      </div>
    </div>
  );
};

export default QuizPage;