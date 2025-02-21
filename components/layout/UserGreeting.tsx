"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useState, useMemo } from "react";

export const UserGreeting = () => {
  const { user } = useUser();
  const [displayText, setDisplayText] = useState("");
  
  const fullName = useMemo(() => {
    return user && (user.firstName || user.lastName) 
      ? `${user.firstName || ""} ${user.lastName || ""}`.trim() 
      : "User";
  }, [user]);

  const greeting = useMemo(() => `Welcome back, ${fullName}! 👋`, [fullName]);

  let typingSpeed = 150;

  useEffect(() => {
    let currentIndex = 0;
    let timeoutId: NodeJS.Timeout;

    const typeText = () => {
      if (currentIndex <= greeting.length) {
        setDisplayText(greeting.slice(0, currentIndex));
        currentIndex++;
        timeoutId = setTimeout(typeText, typingSpeed);
      }
    };

    timeoutId = setTimeout(typeText, 500);

    return () => clearTimeout(timeoutId);
  }, [greeting, typingSpeed]);

  return (
    <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
      {displayText}
      <span className="cursor-blink">|</span>
      <style jsx>{`
        @keyframes blink {
          50% { opacity: 0; }
        }
        .cursor-blink {
          animation: blink 1s step-end infinite;
        }
      `}</style>
    </h1>
  );
};
