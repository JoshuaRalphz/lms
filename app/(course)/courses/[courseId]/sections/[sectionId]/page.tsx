import SectionsDetails from "@/components/sections/SectionsDetails";
import { db } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import { Resource } from "@prisma/client";
import { redirect } from "next/navigation";
import { CommentSection } from "@/components/courses/courseSection/CommentSection";

const SectionDetailsPage = async ({
  params,
}: {
  params: { courseId: string; sectionId: string };
}) => {
  const { courseId, sectionId } = params;
  const { userId } = await auth();

  if (!userId) {
    return redirect("/sign-in");
  }

  const course = await db.course.findUnique({
    where: {
      id: courseId,
      isPublished: true,
    },
    include: {
      sections: {
        where: {
          isPublished: true,
        },
        include: {
          progress: {
            where: {
              studentId: userId,
            },
          },
        },
      },
    },
  });

  if (course) {
    course.sections.forEach((section) => {
      section.progress;
    });
  }


  if (!course) {
    return redirect("/");
  }

  const section = await db.section.findUnique({
    where: {
      id: sectionId,
      courseId,
      isPublished: true,
    },
  });

  if (!section) {
    return redirect(`/courses/${courseId}/overview`);
  }

const purchase = await db.purchase.findUnique({
  where: {
    customerId_courseId: {
      customerId: userId,
      courseId,
    },
  },
});

// Check if user is the instructor
const isInstructor = course.instructorId === userId;

let muxData = null;
let resources: Resource[] = [];

if (section.isFree || purchase || isInstructor) {
  muxData = await db.muxData.findUnique({
    where: {
      sectionId,
    },
  });
}

  if (purchase || isInstructor) {
    resources = await db.resource.findMany({
      where: {
        sectionId,
      },
    });
  }

  const progress = await db.progress.findUnique({
    where: {
      studentId_sectionId: {
        studentId: userId,
        sectionId,
      },
    },
  });

  const completedSections = await db.progress.count({
    where: {
      studentId: userId,
      sectionId: {
        in: course.sections.map(section => section.id),
      },
      isCompleted: true,
    }
  });

  const progressPercentage = (completedSections / course.sections.length) * 100;

  return (
    <SectionsDetails
      course={course}
      section={section}
      purchase={purchase}
      muxData={muxData}
      resources={resources}
      progress={progress}
      isInstructor={isInstructor}
      progressPercentage={progressPercentage}
    >
      <CommentSection 
        courseId={courseId} 
        sectionId={sectionId}
        userId={userId}
        isFree={course.price === 0}
      />
    </SectionsDetails>
  );
};

export default SectionDetailsPage;
