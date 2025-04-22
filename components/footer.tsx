"use client"

import Link from "next/link"
import { useRef } from "react"

export default function Footer() {
  const mapContainerRef = useRef(null);
  
  // Simpler direct embed link - showing area similar to the image
  const mapSrc = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=RV+University,Bengaluru+Karnataka&zoom=14&maptype=roadmap`

  return (
    <footer className="w-full mt-16">
      <div className="bg-gradient-to-t from-pink-400 to-yellow-200 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start md:items-stretch">
            {/* Contact Info Column */}
            <div className="flex flex-col md:pt-5">
              <h3 className="text-lg font-bold mb-4 md:mb-6">Contact us</h3>
              <div className="space-y-2">
                <p className="text-sm">piggywise@gmail.com</p>
                <p className="text-sm">Tuesdays 2 - 4 pm - Thursdays 2 - 4pm</p>
                <p className="text-sm">RV Vidyanikethan Post, 8th Mile, Mysore Rd, Mailasandra, Bengaluru, Karnataka 560059</p>
              </div>
            </div>

            {/* RV University Map Column */}
            <div className="flex flex-col">
              <h3 className="text-lg font-bold mb-4">Location</h3>
              <div className="rounded-lg overflow-hidden shadow-md h-36 md:h-40 relative" ref={mapContainerRef}>
                <iframe 
                  src={mapSrc}
                  width="100%" 
                  height="100%" 
                  style={{ border: 0 }} 
                  allowFullScreen={false} 
                  loading="lazy" 
                  referrerPolicy="no-referrer-when-downgrade"
                  title="RV University Map"
                  aria-label="Map showing RV University, Bengaluru"
                />
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

