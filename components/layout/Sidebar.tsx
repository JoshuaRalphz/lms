"use client";

import { BarChart4, MonitorPlay } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import QuizIcon from '@mui/icons-material/Quiz';

const Sidebar = () => {
  const pathname = usePathname();

  // Return null for mobile screens
  if (typeof window !== 'undefined' && window.innerWidth < 640) {
    return null;
  }

  const sidebarRoutes = [
    { icon: <MonitorPlay />, label: "Course Creation", 
      path: "/instructor/courses" },
      {
        icon: <QuizIcon />,
        label: "Quiz Builder",
        path: "/instructor/quiz",
      },
    {
      icon: <BarChart4 />,
      label: "Statistics",
      path: "/instructor/analytics",
    },

  ];

  return (
    <div className="flex flex-col w-64 border-r shadow-md px-3 my-4 gap-4 text-sm font-medium">
      {sidebarRoutes.map((route) => (
        <Link
          href={route.path}
          key={route.path}
          className={`flex items-center gap-4 p-3 rounded-lg hover:bg-[#7886C7] ${
            pathname.startsWith(route.path) ? "bg-[#7886C7] text-[#F0FFFF]" : ""
          }`}
        >
          {route.icon} {route.label}
        </Link>
      ))}
    </div>
  );
};

export default Sidebar;
