"use client"

import { useMemo } from "react";

interface LearningStatsProps {
  purchasedCourses: any[];
  takenQuizzes: any[];
}

export const useLearningStats = ({ purchasedCourses, takenQuizzes }: LearningStatsProps) => {
  const completionRate = useMemo(() => {
    if (purchasedCourses.length > 0) {
      const completedCourses = purchasedCourses.filter(course => {
        const completed = course.sections?.filter((s: { progress: any[] }) => 
          s.progress?.some((p: { isCompleted: boolean }) => p.isCompleted)
        ).length || 0;
        const total = course.sections?.length || 0;
        return completed === total;
      }).length;
      return `${Math.round((completedCourses / purchasedCourses.length) * 100)}%`;
    }
    return '0%';
  }, [purchasedCourses]);

  const chartData = useMemo(() => {
    return purchasedCourses.map((course, index) => {
      const completed = course.sections?.filter((s: { progress: any[] }) => 
        s.progress?.some((p: { isCompleted: boolean }) => p.isCompleted)
      ).length || 0;
      const total = course.sections?.length || 0;
      const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
      
      return {
        name: `Course ${index + 1}`,
        value: progress
      };
    });
  }, [purchasedCourses]);

  const quizAverageScore = useMemo(() => {
    const quizScores = takenQuizzes.map(quiz => quiz.score);
    return quizScores.length > 0 
      ? `${Math.round((quizScores.reduce((a, b) => a + b, 0) / quizScores.length) * 100)}%`
      : '0%';
  }, [takenQuizzes]);

  return {
    completionRate,
    chartData,
    quizAverageScore
  };
}; 