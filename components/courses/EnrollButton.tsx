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
  isInstructor
}: EnrollButtonProps) => {
  const router = useRouter();

  const handleClick = async () => {
    try {
      const response = await axios.post(`/api/courses/${courseId}/checkout`);
      window.location.assign(response.data.url);
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.error("Failed to initiate purchase");
      router.refresh();
    }
  };

  return (
    <Button onClick={handleClick}>
      {price === 0 ? "Join Now" : ` ${price === 0 ? 'Free' : `Buy for ₱ ${price}`}`}
    </Button>
  );
}; 