"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { toast } from '@/hooks/use-toast'

// Extend Window interface to include earnXP function
declare global {
  interface Window {
    earnXP?: (amount: number) => void;
  }
}

export function XpHandler() {
  const { data: session } = useSession()
  const [isInitialized, setIsInitialized] = useState(false)
  
  // Function to handle earning XP
  const handleXpEarned = async (amount: number) => {
    if (!session?.user?.id) return
    
    try {
      // Calculate new XP total and level
      const response = await fetch('/api/user/xp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
        }),
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Show toast notification
        if (data.leveledUp) {
          toast({
            title: `Level Up! 🎉`,
            description: `You've reached level ${data.newLevel}!`,
            variant: "default",
          })
        } else {
          toast({
            title: `+${amount} XP`,
            description: `Keep going! ${data.xpToNextLevel} XP until level ${data.nextLevel}`,
            variant: "default",
          })
        }
      }
    } catch (error) {
      console.error('Error updating XP:', error)
    }
  }
  
  // Set up global XP handler
  useEffect(() => {
    if (!isInitialized && typeof window !== 'undefined') {
      // Attach as global function for other components to access
      window.earnXP = handleXpEarned
      setIsInitialized(true)
    }
    
    return () => {
      // Clean up on unmount
      if (typeof window !== 'undefined') {
        window.earnXP = undefined
      }
    }
  }, [isInitialized, session])
  
  // This component doesn't render anything visible
  return null
} 