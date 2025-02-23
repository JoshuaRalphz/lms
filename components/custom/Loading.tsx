"use client";

import { cn } from "@/lib/utils";

export const Loading = ({ className }: { className?: string }) => {
  return (
    <div className={cn("flex items-center justify-center h-full", className)}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600" />
    </div>
  );
}; 