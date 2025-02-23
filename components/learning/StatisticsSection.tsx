"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ResponsiveContainer } from 'recharts';

interface StatisticsSectionProps {
  purchasedCoursesCount: number;
  takenQuizzesCount: number;
  completionRate: string;
  quizAverageScore?: string;
  chartData?: { name: string; value: number }[];
  children?: React.ReactNode;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const StatisticsSection = ({
  purchasedCoursesCount,
  takenQuizzesCount,
  completionRate,
  quizAverageScore = "0%",
  chartData = []
}: StatisticsSectionProps) => {
  const pieData = [
    { name: 'Courses Enrolled', value: purchasedCoursesCount },
    { name: 'Quizzes Taken', value: takenQuizzesCount },
    { name: 'Completion Rate', value: parseFloat(completionRate) },
    { name: 'Quiz Avg Score', value: parseFloat(quizAverageScore) }
  ];

  return (
    <section className="mb-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
          <h3 className="text-lg font-semibold text-gray-600">Courses Enrolled</h3>
          <p className="text-3xl font-bold mt-2 text-blue-600">{purchasedCoursesCount}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-green-50 to-teal-50">
          <h3 className="text-lg font-semibold text-gray-600">Quizzes Taken</h3>
          <p className="text-3xl font-bold mt-2 text-green-600">{takenQuizzesCount}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50">
          <h3 className="text-lg font-semibold text-gray-600">Completion Rate</h3>
          <p className="text-3xl font-bold mt-2 text-purple-600">{completionRate}</p>
        </Card>
        <Card className="p-6 bg-gradient-to-r from-orange-50 to-amber-50">
          <h3 className="text-lg font-semibold text-gray-600">Quiz Avg Score</h3>
          <p className="text-3xl font-bold mt-2 text-orange-600">{quizAverageScore}</p>
        </Card>
      </div>

      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-600 mb-4">Learning Progress</h3>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}; 