"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card } from "@/components/ui/card";

interface RevenueData {
  name: string;
  total: number;
  sales: number;
  type: 'paid' | 'free';
  completionRate?: number; // Percentage of students who completed the course
  avgRating?: number; // Average course rating
  engagementScore?: number; // Based on section views and interactions
  refundRate?: number; // Percentage of refunds
  studentRetention?: number; // Percentage of students who continue to next course
}

interface RevenueChartProps {
  data: RevenueData[];
  title: string;
}

const calculatePerformanceScore = (course: RevenueData) => {
  const weights = {
    revenue: 0.3,
    sales: 0.2,
    completionRate: 0.2,
    avgRating: 0.15,
    engagementScore: 0.1,
    refundRate: -0.05
  };

  return Math.round(
    (course.total * weights.revenue) +
    (course.sales * weights.sales) +
    (course.completionRate?? 0 * weights.completionRate) +
    ((course.avgRating ?? 0) * weights.avgRating) +
    ((course.engagementScore ?? 0) * weights.engagementScore) +
    ((course.refundRate ?? 0) * weights.refundRate)
  );
};

export const RevenueChart = ({ data, title }: RevenueChartProps) => {
  const paidData = data.filter(item => item.type === 'paid');
  const freeData = data.filter(item => item.type === 'free');

  return (
    <Card className="p-6 mb-8">
      <h2 className="text-xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Paid Courses Bar Chart */}
        <div className="h-[400px]">
          <h3 className="text-lg font-semibold mb-2">Paid Courses</h3>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={paidData}>
              <XAxis 
                dataKey="name" 
                angle={-45} 
                textAnchor="end"
                height={75}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={(value) => `₱${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip />
              <Legend />
              <Bar 
                dataKey="total" 
                fill="#8884d8" 
                name="Revenue"
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="sales" 
                fill="#82ca9d" 
                name="Enrollments"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Free Courses Pie Chart */}
        <div className="h-[400px]">
          <h3 className="text-lg font-semibold mb-2">Free Courses</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={freeData}
                dataKey="sales"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={150}
                fill="#8884d8"
                label
              >
                {freeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={['#0088FE', '#00C49F', '#FFBB28', '#FF8042'][index % 4]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}; 