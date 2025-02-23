"use client";

import { SaveNameForm } from "./SaveNameForm";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CourseCard from "@/components/courses/CourseCard";
import Link from "next/link";

interface Course {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  instructorId: string;
  categoryId: string;
  sections: any[];
  Review: any[];
  purchases: any[];
  level: { name: string } | null;
  category: { name: string };
  price: number | null;
  subtitle?: string | null;
  isPublished: boolean;
  isFree: boolean;
  courseAnalytics: any | null;
  totalReviews: number | null;
  courseAnalyticsid?: string | null;
  views?: number | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
  avgRating?: number | null;
}

export const CourseCompletion = ({ courseId }: { courseId: string }) => {
  const { user } = useUser();
  const [nameSaved, setNameSaved] = useState(false);
  const [hasPurchase, setHasPurchase] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [similarCourses, setSimilarCourses] = useState<Course[]>([]);
  const [showSimilarCourses, setShowSimilarCourses] = useState(false);

  useEffect(() => {
    const checkPurchase = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/check-purchase`);
        setHasPurchase(response.data.hasPurchase);
      } catch (error) {
        console.error("Error checking purchase:", error);
      }
    };
    checkPurchase();
  }, [courseId]);

  useEffect(() => {
    const fetchSimilarCourses = async () => {
      try {
        const response = await axios.get(`/api/courses/${courseId}/similar`);
        setSimilarCourses(response.data);
        setShowSimilarCourses(true);
      } catch (error) {
        console.error("Error fetching similar courses:", error);
      }
    };
    
    const fetchData = async () => {
      await fetchSimilarCourses();
      // other logic
    };
    fetchData();
  }, [courseId]);

  if (!user || !hasPurchase) return null;

  return (
    <>
      <SaveNameForm 
        userId={user?.id}
        courseId={courseId}
        onSave={() => setNameSaved(true)}
      />

      <Dialog open={showSimilarCourses} onOpenChange={setShowSimilarCourses}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Congratulations! Here are some similar courses you might like</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {similarCourses.map((course) => (
              <Link 
                key={course.id} 
                href={`/courses/${course.id}/overview`}
                className="hover:shadow-lg transition-shadow"
              >
                <div className="h-full border rounded-lg overflow-hidden">
                  <CourseCard 
                    course={{
                      ...course,
                      title: course.title.length > 50 ? `${course.title.substring(0, 50)}...` : course.title,
                      description: course.description || null,
                      imageUrl: course.imageUrl || null,
                      subtitle: course.subtitle || null,
                      isPublished: true,
                      isFree: false,
                      courseAnalytics: undefined,
                      totalReviews: course.Review?.length || null,
                      courseAnalyticsid: course.courseAnalyticsid || null,
                      views: course.views || 0,
                      createdAt: course.createdAt || new Date(),
                      updatedAt: course.updatedAt || new Date(),
                      avgRating: course.avgRating || 0
                    }} 
                  />
                </div>
              </Link>
            ))}
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowSimilarCourses(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};