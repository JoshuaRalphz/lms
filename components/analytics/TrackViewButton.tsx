"use client";

import { useEffect } from "react";
import { trackAnalytics } from "@/lib/analytics";

interface TrackViewButtonProps {
  courseId: string;
  userId?: string | null;
}

const TrackViewButton = ({ courseId, userId }: TrackViewButtonProps) => {
  useEffect(() => {
    const trackView = async () => {
      try {
        await trackAnalytics({
          type: 'course_view',
          userId: userId || undefined,
          courseId
        });
      } catch (error) {
        console.error('Error tracking view:', error);
      }
    };

    trackView();
  }, [courseId, userId]);

  return null;
};

export default TrackViewButton; 