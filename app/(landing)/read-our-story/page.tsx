import Link from "next/link"
import Image from "next/image"

export default function ReadOurStory() {
  return (
    <div className="container mx-auto px-4 sm:px-6">
      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3 sm:mb-4">The PiggyWise Story 📖</h1>
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
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Our Mission</h2>
            <p className="text-gray-600 text-sm sm:text-base">
            Our mission is to design and develop an intuitive digital platform that makes it easy and engaging for users—especially young people—to learn about money, talk about it openly, and track their financial journey with purpose. By combining thoughtful user experience design, behavioral insights, and robust technology, we aim to address both the emotional and practical dimensions of financial learning. The platform will offer features that support micro-habits, goal setting, progress tracking, and social learning, all tailored to meet users where they are in their financial journey. We are committed to creating a safe, stigma-free space where users can build confidence in their financial decisions, celebrate small wins, and stay curious about their growth—not just in terms of wealth, but in terms of wisdom.            </p>
          </div>
          <div className="bg-green-100 p-4 sm:p-6 md:p-8 rounded-lg md:order-2 flex items-center justify-center h-full">
            <div className="relative w-[250px] h-[320px] sm:w-[280px] sm:h-[350px] md:w-[300px] md:h-[380px]">
              <Image
                src="/Whoarewe.png"
                alt="Our mission illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 mt-6 sm:mt-8">
          <div className="bg-[#9ebe9e] p-4 sm:p-6 md:p-8 rounded-lg order-2 md:order-1 relative overflow-hidden">
            <div className="absolute inset-0 bg-[#9ebe9e] opacity-100"></div>
            <div className="relative aspect-[4/5] w-full mx-auto max-w-[300px] z-10">
              <Image
                src="/Springimage.png"
                alt="What we do illustration"
                fill
                className="object-contain"
                priority
              />
            </div>
          </div>
          <div className="p-4 sm:p-6 md:p-8 order-1 md:order-2">
            <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">Our Vision</h2>
            <p className="text-gray-600 text-sm sm:text-base">
            Our vision is to cultivate a generation that approaches money with confidence, clarity, and curiosity. We believe that financial literacy is not just a skill but a mindset—one that should be nurtured early and organically. In a world where conversations about money are often clouded by discomfort, stigma, or lack of access, our platform envisions a future where these discussions are normalized, inclusive, and empowering. We aim to shift financial education from a reactive life skill to a proactive life companion—one that evolves with the user, helping them not only understand money but also build a healthy relationship with it. By making financial literacy relatable and human-centered, we hope to dismantle generational gaps in financial understanding and promote a more equitable and informed society.

            </p>
          </div>
        </div>

   
      </section>

      <section className="py-8 sm:py-12 mx-4 sm:mx-8 md:mx-12 lg:mx-16">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">
            Meet the <span className="bg-clip-text text-transparent bg-gradient-to-r from-green-500 to-blue-500">Team</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-base md:text-lg mx-auto max-w-3xl">
          From Ideas to Impact — Say Hi to the Brains Behind PiggyWise 👋
          </p>
        </div>
        
        {/* Top row with 2 team members */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 sm:gap-1 md:gap-2 mb-8 sm:mb-10 max-w-3xl mx-auto">
          {/* Team Member 1 - Richa */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4 bg-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/Richa.JPG"
                  alt="Richa"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Richa</h3>
            <p className="text-gray-600 text-sm sm:text-base">Designer</p>
          </div>
          
          {/* Team Member 2 - Jahnavi */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4 bg-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/Jahnavi.jpg"
                  alt="Jahnavi"
                  fill
                  className="object-cover"
                  style={{ transform: "scale(1.2)", objectPosition: "center center" }}
                />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Jahnavi</h3>
            <p className="text-gray-600 text-sm sm:text-base">Fintech</p>
          </div>
        </div>
        
        {/* Bottom row with 3 team members */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-1 sm:gap-1 md:gap-2 max-w-4xl mx-auto">
          {/* Team Member 3 - Sharvari */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4 bg-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/Sharvari.jpg"
                  alt="Sharvari"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center top" }}
                />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Sharvari</h3>
            <p className="text-gray-600 text-sm sm:text-base">Fintech</p>
          </div>
          
          {/* Team Member 4 - Divya */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4 bg-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/Divya.jpg"
                  alt="Divya"
                  fill
                  className="object-cover"
                  style={{ objectPosition: "center 30%" }}
                />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Divya</h3>
            <p className="text-gray-600 text-sm sm:text-base">AI & Data Science</p>
          </div>
          
          {/* Team Member 5 - Vidya */}
          <div className="flex flex-col items-center">
            <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden mb-4 bg-green-100 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative w-full h-full">
                <Image
                  src="/Vidhya Lakshmi Vijay.png"
                  alt="Vidya"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
            <h3 className="text-lg sm:text-xl font-bold">Vidya</h3>
            <p className="text-gray-600 text-sm sm:text-base">AI & Data Science</p>
          </div>
        </div>
      </section>
   
  
    </div>
  )
}

