"use client";

import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";

import { Button } from "@/components/ui/button";
import { CheckCircle, Loader2 } from "lucide-react";
import { useConfettiStore } from "@/components/hooks/use-confetti-store";

interface ProgressButtonProps {
  courseId: string;
  sectionId: string;
  isCompleted: boolean;
  progressPercentage: number;
  totalSections: number;
  onComplete?: () => void;
}

const ProgressButton = ({
  courseId,
  sectionId,
  isCompleted,
  progressPercentage,
  totalSections,
  onComplete,
}: ProgressButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const confetti = useConfettiStore();

  const onClick = async () => {
    try {
      setIsLoading(true);
      const newCompletionStatus = !isCompleted;
      await axios.post(`/api/courses/${courseId}/sections/${sectionId}/progress`, {
        isCompleted: newCompletionStatus,
      });

      // These should happen regardless of completion status
      router.refresh();
      
      if (newCompletionStatus) {
        const newProgress = ((progressPercentage * totalSections / 100) + 1) / totalSections * 100;
        if (newProgress >= 100) {
          confetti.onOpen();
          setTimeout(() => router.push(`/courses/${courseId}/overview`), 300);
        } else {
          onComplete?.();
        }
      }
      
      toast.success("Progress updated!");
    } catch (err) {
      console.log("Failed to update progress", err);
      toast.error("Something went wrong!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button variant={isCompleted ? "complete" : "default"} onClick={onClick}>
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isCompleted ? (
        <div className="flex items-center">
          <CheckCircle className="h-4 w-4 mr-2" />
          <span>Completed</span>
        </div>
      ) : (
        "Mark as complete"
      )}
    </Button>
  );
};

export default ProgressButton;
