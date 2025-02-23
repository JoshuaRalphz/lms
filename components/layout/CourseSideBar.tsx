"use client"
import { Course, Section, Purchase } from "@prisma/client";
import Link from "next/link";
import { Progress } from "../ui/progress";
import { usePathname } from "next/navigation";

interface CourseSideBarProps {
  course: Course & { sections: Section[] };
  studentId: string;
  progressPercentage: number;
  purchase: Purchase | null;
}

const CourseSideBar = ({ 
  course, 
  studentId,
  progressPercentage,
  purchase
}: CourseSideBarProps) => {
  const pathname = usePathname();

  return (
    <div className="hidden md:flex flex-col w-64 border-r shadow-md px-3 my-4 text-sm font-medium">
      <h1 className="text-lg font-bold text-center mb-4">{course.title}</h1>
      <div>
        <Progress value={progressPercentage} className="h-3" />
        <p className="text-xs">{Math.round(progressPercentage)}% completed</p>
      </div>
      <Link
        href={`/courses/${course.id}/overview`}
        className={`p-3 rounded-lg hover:bg-[#A9B5DF] hover:text-[#34495E] mt-4 uppercase text-sm font-bold border-b-2 border-[#34495E] ${
          pathname === `/courses/${course.id}/overview` ? "bg-[#A9B5DF] text-[#34495E]" : ""
        }`}
      >
        MAIN
      </Link>
      {course.sections.map((section) => (
        <Link
          key={section.id}
          href={`/courses/${course.id}/sections/${section.id}`}
          className={`p-3 rounded-lg hover:bg-[#A9B5DF] hover:text-[#34495E] mt-4 ${
            pathname === `/courses/${course.id}/sections/${section.id}` ? "bg-[#A9B5DF] text-[#34495E]" : ""
          }`}
        >
          {section.title}
        </Link>
      ))}
    </div>
  );
};

export default CourseSideBar;
