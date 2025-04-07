"use client"
import Link from "next/link"
import Image from "next/image"

export default function Home() {
  return (
    <div className="container mx-auto px-4">
      {/* Chatbot Button with Glassmorphism */}
      <div className="fixed bottom-6 right-6 z-50 group">
        <button className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg border border-white border-opacity-15 shadow-lg flex items-center justify-center hover:bg-opacity-30 active:scale-95 active:shadow-md transition-all duration-200">
          <span className="text-3xl md:text-4xl" role="img" aria-label="Pig">🐷</span>
        </button>
        <div className="absolute bottom-20 md:bottom-24 right-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-40 backdrop-filter backdrop-blur-md rounded-lg px-4 py-2 shadow-md">
          <p className="text-sm md:text-base whitespace-nowrap">Login to use me :)</p>
          <div className="absolute -bottom-2 right-6 w-3 h-3 bg-white bg-opacity-40 backdrop-filter backdrop-blur-md transform rotate-45"></div>
        </div>
      </div>
      
      <section className="py-12 mx-8 md:mx-16">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-6xl font-bold mb-4">Know your financial personality</h1>
            <p className="text-gray-600 mb-6">
            Know Your Financial Personality: Discovering How Your Money Habits Shape Your Creditworthiness and Financial Future
            </p>
            <Link href="/login">
              <button className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900">Check out</button>
            </Link>
          </div>
          <div className="flex justify-end">
            <div className="relative h-64 md:h-80 w-full">
              <Image
                src="/finance1.png?height=320&width=400"
                alt="Credit score progress"
                fill
                className="object-contain translate-x-[20px] -translate-y-[30px]"
                style={{ objectPosition: "right" }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#fdf2ed] rounded-xl mx-8 md:mx-16">
      <div className="px-15 md:px-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-4">Take control of your kid's financial future</h2>
            <p className="text-gray-600 mb-6">
            Help your children understand money management from an early age, <br /> Guide them towards financial literacy and independence for a secure tomorrow.
            </p>
            
          </div>
          <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#BBF7D0] p-4 rounded-lg shadow-md">
              <div className="flex flex-col">
                <span className="text-3xl font-bold mb-2">Parent <br /> Dashboard</span>
                <span className="text-l font-normal">Learn Finance, spending and saving techniques</span>
              </div>
            </div>
          <div className="bg-[#BBF7D0] p-4 rounded-lg shadow-md">
              <div className="flex flex-col">
                <span className="text-3xl font-bold mb-2">Student Dashboard</span>
                <span className="text-l font-normal">Learn Finance, spending and saving techniques</span>
              </div>
            </div>
          </div>
        </div>
        </div>
      </section>

      <section className="py-12 mx-8 md:mx-16">
        <div className="text-center mb-8">
          <span className="inline-block bg-black text-green-100 px-3 py-1 rounded text-sm font-medium mb-2">NEW</span>
          <h2 className="text-3xl font-bold">Know your file</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            The first step towards progress is knowing. It's why with Checkmyfile you get an independent, holistic view
            of your credit history. Because the fuller the picture, the better your progress.
          </p>
          <Link href="/read-our-story">
            <button className="mt-4 px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900">
              See what you get
            </button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-orange-200 p-2 rounded-lg">
            <h3 className="font-medium mb-2">See where you've been</h3>
            <p className="text-sm text-gray-600 mb-4">
              Get a clear picture of your credit history from Experian, Equifax and TransUnion. Lenders view your credit
              history differently.
            </p>
              <Image
                src="/.jpg?height=150&width=200"
                alt="Credit history chart"
                width={200}
                height={150}
                className="mx-auto"
              />
          </div>
          <div className="bg-blue-200 p-6 rounded-lg ">
            <h3 className="font-medium mb-2">Where you can improve</h3>
            <p className="text-sm text-gray-600 mb-4">
              Use our tools to identify any errors and take steps to improve your credit score.
            </p>
            <Image
              src="/placeholder.svg?height=150&width=200"
              alt="Improvement chart"
              width={200}
              height={150}
              className="mx-auto"
            />
          </div>
          <div className="bg-yellow-100 p-6 rounded-lg">
            <h3 className="font-medium mb-2">Where you're spending</h3>
            <p className="text-sm text-gray-600 mb-4">
              Track your spending patterns and see how lenders view your financial behavior.
            </p>
            <div className="bg-white rounded-lg p-2">
              <Image
                src="/placeholder.svg?height=150&width=200"
                alt="Spending chart"
                width={200}
                height={150}
                className="mx-auto"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 mx-8 md:mx-16">
        <div className="text-center mb-8">
          <span className="inline-block bg-black text-green-500 px-2 py-1 rounded text-sm font-medium mb-2">
            STEP 2
          </span>
          <h2 className="text-3xl font-bold">Grow your score</h2>
          <p className="text-gray-600 mt-2 max-w-2xl mx-auto">
            With a clearer picture of your past, we can give you clear, actionable steps to focus on your present — and
            progress towards the future. And with daily updates, it's easier than you might think.
          </p>
          <Link href="/grow-your-score">
            <button className="mt-4 px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900">
              Make it happen
            </button>
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-pink-200 p-6 rounded-lg">
            <h3 className="font-medium mb-2">The full picture</h3>
            <p className="text-sm text-gray-600 mb-4">
              See how your actions day to day affect your score, making it clearer the steps we'll guide you on.
            </p>
            <br />
            <div className="bg-white rounded-lg p-2 text-center">
              <span className="text-3xl font-bold text-orange-500">762</span>
              <div className="text-xs mt-1">A-B | Excellent credit score</div>
            </div>
          </div>
          <div className="bg-blue-200 p-6 rounded-lg">
            <h3 className="font-medium mb-2">Up, up and honey</h3>
            <p className="text-sm text-gray-600 mb-4">
              We'll help you understand how to get you where you want to go, and celebrate the little wins along the
              way.
            </p>
            <div className="gap-">
            <div className="bg-white rounded-lg p-1 text-start">
              <div className="text-green-700 font-medium">Confirmed on Electoral Roll</div>
            </div>
            <br />
            <div className="bg-white rounded-lg p-1 text-start">
              <div className="text-green-700 font-medium">Confirmed on Electoral Roll</div>
            </div>
            </div>
          </div>
          <div className="bg-green-200 p-6 rounded-lg">
            <h3 className="font-medium mb-2">Habits for a lifetime</h3>
            <p className="text-sm text-gray-600 mb-4">
              Our recommendations help you form the habits you need to keep your score high over time.
            </p>
            <br />
            <div className="bg-white rounded-lg p-2">
              <ul className="text-sm space-y-2">
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

      <section className="py-12 mx-8 md:mx-16">
        <h2 className="text-3xl font-bold text-center mb-8">Meet the Advancers</h2>
        <p className="text-center text-gray-600 mb-8">Thousands have already taken control of their credit health.</p>

        <div className="relative">
          <div className="bg-pink-200 p-6 rounded-lg max-w-xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Rupert</h3>
                <p className="text-sm">
                  <span className="font-bold">clearscorelife</span> was an absolute breeze. I was very apprehensive,
                  very cautious about giving my details out. It was really helpful, it gave me a good idea of where I
                  was financially and if there was anything suspicious lurking in my credit history. I love Rupert.
                </p>
              </div>
              <div className="relative h-40">
                <Image
                  src="/placeholder.svg?height=160&width=200"
                  alt="Rupert testimonial"
                  fill
                  className="object-cover rounded"
                />
              </div>
            </div>
          </div>

          <button className="absolute left-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <button className="absolute right-0 top-1/2 transform -translate-y-1/2 bg-white rounded-full p-2 shadow">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </section>

      <section className="py-12 mx-8 md:mx-16">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-green-200 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-2">See us as your score support</h2>
            <p className="text-gray-600 mb-6">
              We don't just stick to the shadows. With your subscription, if you ever need a hand, we're here to help.
              Just make sure you're not withdrawing that easy more achievable.
            </p>
          </div>
          <div className="relative h-64">
            <Image
              src="/placeholder.svg?height=256&width=400"
              alt="Support illustration"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <section className="py-12 mx-8 md:mx-16">
        <h2 className="text-3xl font-bold text-center mb-8">Every day score impactors</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium text-sm mb-2">Court Information</h3>
            <div className="relative h-32">
              <Image
                src="/placeholder.svg?height=128&width=128"
                alt="Court information"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium text-sm mb-2">Searches</h3>
            <div className="relative h-32">
              <Image src="/placeholder.svg?height=128&width=128" alt="Searches" fill className="object-contain" />
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium text-sm mb-2">Court Information</h3>
            <div className="relative h-32">
              <Image
                src="/placeholder.svg?height=128&width=128"
                alt="Court information"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="border border-gray-200 rounded-lg p-4 text-center">
            <h3 className="font-medium text-sm mb-2">Searches</h3>
            <div className="relative h-32">
              <Image src="/placeholder.svg?height=128&width=128" alt="Searches" fill className="object-contain" />
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 mx-8 md:mx-16">
        <div className="bg-green-800 p-8 rounded-lg text-center text-white">
          <div className="max-w-3xl mx-auto">
            <p className="text-sm mb-2">★★★★★</p>
            <p className="italic mb-4">
              "Using Piggywise has been life changing for me. I was able to improve my credit score by 85 points in just
              3 months by following their recommendations."
            </p>
            <p className="text-sm">Sarah from London • 3 months ago</p>
          </div>
        </div>
      </section>

      <section className="py-12 mx-8 md:mx-16">
        <div className="text-center">
          <h2 className="text-3xl font-bold mb-4">Practice makes perfect</h2>
          <Link href="/grow-your-score">
            <button className="px-4 py-2 bg-green-800 text-white rounded hover:bg-green-900">Get started</button>
          </Link>
        </div>
      </section>
    </div>
  )
}

