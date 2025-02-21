import getCoursesByCategory from "@/app/actions/getCourses";
import CourseCard from "@/components/courses/CourseCard";
import Categories from "@/components/custom/Categories";
import { db } from "@/lib/db";
import  CourseWithReviews  from "@/app/actions/getCourses";

const CoursesByCategory = async ({
  params,
}: {
  params: { categoryId: string };
}) => {
  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });

  const courses = await getCoursesByCategory(params.categoryId);

  return (
    <div className="md:mt-5 md:px-10 xl:px-16 pb-16">
      <Categories categories={categories} selectedCategory={params.categoryId} />
      <div className="flex flex-wrap gap-7 justify-center">
        {courses.map((course) => (
          <CourseCard 
            key={course.id} 
            course={{
              ...course,
              sections: course.sections || [],
              level: course.level || null,
              category: course.category || { name: 'Uncategorized' },
              Review: course.Review || [],
              purchases: course.purchases || [],
              views: course.views || 0,
              instructorId: course.instructorId,
              levelId: course.levelId || null,
              categoryId: course.categoryId,
              price: course.price || null,
              imageUrl: course.imageUrl || null,
              description: course.description || null
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesByCategory;
