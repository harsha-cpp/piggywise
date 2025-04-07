import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full mt-16">
      <div className="bg-gradient-to-t from-pink-400 to-yellow-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Help Centre Column */}
            <div>
              <h3 className="text-lg font-bold mb-4">Contact us</h3>
              <div className="space-y-2">
                <p className="text-sm">E-mail priority customer service</p>
                <p className="text-sm">Monday to Friday 09:00 - 17:00</p>
                <p className="text-sm"></p>
              </div>
            </div>

            {/* Credit Health Column */}
            <div>
              <h3 className="text-lg font-bold mb-4">Finance Wealth</h3>
              <div className="space-y-2">
                <Link href="/read-our-story" className="block text-sm hover:underline">
                  Know your type
                </Link>
                <Link href="/grow-your-score" className="block text-sm hover:underline">
                  Grow your skills
                </Link>
              </div>
            </div>

            {/* Information Column */}
            <div>
              <h3 className="text-lg font-bold mb-4">Information</h3>
              <div className="space-y-2">
                <Link href="mailto:piggywise@gmail.com" className="block text-sm hover:underline">
                  Write a mail
                </Link>
                <Link href="/report" className="block text-sm hover:underline">
                  Statutory Credit Report
                </Link>
                <Link href="/terms" className="block text-sm hover:underline">
                  Terms of Use
                </Link>
                <Link href="/privacy" className="block text-sm hover:underline">
                  Privacy & Cookies
                </Link>
              </div>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <div className="space-y-2">
                <Link href="/read-our-story" className="block text-sm hover:underline">
                  Read our story
                </Link>
                <Link href="mailto:piggywise.partners@gmail.com" className="block text-sm hover:underline">
                  Become a partner
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div className="text-xs">
              <p className="mb-2">
              Financial literacy is often overlooked in traditional education, yet it's a critical life skill. Most preschoolers already understand basic money concepts, making early childhood the perfect time to begin financial education. Piggywise builds on this natural curiosity, creating a foundation for lifelong financial health.
              </p>
              <p>Copyright © Credit Reporting Agency Ltd 2025 Piggywise. All rights reserved.</p>
            </div>
            <div className="text-xs">
              <p>
              Piggywise offers a ₹600 monthly subscription with a 30-day free trial for new customers. The plan includes complete access to all financial education modules, games, parent dashboard, weekly challenges, and personalized learning paths for children. The trial requires adult verification and automatically converts to a paid subscription unless cancelled, which can be done anytime online or through customer support.


              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

