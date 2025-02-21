import { Course, Section } from "@prisma/client";
import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import Link from "next/link";

interface SectionMenuProps {
  course: Course & { sections: Section[] };
}

const SectionMenu = ({ course }: SectionMenuProps) => {
  return (
    <div className="fixed bottom-4 right-4 z-50 md:hidden">
      <Sheet>
        <SheetTrigger>
          <Button className="rounded-full h-14 w-14 shadow-lg bg-[#7886C7] hover:bg-[#A9B5DF] text-white">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
              className="w-6 h-6"
            >
              <path d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </Button>
        </SheetTrigger>
        <SheetContent className="flex flex-col p-4 bg-gradient-to-b from-[#2D336B] to-[#34495E]">
          <div className="flex-1 overflow-y-auto">
            <Link
              href={`/courses/${course.id}/overview`}
              className="flex items-center p-4 mb-2 rounded-lg hover:bg-[#A9B5DF]/20 transition-colors text-white"
            >
              <span className="text-lg font-medium">Main</span>
            </Link>
            {course.sections.map((section) => (
              <Link
                key={section.id}
                href={`/courses/${course.id}/sections/${section.id}`}
                className="flex items-center p-4 mb-2 rounded-lg hover:bg-[#A9B5DF]/20 transition-colors text-white"
              >
                <span className="text-lg font-medium">{section.title}</span>
              </Link>
            ))}
          </div>
          <div className="border-t border-[#A9B5DF]/20 pt-4">
            <p className="text-sm text-[#A9B5DF]/80 text-center">
              {course.sections.length} chapters
            </p>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SectionMenu;
