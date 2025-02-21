import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InterestPage } from "@/components/interest/Interest";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const userInterests = await db.userInterest.findMany({
    where: { userId },
    include: { category: true }
  });

  const categories = await db.category.findMany({
    orderBy: { name: "asc" }
  });

  return <InterestPage 
    categories={categories} 
    userInterests={userInterests}
    isUpdateMode={true}
  />;
}