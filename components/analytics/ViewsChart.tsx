"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card } from "@/components/ui/card";

interface ViewsChartProps {
  data: { name: string; value: number }[];
}

const COLORS = ['#0088FE', '#00C49F'];

export const ViewsChart = ({ data }: ViewsChartProps) => {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-bold mb-4">Course Views by Type</h2>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
}; 