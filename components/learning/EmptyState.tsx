"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  message: string;
  buttonText: string;
  href: string;
}

export const EmptyState = ({ message, buttonText, href }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center gap-4 py-10">
      <p className="text-gray-500">{message}</p>
      <Link href={href}>
        <Button>{buttonText}</Button>
      </Link>
    </div>
  );
}; 