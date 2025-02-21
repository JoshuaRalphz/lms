import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export const POST = async (req: NextRequest) => {
  try {
    const { userId } = await auth()

    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 })
    }

    const { title, categoryId } = await req.json()

    const course = await db.course.create({
      data: {
        title,
        categoryId,
        instructorId: userId
      }
    })

    return NextResponse.json(course, {status: 200 })
  } catch (err) {
    console.log("[courses_POST]", err)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}