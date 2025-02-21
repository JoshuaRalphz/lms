import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import QuizBuilder from "@/components/quiz/QuizBuilder";
import {db} from "@/lib/db";

const QuizBuilderPage = async () => {
  const { userId } = await auth();
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc"
    }
  });

  if (!userId) {
    return redirect("/sign-in");
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Quiz Builder</h1>
      <QuizBuilder categories={categories.map(c => ({
        label: c.name,
        value: c.id
      }))} />
    </div>
  );
};

export default QuizBuilderPage; 