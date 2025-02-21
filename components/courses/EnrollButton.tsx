"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface EnrollButtonProps {
  courseId: string;
  price: number;
  isInstructor: boolean;
  className?: string;
}

export const EnrollButton = ({
  courseId,
  price,
  isInstructor,
  className
}: EnrollButtonProps) => {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      
      if (response.data?.url) {
        window.location.assign(response.data.url);
      } else {
        throw new Error('No URL returned from checkout');
      }
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.error("Failed to initiate purchase");
      router.refresh();
    }
  };

  return (
    <Button onClick={handleClick} className={className}>
      {price === 0 ? "Enroll Now" : `Buy for ₱${price}`}
    </Button>
  );
}; 