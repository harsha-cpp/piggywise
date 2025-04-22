"use client"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import dynamic from "next/dynamic"

// Import LandingLoader with SSR disabled to prevent document issues
const LandingLoader = dynamic(
  () => import("@/components/loaders/LandingLoader"),
  { ssr: false }
)

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)
  const [isMounted, setIsMounted] = useState(false)

  // Use useCallback to memoize the function
  const handleLoad = useCallback(() => {
    // Ensure the animation plays for at least 3 seconds before allowing it to complete
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  // Add a mounting effect to handle client-side only rendering
  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    // Call the memoized function
    const cleanupLoad = handleLoad();
    
    // Handle chunk loading errors to prevent showing them to the user
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      // Check if this is a chunk loading error
      if (event.reason && event.reason.message && 
          (event.reason.message.includes('Loading chunk') || 
           event.reason.message.includes('Failed to fetch'))) {
        // Prevent the error from showing in console
        event.preventDefault();
      }
    };
    
    // Define beforeunload handler
    const handleBeforeUnload = () => {
      // This helps prevent chunk errors by cleaning up resources
      // before navigating away from the page
    };
    
    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      // Clean up all event listeners and timers
      if (cleanupLoad) cleanupLoad();
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [handleLoad])

  // Show loading state before content is ready
  if (!isMounted || isLoading) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <LandingLoader fullscreen minPlayCount={1} />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      {/* Chatbot Button with Glassmorphism */}
      <div className="fixed bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 group">
        <button className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-white border-opacity-15 shadow-lg flex items-center justify-center hover:bg-opacity-30 active:scale-95 active:shadow-md transition-all duration-200">
          <span className="text-2xl sm:text-3xl md:text-4xl" role="img" aria-label="Pig">🐷</span>
        </button>
        <div className="absolute bottom-14 sm:bottom-20 md:bottom-24 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-40 backdrop-filter backdrop-blur-md rounded-lg px-3 py-1.5 sm:px-4 sm:py-2 shadow-md">
          <p className="text-xs sm:text-sm md:text-base whitespace-nowrap">Login to use me :)</p>
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white bg-opacity-40 backdrop-filter backdrop-blur-md transform rotate-45"></div>
        </div>
      </div>
      
      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          <div className="md:pr-6">
            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Wealth is built on habits.</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg max-w-2xl">
              Does your child have the right ones?
            </p>
            <Link href="/login">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">Check out</button>
            </Link>
          </div>
          <div className="flex justify-center md:justify-end mt-4 sm:mt-6 md:mt-0">
            <div className="relative h-44 sm:h-52 md:h-60 lg:h-64 w-full max-w-xs sm:max-w-sm">
              <Image
                src="/finance1.png?height=320&width=400"
                alt="Credit score progress"
                fill
                className="object-contain"
                style={{ objectPosition: "center" }}
                priority
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-[#fdf2ed] rounded-xl mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="px-4 sm:px-6 md:px-8 lg:px-12">
          <div className="grid sm:grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
            <div className="md:pr-6">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Take control of your kid's financial future</h2>
              <p className="text-gray-600 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg">
                Help your children understand money management from an early age, <span className="hidden sm:inline"><br /></span> Guide them towards financial literacy and independence for a secure tomorrow.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div className="bg-[#BBF7D0] p-3 sm:p-4 md:p-5 rounded-lg shadow-md group relative">
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-[350px] h-[220px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 mb-2 rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src="/Parentdashboard.jpeg"
                    alt="Parent Dashboard Preview"
                    fill
                    className="object-contain bg-white p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2">Parent <br className="hidden xs:inline" /> Dashboard</span>
                  <span className="text-sm sm:text-base font-normal">Learn Finance, spending and saving techniques</span>
                </div>
              </div>
              <div className="bg-[#BBF7D0] p-3 sm:p-4 md:p-5 rounded-lg shadow-md group relative">
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-[350px] h-[220px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20 mb-2 rounded-lg overflow-hidden shadow-xl">
                  <Image
                    src="/childdashboard.jpeg"
                    alt="Student Dashboard Preview"
                    fill
                    className="object-contain bg-white p-1"
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2">Student Dashboard</span>
                  <span className="text-sm sm:text-base font-normal">Learn Finance, spending and saving techniques</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-block bg-black text-green-100 px-2 py-0.5 sm:px-3 sm:py-1 rounded text-xs sm:text-sm font-medium mb-2">NEW</span>
          <h2 className="text-2xl sm:text-3xl font-bold">How Piggywise Works</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            Our step-by-step approach makes financial education engaging and effective for learners of all ages.
            Start your journey to financial confidence today.
          </p>
          <Link href="/read-our-story">
            <button className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">
              See what you get
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-orange-200 p-3 sm:p-4 md:p-5 rounded-lg flex flex-col">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Learn from Modules</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex-grow">
              Engage with bite-sized, easy-to-understand modules that break down complex financial concepts into relatable lessons. Each module is designed to build your knowledge step-by-step, at your own pace.
            </p>
            <div className="flex justify-center items-center mt-auto mb-1">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg w-[200px] h-[120px] flex items-center justify-center transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-blue-200 p-3 sm:p-4 md:p-5 rounded-lg flex flex-col">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Take Quizzes</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex-grow">
              Reinforce your learning with interactive quizzes that help test your understanding and track your progress. Quizzes make learning fun while giving you instant feedback.
            </p>
            <div className="flex justify-center items-center mt-auto mb-1">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg w-[200px] h-[120px] flex items-center justify-center transform">
                <svg width="60" height="60" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="50" cy="50" r="45" stroke="white" strokeWidth="6"/>
                  <path d="M50 75V75.5" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M50 25C55 25 63 30 63 38C63 43 60 46 57 48C54 50 50 52 50 58" stroke="white" strokeWidth="10" strokeLinecap="round"/>
                </svg>
              </div>
            </div>
          </div>
          <div className="bg-yellow-100 p-3 sm:p-4 md:p-5 rounded-lg sm:col-span-2 md:col-span-1 flex flex-col">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Do Tasks</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 flex-grow">
              Apply what you've learned through real-life inspired tasks that build practical money habits. These hands-on activities turn theory into everyday action, helping you grow financially confident.
            </p>
            <div className="flex justify-center items-center mt-auto mb-1">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg w-[200px] h-[120px] flex items-center justify-center transform">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-purple-50 overflow-hidden">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">What makes piggywise impactful?</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Modules</h3>
              <div className="mx-auto flex justify-center items-center h-16 sm:h-20 md:h-24">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
                </svg>
              </div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Tasks</h3>
              <div className="mx-auto flex justify-center items-center h-16 sm:h-20 md:h-24">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-green-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z"></path>
                  <path d="M8 12h8"></path>
                  <path d="M12 8v8"></path>
                </svg>
              </div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Quizzes</h3>
              <div className="mx-auto flex justify-center items-center h-16 sm:h-20 md:h-24">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                  <line x1="12" y1="17" x2="12.01" y2="17"></line>
                </svg>
              </div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Progress</h3>
              <div className="mx-auto flex justify-center items-center h-16 sm:h-20 md:h-24">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-pink-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 3v18h18"></path>
                  <path d="m19 9-5 5-4-4-3 3"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="bg-green-800 p-4 sm:p-8 rounded-lg text-center text-white">
            <div className="max-w-3xl mx-auto">
              <p className="text-xs sm:text-sm mb-1 sm:mb-2">★★★★★</p>
              <p className="italic mb-3 sm:mb-4 text-sm sm:text-base md:text-lg">
                "Piggywise has transformed my child's understanding of money. My 10-year-old has started saving 30% of her pocket money every week and even created her own budget tracker! The interactive lessons really made financial concepts fun for her."
              </p>
              <p className="text-xs sm:text-sm">Priya from Mumbai • 1 months ago</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Practice makes perfect</h2>
            <Link href="/signup">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">Get started</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}


