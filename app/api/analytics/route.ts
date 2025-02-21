import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
  try {
    const { userId } = await auth();
    const { type, courseId, quizId, sectionId, metadata } = await req.json();

    // Create analytics record
    await db.analytics.create({
      data: {
        type,
        userId: userId || null,
        courseId: courseId || null,
        quizId: quizId || null,
        sectionId: sectionId || null,
        metadata: metadata || null
      }
    });

    // Update course analytics if applicable
    if (courseId) {
      await db.courseAnalytics.upsert({
        where: { courseId },
        update: { views: { increment: 1 } },
        create: { courseId, views: 1 }
      });
    }

    // Update quiz analytics if applicable
    if (quizId) {
      await db.quizAnalytics.upsert({
        where: { quizId },
        update: { attempts: { increment: 1 } },
        create: { quizId, attempts: 1 }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
};