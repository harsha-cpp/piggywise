'use client';

import React, { useEffect, useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

// Dynamically import Lottie with SSR disabled
const Lottie = dynamic(() => import('lottie-react'), { ssr: false });

interface LandingLoaderProps {
  fullscreen?: boolean;
  contained?: boolean;
  className?: string;
  minPlayCount?: number;
}

const LandingLoader = ({
  fullscreen = false,
  contained = false,
  className,
  minPlayCount = 1,
}: LandingLoaderProps) => {
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
        const response = await fetch('/lottie/Piggybank.json');
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

  // Empty div for server-side rendering or when animation is loading
  if (!isBrowser || error || !animationData) {
    return (
      <div className={cn(
        "bg-background",
        fullscreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[400px]",
        className
      )}></div>
    );
  }

  return (
    <div className={cn(
      "flex items-center justify-center bg-background",
      fullscreen ? "fixed inset-0 z-50" : "w-full h-full min-h-[400px]",
      className
    )}>
      <div className="w-full" style={{ maxWidth: '300px' }}>
        {isBrowser && animationData && (
          <Lottie
            lottieRef={lottieRef}
            animationData={animationData}
            loop={!canDismiss}
            autoplay={true}
            onComplete={handleAnimationComplete}
            className="w-full h-full"
          />
        )}
      </div>
    </div>
  );
};

export default LandingLoader;
