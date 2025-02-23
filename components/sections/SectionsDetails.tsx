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
import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import axios from "axios";
import { File, Loader2, Lock } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import ReadText from "@/components/custom/ReadText";
import Link from "next/link";
import { formatPrice } from "@/lib/formatPrice";
import type { MuxPlayerRefAttributes } from '@mux/mux-player-react';
import { debounce } from 'lodash';
import dynamic from 'next/dynamic';
import { Suspense } from 'react';
import SectionMenu from "@/components/layout/SectionMenu";

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

const MuxPlayer = dynamic(
  () => import('@mux/mux-player-react'),
  { 
    ssr: false,
    loading: () => <div className="w-full max-w-[1000px] mx-auto aspect-video bg-gray-200 animate-pulse" />
  }
);

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
  const [showActivityCheck, setShowActivityCheck] = useState(false);
  const activityTimer = useRef<NodeJS.Timeout>();
  const [isMarkingComplete, setIsMarkingComplete] = useState(false);
  const [isVideoPaused, setIsVideoPaused] = useState(false);

  const generateMathProblem = useCallback(() => {
    const operations = ['+', '-', '×', '÷'];
    const randomOperation = operations[Math.floor(Math.random() * operations.length)];
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    
    if (randomOperation === '÷') {
      return {
        problem: `${num1 * num2} ${randomOperation} ${num2}`,
        answer: num1
      };
    }
    
    return {
      problem: `${num1} ${randomOperation} ${num2}`,
      answer: eval(`${num1} ${randomOperation === '×' ? '*' : randomOperation === '÷' ? '/' : randomOperation} ${num2}`)
    };
  }, []);

  const [mathProblem, setMathProblem] = useState(generateMathProblem());
  const [userAnswer, setUserAnswer] = useState('');
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);

  const sortedSections = useMemo(() => 
    [...course.sections].sort((a, b) => a.position - b.position), 
    [course.sections]
  );

  const debouncedSetUserAnswer = useCallback(
    debounce((value: string) => setUserAnswer(value), 300),
    []
  );

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

  // Start the activity check timer
  useEffect(() => {
    const startActivityTimer = () => {
      activityTimer.current = setTimeout(() => {
        setShowActivityCheck(true);
        setIsVideoPaused(true);
      }, 10 * 1000);
    };

    startActivityTimer();

    // Clear timer on unmount
    return () => {
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
    };
  }, []);

  // Reset the timer when user interacts
  useEffect(() => {
    const events = ['mousemove', 'keydown', 'scroll'];
    const handleUserActivity = () => {
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
      // Only reset the timer if the dialog is not showing
      if (!showActivityCheck) {
        activityTimer.current = setTimeout(() => {
          setShowActivityCheck(true);
          setIsVideoPaused(true);
        }, 10 * 1000);
      }
    };

    events.forEach(event => window.addEventListener(event, handleUserActivity));
    
    return () => {
      events.forEach(event => window.removeEventListener(event, handleUserActivity));
    };
  }, [showActivityCheck]);

  const handleSectionComplete = async () => {
    if (isMarkingComplete) return;
    try {
      setIsMarkingComplete(true);
      setIsLoading(true);
      
      // Mark as complete if not already completed
      if (!progress?.isCompleted) {
        await axios.post(
          `/api/courses/${course.id}/sections/${section.id}/progress`,
          { isCompleted: true }
        );
        toast.success("Section marked as complete!");
      }

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
      setIsMarkingComplete(false);
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

  const handleContinue = () => {
    if (Number(userAnswer) === mathProblem.answer) {
      setIsAnswerCorrect(true);
      setShowActivityCheck(false);
      setIsVideoPaused(false);
      // Reset the timer only when answer is correct
      if (activityTimer.current) {
        clearTimeout(activityTimer.current);
      }
      activityTimer.current = setTimeout(() => {
        setShowActivityCheck(true);
      }, 10 * 1000);
      setMathProblem(generateMathProblem()); // Generate new problem for next time
      setUserAnswer(''); // Reset the answer input
    } else {
      toast.error('Incorrect answer. Please try again.');
      // Don't reset the timer if answer is wrong
    }
  };

  const memoizedResources = useMemo(() => 
    resources.map(resource => (
      <Link
        key={resource.id}
        href={resource.fileUrl}
        target="_blank"
        className="flex items-center bg-[#e3f1f1] rounded-lg text-sm font-medium p-3"
      >
        <File className="h-4 w-4 mr-4" />
        {resource.name}
      </Link>
    )),
    [resources]
  );

  return (
    <div className="px-6 py-4 flex flex-col gap-5">

      {isLocked ? (
        <div className="px-10 flex flex-col gap-5 items-center bg-[#e3f1f1]">
          <Lock className="h-12 w-12 m-5" />
          <p className="text-l font-bold mb-10">
            {course.price === 0
              ? "Video for this section is set to free Please click 'Enrol Now' to have access to the webinar"
              : "Video for this section is locked! Please buy the webinar to access"}
          </p>
        </div>
      ) : (
        <Suspense fallback={<div className="w-full max-w-[1000px] mx-auto aspect-video bg-gray-200 animate-pulse" />}>
          <MuxPlayer
            playbackId={muxData?.playbackId || ""}
            className="w-full max-w-[1000px] mx-auto"
            onEnded={handleSectionComplete}
            ref={playerRef}
            muted
            paused={isVideoPaused || isLocked}
          />
        </Suspense>
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
                <p>{section.isFree || course.price === 0 ? "Join Now" : `Buy for ${formatPrice(course.price || 0)}`}</p>
              )}
            </Button>
          ) : null}
        </div>
      </div>

      <ReadText value={section.description!} />

      {resources.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-5">Resources</h2>
          {memoizedResources}
        </div>
      )}

      {children}

      <Dialog open={showActivityCheck} onOpenChange={setShowActivityCheck}>
        <DialogContent 
          onInteractOutside={(e) => e.preventDefault()}
          className="sm:rounded-lg"
        >
          <DialogHeader>
            <DialogTitle>Are you still there?</DialogTitle>
          </DialogHeader>
          <p>We noticed you haven&apos;t been active for a while. Please solve this math problem to continue:</p>
          <div className="flex flex-col gap-4">
            <div className="text-center text-2xl font-bold">
              {mathProblem.problem} = ?
            </div>
            <Input
              type="number"
              value={userAnswer}
              onChange={(e) => debouncedSetUserAnswer(e.target.value)}
              placeholder="Your answer"
              className="text-center"
            />
          </div>
          <DialogFooter>
            <Button 
              onClick={handleContinue}
              disabled={!userAnswer}
              className="w-full"
            >
              Continue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SectionsDetails;
