"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { useConfettiStore } from "@/components/hooks/use-confetti-store";

interface PublishButtonProps {
  disabled: boolean;
  courseId: string;
  sectionId?: string;
  isPublished: boolean;
  page: string;
  onSuccess?: () => void;
}

const PublishButton = ({
  disabled,
  courseId,
  sectionId,
  isPublished,
  page,
  onSuccess,
}: PublishButtonProps) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const confetti = useConfettiStore();

  const onClick = async () => {
    let url = `/api/courses/${courseId}`;
    if (page === "Section") {
      url += `/sections/${sectionId}`;
    }

    try {
      setIsLoading(true);
      if (isPublished) {
        await axios.post(`${url}/unpublish`);
      } else {
        await axios.post(`${url}/publish`);
        confetti.onOpen();
      }

      toast.success(`${page} ${isPublished ? "unpublished" : "published"}`);
      router.refresh();
      onSuccess?.();
      
      // if (page === "Section") {
      //   router.push(`/instructor/courses/${courseId}/basic`);
      // } else if (page === "Course") {
      //   router.push("/instructor/courses");
      // }
    } catch (err) {
      toast.error("Something went wrong!");
      console.log(
        `Failed to ${isPublished ? "unpublish" : "publish"} ${page}`,
        err
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      disabled={disabled || isLoading}
      onClick={onClick}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : isPublished ? "Unpublish" : "Publish"}
    </Button>
  );
};

export default PublishButton;
