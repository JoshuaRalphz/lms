import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { InterestPage } from "@/components/interest/Interest";
import { Suspense } from "react";
import {Loading} from "@/components/custom/Loading";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const [userInterests, categories] = await Promise.all([
    db.userInterest.findMany({
      where: { userId },
      include: { category: true }
    }),
    db.category.findMany({
      orderBy: { name: "asc" }
    })
  ]);

  return (
    <Suspense fallback={<Loading className="min-h-screen" />}>
      <InterestPage 
        categories={categories} 
        userInterests={userInterests}
        isUpdateMode={true}
      />
    </Suspense>
  );
}