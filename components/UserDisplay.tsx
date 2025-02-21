"use client";

import { UserResource } from "@clerk/types";
import { UserButton } from "@clerk/nextjs";
import { Skeleton } from "@/components/ui/skeleton";

interface UserDisplayProps {
  userId: string;
  showButton?: boolean;
}

export const UserDisplay = ({ userId, showButton = true }: UserDisplayProps) => {
  if (!userId) {
    return <Skeleton className="h-4 w-[100px]" />;
  }

  return (
    <div className="flex items-center gap-2">
      {showButton && <UserButton afterSignOutUrl="/" />}
      <span className="font-medium">
        <UserButton />
      </span>
    </div>
  );
}; 