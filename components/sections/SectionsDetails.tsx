"use client";

import {
  Course,
  MuxData,
  Progress,
  Purchase,
  Resource,
  Section,
} from "@prisma/client";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { File, Loader2, Lock } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import ReadText from "@/components/custom/ReadText";
import MuxPlayer from "@mux/mux-player-react";
import Link from "next/link";
import ProgressButton from "./ProgressButton";
import SectionMenu from "../layout/SectionMenu";
import { formatPrice } from "@/lib/formatPrice";
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';

interface SectionsDetailsProps {
  course: Course & { sections: Section[] };
  section: Section;
  purchase: Purchase | null;
  muxData: MuxData | null;
  resources: Resource[] | [];
  progress: Progress | null;
  isInstructor: boolean;
  progressPercentage: number;
  children?: React.ReactNode;
}

const SectionsDetails = ({
  course,
  section,
  purchase,
  muxData,
  resources,
  progress,
  isInstructor,
  progressPercentage,
  children,
}: SectionsDetailsProps) => {
  const router = useRouter();
  const { userId } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const isLocked = !purchase && !section.isFree && !isInstructor;
  const playerRef = useRef<MuxPlayerRefAttributes | null>(null);

  useEffect(() => {
    if (muxData?.playbackId && !isLocked) {
      const timer = setTimeout(() => {
        if (playerRef.current) {
          playerRef.current.play();
        }
      }, 2000); // 2 seconds delay

      return () => clearTimeout(timer);
    }
  }, [muxData?.playbackId, isLocked]);

  const handleSectionComplete = async () => {
    try {
      setIsLoading(true);
      
      // Mark as complete if not already completed
      if (!progress?.isCompleted) {
        await axios.post(
          `/api/courses/${course.id}/sections/${section.id}/progress`,
          { isCompleted: true }
        );
        toast.success("Section marked as complete!");
      }

      // Sort sections by position
      const sortedSections = [...course.sections].sort((a, b) => a.position - b.position);
      
      // Find the next section
      const currentIndex = sortedSections.findIndex(s => s.id === section.id);
      const nextSection = sortedSections[currentIndex + 1];
      
      if (nextSection) {
        router.push(`/courses/${course.id}/sections/${nextSection.id}`);
      } else {
        toast.success("You've completed the last section!");
        router.push(`/courses/${course.id}/overview`);
      }
      
      router.refresh();
    } catch (err) {
      console.error("Failed to update progress:", err);
      toast.error("Failed to mark section as complete");
    } finally {
      setIsLoading(false);
    }
  };

  const buyCourse = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post(`/api/courses/${course.id}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.log("Failed to checkout course", err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="px-6 py-4 flex flex-col gap-5">

      {isLocked ? (
        <div className="px-10 flex flex-col gap-5 items-center bg-[#e3f1f1]">
          <Lock className="h-12 w-12 m-5" />
          <p className="text-l font-bold mb-10">
            {course.price === 0
              ? "Video for this section is set to free by the instructor! Please click 'Enrol Now' to have access to the course"
              : "Video for this section is locked! Please buy the course to access"}
          </p>
        </div>
      ) : (
        <MuxPlayer
          playbackId={muxData?.playbackId || ""}
          className="w-full max-w-[1000px] mx-auto"
          onEnded={handleSectionComplete}
          ref={playerRef}
          muted
        />
      )}

<div className="flex flex-col md:flex-row md:justify-between md:items-center">
        <h1 className="text-3xl font-bold max-md:mb-4">{section.title}</h1>

        <div className="flex gap-4">
          <SectionMenu course={course} />
          {!purchase && !isInstructor ? (
            <Button onClick={buyCourse}>
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <p>{section.isFree || course.price === 0 ? "Enroll Now" : `Buy for ${formatPrice(course.price || 0)}`}</p>
              )}
            </Button>
          ) : (
            <ProgressButton
              courseId={course.id}
              sectionId={section.id}
              isCompleted={!!progress?.isCompleted}
              progressPercentage={progressPercentage}
              totalSections={course.sections.length}
              onComplete={handleSectionComplete}
            />
          )}
        </div>
      </div>

      <ReadText value={section.description!} />

      {resources.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-5">Resources</h2>
          {resources.map((resource) => (
            <Link
              key={resource.id}
              href={resource.fileUrl}
              target="_blank"
              className="flex items-center bg-[#e3f1f1] rounded-lg text-sm font-medium p-3"
            >
              <File className="h-4 w-4 mr-4" />
              {resource.name}
            </Link>
          ))}
        </div>
      )}

      {children}
    </div>
  );
};

export default SectionsDetails;
