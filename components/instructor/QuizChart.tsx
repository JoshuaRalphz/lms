"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface QuizChartProps {
  data: Array<{
    name: string;
    attempts: number;
    averageScore: number;
  }>;
  title: string;
}

export const QuizChart = ({ data, title }: QuizChartProps) => {
  return (
    <div className="h-96">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="attempts" fill="#8884d8" name="Attempts" />
          <Bar dataKey="averageScore" fill="#82ca9d" name="Avg Score (%)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}; 