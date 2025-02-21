import AnalyticsChart from "./AnalyticsChart";
import {RevenueChart} from "../instructor/RevenueChart";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { ViewsChart } from "./ViewsChart";

interface AnalyticsDashboardProps {
  data: {
    courseAnalytics: { views: number }[];
    performanceData: any[];
    recentActivity: any[];
    totalRevenue: number;
    paidRevenue: number;
    freeCoursesCount: number;
    totalSales: number;
    totalReviews: number;
    avgReviewsPerCourse: string | number;
    viewsData: { name: string; value: number }[];
  };
}

const AnalyticsDashboard = ({ data }: AnalyticsDashboardProps) => {
  return (
    <div className="space-y-4 p-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Views</h3>
          <p className="text-3xl font-bold text-blue-600">
            {data.courseAnalytics.reduce((sum, course) => sum + course.views, 0).toLocaleString()}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Revenue</h3>
          <p className="text-3xl font-bold text-green-600">
            ₱{data.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Total Courses</h3>
          <p className="text-3xl font-bold text-orange-600">
            {data.courseAnalytics.length}
          </p>
        </div>
        <div className="p-6 bg-white rounded-lg shadow">
          <h3 className="text-lg font-semibold">Course Avg Reviews</h3>
          <p className="text-3xl font-bold text-indigo-600">
            {data.avgReviewsPerCourse}
          </p>
        </div>
      </div>

      <RevenueChart 
        data={data.performanceData}
        title="Course Revenue Breakdown"
      />

      <AnalyticsChart 
        data={data.courseAnalytics} 
        title="Course Views" 
        categories={["views"]} 
        index="title"
      />
      
 

      <ViewsChart data={data.viewsData} />

      <AnalyticsChart 
        data={data.recentActivity} 
        title="Recent Activity" 
        categories={["count"]} 
        index="type"
      />

    </div>
  );
};

export default AnalyticsDashboard;