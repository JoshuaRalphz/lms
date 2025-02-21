"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    // Check if the browser supports the beforeinstallprompt event
    if (typeof window !== 'undefined' && 'beforeinstallprompt' in window) {
      window.addEventListener('beforeinstallprompt', handler);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeinstallprompt', handler);
      }
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      console.log("No deferred prompt available");
      return;
    }

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log("User accepted the install prompt");
      } else {
        console.log("User dismissed the install prompt");
      }
      
      setDeferredPrompt(null);
      setIsVisible(false);
    } catch (error) {
      console.error("Error during installation:", error);
    }
  };

  // Only show the button if the prompt is available
  if (!isVisible) return null;

  return (
    <Button 
      onClick={handleInstallClick} 
      className="fixed bottom-4 right-4"
    >
      Install App
    </Button>
  );
}; 