import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { clerkClient } from "@clerk/nextjs/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    const { name } = await req.json();

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Use upsert to create or update the user
    const updatedUser = await db.user.upsert({
      where: { id: userId },
      update: { name },
      create: {
        id: userId,  // Use Clerk's userId as the ID
        name,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("[USER_NAME_UPDATE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
};