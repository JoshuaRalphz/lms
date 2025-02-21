"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Menu, User, BookOpen, LayoutDashboard, ClipboardList, BarChart2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import { Button } from "@/components/ui/button";
import { isTeacher } from "@/lib/teacher";

const Topbar = () => {
  const { isSignedIn, userId } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768); // 768px is typically the breakpoint for md in Tailwind
    };
    
    // Set initial value
    handleResize();
    
    // Add event listener
    window.addEventListener('resize', handleResize);
    
    // Cleanup
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (pathname === '/preference') {
    return null;
  }

  const isInstructorPage = isMobile && pathname?.startsWith("/instructor");

  const routes = isInstructorPage
    ? [
        { path: "/instructor/courses", label: "Course Creation", icon: <BookOpen className="h-4 w-4" /> },
        { path: "/instructor/quiz", label: "Assessment Creation", icon: <ClipboardList className="h-4 w-4" /> },
        { path: "/instructor/analytics", label: "Analytics", icon: <BarChart2Icon className="h-4 w-4" /> },
      ]
    : [
        { path: "/vid", label: "Courses", icon: <BookOpen className="h-4 w-4" /> },
        { path: "/quizzes", label: "Assessments", icon: <ClipboardList className="h-4 w-4" /> },
        { path: "/learning", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
      ];

  return (
    <div className="flex justify-between items-center p-4 shadow-lg">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Menu className="h-6 w-6" />
        </button>
        
        <Link href="/learning">
          <Image 
            src="/logo.png" 
            height={100} 
            width={200} 
            alt="logo" 
            className="w-32 md:w-40"
          />
        </Link>
        <div>
          
        {isTeacher(userId) && (
          pathname?.startsWith("/instructor") ? (
            <Link 
              href="/learning" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full flex items-center gap-2">
                <LayoutDashboard className="h-4 w-4" />
                Student View
              </Button>
            </Link>
          ) : (
            <Link 
              href="/instructor/courses" 
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Button variant="ghost" className="w-full flex items-center gap-2">
                <ClipboardList className="h-4 w-4" />
                Instructor
              </Button>
            </Link>
          )
        )}
        </div>

      </div>

      


      {/* Mobile Menu */}
      {isMobile && isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 bg-white z-50 p-4">
          <div className="flex justify-end mb-4">
            <button onClick={() => setIsMobileMenuOpen(false)}>
              <Menu className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            {routes.map((route) => (
              <Link 
                key={route.path} 
                href={route.path} 
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button variant="ghost" className="w-full flex items-center gap-2">
                  {route.icon}
                  {route.label}
                </Button>
              </Link>
            ))}

            {isSignedIn ? (
              <div className="flex justify-center">
                <UserButton />
              </div>
            ) : (
              <Link href="/sign-in" onClick={() => setIsMobileMenuOpen(false)}>
                <Button className="w-full flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden md:flex gap-6 items-center">
        {routes.map((route) => (
          <Link key={route.path} href={route.path}>
            <Button variant="ghost" className="flex items-center gap-2">
              {route.icon}
              {route.label}
            </Button>
          </Link>
        ))}

        {isSignedIn ? (
          <UserButton />
        ) : (
          <Link href="/sign-in">
            <Button className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Sign In
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
};

export default Topbar;
