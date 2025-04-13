import Link from "next/link"
import Image from "next/image"

export default function ReadOurStory() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Our Piggy Tale 🐷📖</h1>
          <h3 className="text-gray-600 text-base sm:text-lg md:text-xl mx-auto justify-start">
          It's not just coins and numbers — it's a wild money adventure! ✨
From saving quests to spending smarts, we're here to turn every kid into a money wizard, one fun mission at a time - with games, giggles, and goals that stick!
          </h3>
          <Link href="/signup">
            <button className="mt-4 sm:mt-6 px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">
              Take the first step
            </button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="p-4 sm:p-6 md:p-8 md:order-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Who we are</h2>
            <p className="text-gray-600 text-sm sm:text-base">
            PiggyWise is a fun, interactive platform designed to teach kids smart money habits. We're on a mission to make financial literacy easy, engaging, and age-appropriate.
            </p>
          </div>
          <div className="bg-green-100 p-4 sm:p-6 md:p-8 rounded-lg md:order-2">
            <div className="relative h-36 sm:h-40 md:h-48">
              <Image
                src="/placeholder.svg?height=192&width=300"
                alt="Who we are illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
          <div className="bg-green-800 p-4 sm:p-6 md:p-8 rounded-lg order-2 md:order-1">
            <div className="relative h-36 sm:h-40 md:h-48">
              <Image
                src="/placeholder.svg?height=192&width=300"
                alt="What we do illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
          <div className="p-4 sm:p-6 md:p-8 order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">What we do</h2>
            <p className="text-gray-600 text-sm sm:text-base">
            We gamify personal finance education through challenges, simulations, and tools that help kids learn budgeting, saving, and spending in a playful way.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
          <div className="p-4 sm:p-6 md:p-8 md:order-1">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">How we do it</h2>
            <p className="text-gray-600 text-sm sm:text-base">
            Through cool quests, interactive games, and real-life money missions, we teach kids how to make wise choices — one level at a time
            </p>
          </div>
          <div className="bg-orange-200 p-4 sm:p-6 md:p-8 rounded-lg md:order-2">
            <div className="relative h-36 sm:h-40 md:h-48">
              <Image
                src="/placeholder.svg?height=192&width=300"
                alt="How we do it illustration"
                fill
                className="object-contain"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Check in with your credit health</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-orange-100 p-4 sm:p-6 md:p-8 rounded-lg">
            <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Score summary</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Get a comprehensive overview of your credit score and the factors affecting it.
            </p>
            <div className="bg-white rounded-lg p-3 sm:p-4 inline-block">
              <span className="text-2xl sm:text-3xl md:text-4xl font-bold text-orange-500">790</span>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">Payments & borrowing</h3>
              <p className="text-xs sm:text-sm text-gray-600">Track your payment history and current borrowing status.</p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">Addresses & Electoral Roll</h3>
              <p className="text-xs sm:text-sm text-gray-600">Verify your address information is correct and up-to-date.</p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">Associations & aliases</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                See financial connections and alternative names in your credit file.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">The more you learn</h2>
          <h2 className="text-2xl sm:text-3xl font-bold">The higher you can save</h2>
        </div>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">Court information</h3>
              <p className="text-xs sm:text-sm text-gray-600">
                View any court judgments or public records associated with your file.
              </p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">Searches</h3>
              <p className="text-xs sm:text-sm text-gray-600">See who has searched your credit file and when.</p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">Fraud alerts</h3>
              <p className="text-xs sm:text-sm text-gray-600">Get notified of any suspicious activity on your credit file.</p>
            </div>
          </div>
          <div className="bg-gray-100 p-4 sm:p-6 md:p-8 rounded-lg">
            <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Your questions have answers</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">We provide clear explanations for all your credit-related questions.</p>
            <Link href="/help">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">Learn more</button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}

