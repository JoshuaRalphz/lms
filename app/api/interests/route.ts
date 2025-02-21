import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    if (!userId) return new NextResponse("Unauthorized", { status: 401 });

    const { categoryIds } = await req.json();

    // Delete existing interests
    await db.userInterest.deleteMany({
      where: { userId }
    });

    // Create new interests
    const interests = await db.userInterest.createMany({
      data: categoryIds.map((categoryId: string) => ({
        userId,
        categoryId
      }))
    });

    return NextResponse.json(interests);
  } catch (error) {
    console.error("Error saving interests:", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}; 