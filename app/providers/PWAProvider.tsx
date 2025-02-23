"use client"

import { useEffect } from 'react'

export const PWAProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered: ', registration);
        })
        .catch(error => {
          console.log('Service Worker registration failed: ', error);
        });
    }
  }, []);

  return <>{children}</>
} 