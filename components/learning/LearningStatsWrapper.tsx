"use client"

import { useLearningStats } from "./LearningStats";
import { StatisticsSection } from "./StatisticsSection";

interface LearningStatsWrapperProps {
  purchasedCourses: {
    id: string;
    sections: {
      progress: {
        isCompleted: boolean;
      }[];
    }[];
  }[];
  takenQuizzes: {
    score: number;
  }[];
}

export const LearningStatsWrapper = ({ purchasedCourses, takenQuizzes }: LearningStatsWrapperProps) => {
  const { completionRate, chartData, quizAverageScore } = useLearningStats({
    purchasedCourses,
    takenQuizzes
  });

  return (
    <StatisticsSection
      purchasedCoursesCount={purchasedCourses.length}
      takenQuizzesCount={takenQuizzes.length}
      completionRate={completionRate}
      quizAverageScore={quizAverageScore}
      chartData={chartData}
    >
      <div className="space-y-3 sm:space-y-4">
        {chartData.map((course, index) => (
          <div key={index} className="space-y-1 sm:space-y-2">
            <div className="flex justify-between text-xs sm:text-sm">
              <span>{course.name}</span>
              <span>{course.value}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2.5">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-1.5 sm:h-2.5 rounded-full transition-all duration-500" 
                style={{ width: `${course.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </StatisticsSection>
  );
}; 