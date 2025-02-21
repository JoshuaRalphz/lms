import { db } from "@/lib/db";

type TrackAnalyticsParams = {
  type: string;
  userId?: string;
  courseId?: string;
  quizId?: string;
  sectionId?: string;
  metadata?: any;
};

export const trackAnalytics = async (params: TrackAnalyticsParams) => {
  try {
    await db.analytics.create({
      data: {
        type: params.type,
        userId: params.userId || null,
        courseId: params.courseId || null,
        quizId: params.quizId || null,
        sectionId: params.sectionId || null,
        metadata: params.metadata || null
      }
    });

    // Update course analytics if applicable
    if (params.courseId) {
      await db.courseAnalytics.upsert({
        where: { courseId: params.courseId },
        update: { views: { increment: 1 } },
        create: { courseId: params.courseId, views: 1 }
      });
    }

    // Update quiz analytics if applicable
    if (params.quizId) {
      await db.quizAnalytics.upsert({
        where: { quizId: params.quizId },
        update: { attempts: { increment: 1 } },
        create: { quizId: params.quizId, attempts: 1 }
      });
    }
  } catch (error) {
    console.error("Error tracking analytics:", error);
  }
}; 