import Link from "next/link"
import Image from "next/image"

export default function GrowYourScore() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 items-center">
          <div>
            <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">Grow your score</h1>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base md:text-lg">
              With a clearer picture of your past, we can give you clear, actionable steps to focus on your present —
              and progress towards the future. And with daily updates, it's easier than you might think.
            </p>
            <Link href="/signup">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">Get started</button>
            </Link>
          </div>
          <div className="d:w-1/2 flex justify-center mt-4 sm:mt-0">
            <div className="h-56 sm:h-64 md:h-72 w-full rounded-lg overflow-hidden relative bg-emerald-100" style={{ 
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              backgroundBlendMode: 'soft-light',
              backgroundColor: '#bdf0c8'
            }}>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-red-500 p-4 sm:p-6 rounded-full bg-white/40 backdrop-blur-sm mr-6 sm:mr-10">360</div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-yellow-500 p-4 sm:p-6 rounded-full bg-white/40 backdrop-blur-sm mr-6 sm:mr-10">500</div>
                <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-emerald-500 p-4 sm:p-6 rounded-full bg-white/40 backdrop-blur-sm">800</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold">Steps worth taking</h2>
          <h3 className="text-xl sm:text-2xl font-bold">Progress worth making</h3>
        </div>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-pink-200 p-4 sm:p-6 md:p-8 rounded-lg">
            <h3 className="text-lg sm:text-xl font-medium mb-3 sm:mb-4">Look back to get ahead</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Understanding your credit history is the first step to improving your future score.
            </p>
            <div className="flex justify-between items-center">
              <div className="bg-white rounded-lg p-2 sm:p-3">
                <span className="text-2xl sm:text-3xl font-bold">632</span>
              </div>
              <Link href="/read-our-story">
                <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">View history</button>
              </Link>
            </div>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">On top of the numbers</h3>
              <p className="text-xs sm:text-sm text-gray-600">Track key metrics that influence your credit score.</p>
            </div>
            <div className="bg-gray-100 p-4 sm:p-6 rounded-lg">
              <h3 className="font-medium mb-2 text-base sm:text-lg">See what your future holds</h3>
              <p className="text-xs sm:text-sm text-gray-600">Forecast how different actions might affect your credit score.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="bg-blue-100 p-4 sm:p-6 md:p-8 rounded-lg text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Tick, tick, boom</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 max-w-3xl mx-auto mb-4 sm:mb-6">
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <div className="text-orange-500 text-lg sm:text-xl font-bold">Day 1</div>
              <p className="text-xs sm:text-sm">Get started</p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <div className="text-orange-500 text-lg sm:text-xl font-bold">Day 30</div>
              <p className="text-xs sm:text-sm">First progress</p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <div className="text-orange-500 text-lg sm:text-xl font-bold">Day 60</div>
              <p className="text-xs sm:text-sm">Keep going</p>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-lg">
              <div className="text-orange-500 text-lg sm:text-xl font-bold">Day 90</div>
              <p className="text-xs sm:text-sm">See results</p>
            </div>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold mb-2">With you through life</h3>
          <p className="text-gray-600 max-w-2xl mx-auto mb-4 sm:mb-6 text-sm sm:text-base">
            We're here to support your credit journey at every stage, providing guidance and tools to help you succeed.
          </p>
        </div>
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <div className="bg-yellow-100 p-4 sm:p-6 md:p-8 rounded-lg">
            <h3 className="text-lg sm:text-xl font-medium mb-2">Make a plan</h3>
            <h4 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">See it through</h4>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              Create a personalized plan to improve your credit score based on your unique situation.
            </p>
            <Link href="/signup">
              <button className="px-3 py-1.5 sm:px-4 sm:py-2 bg-green-800 text-white rounded hover:bg-green-900 text-sm sm:text-base">Start planning</button>
            </Link>
          </div>
          <div className="bg-pink-100 p-4 sm:p-6 md:p-8 rounded-lg">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="col-span-1 font-medium text-xs sm:text-sm">Help Centre</div>
              <div className="col-span-1 font-medium text-xs sm:text-sm">Credit Health</div>
              <div className="col-span-1 font-medium text-xs sm:text-sm">Information</div>
              <div className="col-span-1 font-medium text-xs sm:text-sm">Company</div>
            </div>
            <p className="text-xs sm:text-sm text-gray-600">
              Piggywise is committed to helping you understand and improve your credit score. Our resources and tools
              are designed to empower you on your financial journey.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

