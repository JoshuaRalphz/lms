"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { Menu, User, BookOpen, LayoutDashboard, ClipboardList, BarChart2Icon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useMemo, useCallback } from "react";

import { Button } from "@/components/ui/button";
import { isTeacher } from "@/lib/teacher";

const MOBILE_BREAKPOINT = 768;

const Topbar = () => {
  const { isSignedIn, userId } = useAuth();
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const isInstructorPage = useMemo(() => 
    isMobile && pathname?.startsWith("/instructor")
  , [isMobile, pathname]);

  const routes = useMemo(() => 
    isInstructorPage
      ? [
          { path: "/instructor/courses", label: "Webinar Creation", icon: <BookOpen className="h-4 w-4" /> },
          { path: "/instructor/quiz", label: "Assessment Creation", icon: <ClipboardList className="h-4 w-4" /> },
          { path: "/instructor/analytics", label: "Webinar Analytics", icon: <BarChart2Icon className="h-4 w-4" /> },
        ]
      : [
          { path: "/vid", label: "Webinar", icon: <BookOpen className="h-4 w-4" /> },
          { path: "/quizzes", label: "Assessments", icon: <ClipboardList className="h-4 w-4" /> },
          { path: "/learning", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
        ]
  , [isInstructorPage]);

  const toggleMobileMenu = useCallback(() => 
    setIsMobileMenuOpen(prev => !prev)
  , []);

  const closeMobileMenu = useCallback(() => 
    setIsMobileMenuOpen(false)
  , []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (pathname === '/preference') {
    return null;
  }

  return (
    <div className="flex justify-between items-center p-4 shadow-lg">
      <div className="flex items-center gap-4">
        <button 
          className="md:hidden"
          onClick={toggleMobileMenu}
          aria-label="Toggle menu"
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
            priority
          />
        </Link>

        {isTeacher(userId) && (
          <div>
            {pathname?.startsWith("/instructor") ? (
              <Link href="/learning" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Participants View
                </Button>
              </Link>
            ) : (
              <Link href="/instructor/courses" onClick={closeMobileMenu}>
                <Button variant="ghost" className="w-full flex items-center gap-2">
                  <ClipboardList className="h-4 w-4" />
                  Upload
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>

      <div className={`md:hidden fixed inset-0 bg-white z-50 p-4 transition-transform duration-300 ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex justify-end mb-4">
          <button onClick={closeMobileMenu} aria-label="Close menu">
            <Menu className="h-6 w-6" />
          </button>
        </div>
        
        <div className="flex flex-col gap-4">
          {routes.map((route) => (
            <Link 
              key={route.path} 
              href={route.path} 
              onClick={closeMobileMenu}
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
            <Link href="/sign-in" onClick={closeMobileMenu}>
              <Button className="w-full flex items-center gap-2">
                <User className="h-4 w-4" />
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>

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
