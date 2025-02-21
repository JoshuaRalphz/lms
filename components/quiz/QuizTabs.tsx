"use client";

import { Tabs } from "antd";
import QuizCard from "@/components/quiz/QuizCard";
import { Card } from "antd";

const { TabPane } = Tabs;

interface QuizTabsProps {
  quizzes: any[];
  mostParticipated: any[];
  recentlyCreated: any[];
  topRatedQuizzes: any[];
  quizzesByCategory: Record<string, any[]>;
}

export const QuizTabs = ({
  quizzes,
  mostParticipated,
  recentlyCreated,
  topRatedQuizzes,
  quizzesByCategory,
}: QuizTabsProps) => {
  return (
    <Tabs defaultActiveKey="all">
      <TabPane tab="All Quizzes" key="all">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz) => (
            <QuizCard 
              key={quiz.id} 
              quiz={{
                ...quiz,
                description: quiz.description || "",
                categoryId: quiz.category?.id
              }} 
            />
          ))}
        </div>
      </TabPane>
      {/* Add other TabPane components here */}
    </Tabs>
  );
}; 