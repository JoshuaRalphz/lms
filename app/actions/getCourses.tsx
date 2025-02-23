import { db } from "@/lib/db"
import { Course } from "@prisma/client"

interface CourseWithReviews extends Course {
  category: any;
  sections: any[];
  Review: { rating: number }[];
  purchases: { id: string }[];
}

const getCoursesByCategory = async (categoryId: string | null): Promise<CourseWithReviews[]> => {
  const whereClause: any = {
    ...(categoryId ? { categoryId, isPublished: true } : { isPublished: true }),
  }
  const courses = await db.course.findMany({
    where: whereClause,
    include: {
      category: true,
      level: true,
      sections: {
        where: {
          isPublished: true,
        }
      },
      Review: {
        select: {
          rating: true
        }
      },
      purchases: {
        select: {
          id: true
        }
      }
    },
    orderBy: {
      createdAt: "desc",
    },
  })

  return courses;
}

export default getCoursesByCategory