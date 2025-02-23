import EditCourseForm from "@/components/courses/EditCourseForm";

import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import StatusBanner from "@/components/ui/statusBanner";
import Link from "next/link";
import { ArrowLeft, CircleDollarSign, LayoutDashboard, ListChecks } from "lucide-react";
import { IconBadge } from "@/components/ui/icon-badge";


import { TitleForm } from "@/components/courses/courseSection/title-form";
import { SubTitleForm } from "@/components/courses/courseSection/SubTitle-form";
import { DescriptionForm } from "@/components/courses/courseSection/description-form";
import { ImageForm } from "@/components/courses/courseSection/image-form";
import { CategoryForm } from "@/components/courses/courseSection/category-form";
import { ChaptersForm } from "@/components/courses/courseSection/chapters-form";
import { PriceForm } from "@/components/courses/courseSection/price-form";
import AlertBanner from "@/components/ui/statusBanner";



const CourseBasics = async ({ params }: { params: { courseId: string } }) => {
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: params.courseId,
      instructorId: userId,
    },
    include: {
      sections: {
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!course) {
    return redirect("/instructor/courses");
  }

  const categories = await db.category.findMany({
    orderBy: {
      name: "asc",
    },
  });


  const requiredFields = [
    course.title,
    course.description,
    course.categoryId,
    course.imageUrl,
    course.isFree || course.price,
    course.sections.some((section) => section.isPublished),
  ];
  const requiredFieldsCount = requiredFields.length;
  const missingFields = requiredFields.filter((field) => !Boolean(field));
  const missingFieldsCount = missingFields.length;
  const isCompleted = requiredFields
    .filter((field) => field !== course.price) // Exclude price from completion check
    .every(Boolean);
  const isPublished = isCompleted && Boolean(course.price); // Ensure price is required for publishing
  
  
  


  // Helper function to format categories
  const formatCategories = (categories: any[]) => {
    return categories.map((cat) => ({
      label: cat.name,
      value: cat.id,
    }));
  };


  // Helper function to format levels
  const formatLevels = (levels: any[]) => {
    return levels.map((level) => ({
      label: level.name,
      value: level.id,
    }));
  };

  return (
    <div className="px-10">

      <AlertBanner
      isCompleted={isCompleted}
      isPublished={isPublished}  // ✅ Make sure this is being passed
      requiredFieldsCount={requiredFieldsCount}
      missingFieldsCount={missingFieldsCount}
      />


      {/* Link to go back to courses page */}

      <EditCourseForm
        course={course}
        categories={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
        isCompleted={isCompleted}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <div>
          <div className="flex items-center gap-x-2">
            <IconBadge icon={LayoutDashboard} />
            <h2 className="text-xl">Customize your course</h2>
          </div>
          <TitleForm initialData={course} courseId={course.id} />
          <SubTitleForm initialData={course} courseId={course.id} />
          <ImageForm initialData={course} courseId={course.id} />
          <DescriptionForm initialData={course} courseId={course.id} />
        </div>

        <div className="space-y-6">
            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={ListChecks} />
                <h2 className="text-xl">Course chapters</h2>
              </div>
              <ChaptersForm initialData={course} courseId={course.id} />
              <CategoryForm
            initialData={course}
            courseId={course.id}
            categories={formatCategories(categories)}
          />
            </div>

            <div>
              <div className="flex items-center gap-x-2">
                <IconBadge icon={CircleDollarSign} />
                <h2 className="text-xl">Sell your course</h2>
              </div>
              <PriceForm 
                initialData={{ ...course, price: course.price ?? 0 }} 
                courseId={course.id}  
              />
            </div>
          </div>
        </div>
      </div>
  );
};

export default CourseBasics;