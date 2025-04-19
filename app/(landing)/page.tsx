"use client"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useState, useCallback } from "react"
import LandingLoader from "@/components/loaders/LandingLoader"

export default function Home() {
  const [isLoading, setIsLoading] = useState(true)

  // Use useCallback to memoize the function
  const handleLoad = useCallback(() => {
    // Ensure the animation plays for at least 3 seconds before allowing it to complete
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000)

    return () => clearTimeout(timer)
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

  if (isLoading) {
    return <LandingLoader fullscreen minPlayCount={1} />
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
            <h1 className="text-4xl sm:text-5xl md:text-5xl lg:text-6xl font-bold mb-3 sm:mb-4">Know your financial personality</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
            Know Your Financial Personality: Discovering How Your Money Habits Shape Your Creditworthiness and Financial Future
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
              <div className="bg-[#BBF7D0] p-3 sm:p-4 md:p-5 rounded-lg shadow-md">
                <div className="flex flex-col">
                  <span className="text-xl sm:text-2xl md:text-2xl lg:text-3xl font-bold mb-2">Parent <br className="hidden xs:inline" /> Dashboard</span>
                  <span className="text-sm sm:text-base font-normal">Learn Finance, spending and saving techniques</span>
                </div>
              </div>
              <div className="bg-[#BBF7D0] p-3 sm:p-4 md:p-5 rounded-lg shadow-md">
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
          <h2 className="text-2xl sm:text-3xl font-bold">Know your file</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            The first step towards progress is knowing. It's why with Checkmyfile you get an independent, holistic view
            of your credit history. Because the fuller the picture, the better your progress.
          </p>
          <Link href="/read-our-story">
            <button className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">
              See what you get
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-orange-200 p-3 sm:p-4 md:p-5 rounded-lg">
            <h3 className="font-medium mb-2 text-base sm:text-lg">See where you've been</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Get a clear picture of your credit history from Experian, Equifax and TransUnion. Lenders view your credit
              history differently.
            </p>
            <div className="flex justify-center">
              <Image
                src="/.jpg?height=150&width=200"
                alt="Credit history chart"
                width={200}
                height={150}
                className="w-full max-w-[130px] sm:max-w-[170px] md:max-w-[200px]"
              />
            </div>
          </div>
          <div className="bg-blue-200 p-3 sm:p-4 md:p-5 rounded-lg">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Where you can improve</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Use our tools to identify any errors and take steps to improve your credit score.
            </p>
            <div className="flex justify-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Improvement chart"
                width={200}
                height={150}
                className="w-full max-w-[130px] sm:max-w-[170px] md:max-w-[200px]"
              />
            </div>
          </div>
          <div className="bg-yellow-100 p-3 sm:p-4 md:p-5 rounded-lg sm:col-span-2 md:col-span-1">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Where you're spending</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Track your spending patterns and see how lenders view your financial behavior.
            </p>
            <div className="bg-white rounded-lg p-2 flex justify-center">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Spending chart"
                width={200}
                height={150}
                className="w-full max-w-[130px] sm:max-w-[170px] md:max-w-[200px]"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-6 sm:mb-8">
          <span className="inline-block bg-black text-green-500 px-2 py-0.5 sm:px-2 sm:py-1 rounded text-xs sm:text-sm font-medium mb-2">
            STEP 2
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold">Grow your score</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto text-sm sm:text-base md:text-lg">
            With a clearer picture of your past, we can give you clear, actionable steps to focus on your present — and
            progress towards the future. And with daily updates, it's easier than you might think.
          </p>
          <Link href="/grow-your-score">
            <button className="mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">
              Make it happen
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5 md:gap-6">
          <div className="bg-pink-200 p-3 sm:p-4 md:p-5 rounded-lg">
            <h3 className="font-medium mb-2 text-base sm:text-lg">The full picture</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              See how your actions day to day affect your score, making it clearer the steps we'll guide you on.
            </p>
            <div className="bg-white rounded-lg p-2 text-center">
              <span className="text-2xl sm:text-3xl font-bold text-orange-500">762</span>
              <div className="text-xs mt-1">A-B | Excellent credit score</div>
            </div>
          </div>
          <div className="bg-blue-200 p-3 sm:p-4 md:p-5 rounded-lg">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Up, up and honey</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              We'll help you understand how to get you where you want to go, and celebrate the little wins along the
              way.
            </p>
            <div className="space-y-2">
              <div className="bg-white rounded-lg p-1 text-start">
                <div className="text-green-700 font-medium text-xs sm:text-sm">Confirmed on Electoral Roll</div>
              </div>
              <div className="bg-white rounded-lg p-1 text-start">
                <div className="text-green-700 font-medium text-xs sm:text-sm">Confirmed on Electoral Roll</div>
              </div>
            </div>
          </div>
          <div className="bg-green-200 p-3 sm:p-4 md:p-5 rounded-lg sm:col-span-2 md:col-span-1">
            <h3 className="font-medium mb-2 text-base sm:text-lg">Habits for a lifetime</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">
              Our recommendations help you form the habits you need to keep your score high over time.
            </p>
            <div className="bg-white rounded-lg p-2">
              <ul className="text-xs sm:text-sm space-y-2">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-700 rounded-full mr-2"></span>
                  <span>Pay bills on time</span>
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-700 rounded-full mr-2"></span>
                  <span>Keep credit utilization low</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Meet the Advancers</h2>
        <p className="text-center text-gray-600 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg">Thousands have already taken control of their credit health.</p>

        <div className="relative max-w-xl mx-auto">
          <div className="bg-pink-200 p-3 sm:p-4 md:p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 md:gap-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-2">Rupert</h3>
                <p className="text-xs sm:text-sm">
                  <span className="font-bold">clearscorelife</span> was an absolute breeze. I was very apprehensive,
                  very cautious about giving my details out. It was really helpful, it gave me a good idea of where I
                  was financially and if there was anything suspicious lurking in my credit history. I love Rupert.
                </p>
              </div>
              <div className="relative h-28 sm:h-36 md:h-40">
                <Image
                  src="/placeholder.svg?height=160&width=200"
                  alt="Rupert testimonial"
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>
          </div>

          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-3 sm:-translate-x-6 md:-translate-x-10 bg-white rounded-full p-1 sm:p-2 shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-3 sm:translate-x-6 md:translate-x-10 bg-white rounded-full p-1 sm:p-2 shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-green-200 p-3 sm:p-4 md:p-6 lg:p-8 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-bold mb-2">See us as your score support</h2>
            <p className="text-gray-600 mb-4 sm:mb-5 md:mb-6 text-sm sm:text-base md:text-lg">
              We don't just stick to the shadows. With your subscription, if you ever need a hand, we're here to help.
              Just make sure you're not withdrawing that easy more achievable.
            </p>
          </div>
          <div className="relative h-40 sm:h-48 md:h-56 lg:h-64 flex justify-center items-center">
            <Image
              src="/placeholder.svg?height=256&width=400"
              alt="Support illustration"
              width={300}
              height={192}
              className="object-contain max-w-full h-auto"
            />
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 bg-purple-50 overflow-hidden">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-4 sm:mb-6">Every day score impactors</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Court Information</h3>
              <div className="mx-auto relative h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24">
                <Image
                  src="/placeholder.svg?height=128&width=128"
                  alt="Court information"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Searches</h3>
              <div className="mx-auto relative h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24">
                <Image 
                  src="/placeholder.svg?height=128&width=128" 
                  alt="Searches" 
                  fill 
                  className="object-contain" 
                />
              </div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Account Status</h3>
              <div className="mx-auto relative h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24">
                <Image
                  src="/placeholder.svg?height=128&width=128"
                  alt="Account status"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
            <div className="border border-gray-200 bg-white rounded-lg p-2 sm:p-3 md:p-4 text-center">
              <h3 className="font-medium text-xs sm:text-sm mb-1 sm:mb-2">Credit Usage</h3>
              <div className="mx-auto relative h-16 sm:h-20 md:h-24 w-16 sm:w-20 md:w-24">
                <Image 
                  src="/placeholder.svg?height=128&width=128" 
                  alt="Credit usage" 
                  fill 
                  className="object-contain" 
                />
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
                "Using Piggywise has been life changing for me. I was able to improve my credit score by 85 points in just
                3 months by following their recommendations."
              </p>
              <p className="text-xs sm:text-sm">Sarah from London • 3 months ago</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12">
        <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Practice makes perfect</h2>
            <Link href="/grow-your-score">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">Get started</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

