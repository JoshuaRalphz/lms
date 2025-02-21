"use client";

import ReactConfetti from "react-confetti";
import { useConfettiStore } from "@/components/hooks/use-confetti-store";
import { useEffect, useState } from "react";

export const ConfettiProvider = ({ children }: { children: React.ReactNode }) => {
  const confetti = useConfettiStore();
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {confetti.isOpen && (
        <ReactConfetti
          className="pointer-events-none z-[100]"
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={1000}
          recycle={false}
          onConfettiComplete={confetti.onClose}
        />
      )}
      {children}
    </>
  );
};
