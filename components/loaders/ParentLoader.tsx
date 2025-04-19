'use client';

import React, { useEffect, useState, useRef } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

interface ParentLoaderProps {
  fullscreen?: boolean;
  contained?: boolean;
  className?: string;
  minPlayCount?: number;
}

const ParentLoader = ({
  fullscreen = false,
  contained = false,
  className,
  minPlayCount = 1,
}: ParentLoaderProps) => {
  const [animationData, setAnimationData] = useState<any>(null);
  const [error, setError] = useState<boolean>(false);
  const [playCount, setPlayCount] = useState(0);
  const [canDismiss, setCanDismiss] = useState(false);
  const lottieRef = useRef<any>(null);
  const [isBrowser, setIsBrowser] = useState(false);
  
  // Check if we're in the browser
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  useEffect(() => {
    if (!isBrowser) return;
    
    const fetchAnimation = async () => {
      try {
        const response = await fetch('/lottie/PiggyLaugh.json');
        if (!response.ok) throw new Error('Failed to load animation');
        const data = await response.json();
        setAnimationData(data);
      } catch (err) {
        console.error('Error loading Lottie animation:', err);
        setError(true);
      }
    };

    fetchAnimation();
  }, [isBrowser]);

  // Monitor animation completion
  useEffect(() => {
    if (playCount >= minPlayCount) {
      setCanDismiss(true);
    }
  }, [playCount, minPlayCount]);

  const handleAnimationComplete = () => {
    setPlayCount(prev => prev + 1);
  };

  if (!isBrowser) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-background",
        fullscreen ? "fixed inset-0 z-50" : "w-full h-full",
        contained && "max-w-md max-h-md",
        className
      )}>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-background",
        fullscreen ? "fixed inset-0 z-50" : "w-full h-full",
        contained && "max-w-md max-h-md",
        className
      )}>
        <div className="text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!animationData) {
    return (
      <div className={cn(
        "flex items-center justify-center bg-background",
        fullscreen ? "fixed inset-0 z-50" : "w-full h-full",
        contained && "max-w-md max-h-md",
        className
      )}>
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center bg-background",
      fullscreen ? "fixed inset-0 z-50" : "w-full h-full",
      contained && "max-w-md max-h-md",
      className
    )}>
      <div className="max-w-xs w-full">
        <Lottie
          lottieRef={lottieRef}
          animationData={animationData}
          loop={!canDismiss}
          autoplay={true}
          onComplete={handleAnimationComplete}
          className="w-full h-full"
          style={{ maxWidth: '300px', margin: '0 auto' }}
        />
      </div>
    </div>
  );
};

export default ParentLoader; 