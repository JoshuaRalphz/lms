"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from "@/components/ui/card";

interface AnalyticsChartProps {
  data: any[];
  title: string;
  categories: string[];
  index: string;
}

const AnalyticsChart = ({ data, title, categories, index }: AnalyticsChartProps) => {
  if (!data || data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm text-gray-500">No data available</p>
      </Card>
    );
  }

  // Transform data for instructor-specific view
  const instructorData = data.map(activity => ({
    ...activity,
    type: activity.type === 'course_view' ? 'Course View' : 
          activity.type === 'section_completion' ? 'Section Completed' :
          activity.type === 'purchase' ? 'New Enrollment' : 
          activity.type === 'review' ? 'New Review' : activity.type,
    user: activity.user?.fullName || 'Anonymous',
    course: activity.course?.title || 'Unknown Course'
  }));

  return (
    <Card className="p-4">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={instructorData}>
            <XAxis 
              dataKey={index} 
              tick={{ fontSize: 12 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={75}
            />
            <YAxis />
            <Tooltip 
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;
                  return (
                    <div className="bg-white p-3 border rounded-lg shadow-sm">
                      <p className="font-semibold">{data.type}</p>
                      <p>Course: {data.course}</p>
                      <p>User: {data.user}</p>
                      {data.type === 'New Review' && (
                        <p>Rating: {data.metadata?.rating || 'N/A'}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        {new Date(data.createdAt).toLocaleString()}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {categories.map((category, index) => (
              <Line 
                key={index}
                type="monotone"
                dataKey={category}
                stroke="#3b82f6"
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
};

export default AnalyticsChart; 