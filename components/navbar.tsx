"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Menu, X } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [hasScrolled, setHasScrolled] = useState(false)
  const pathname = usePathname()
  
  // Check if current page is login or signup
  const isAuthPage = pathname === '/login' || pathname === '/signup'

  // Add scroll event listener to detect when user scrolls down
  useEffect(() => {
    const handleScroll = () => {
      setHasScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { name: "Know your type", href: "/" },
    { name: "Grow your score ", href: "/grow-your-score" },
    { name: "Read our story", href: "/read-our-story" },
  ]

  return (
    <header className={`fixed top-0 left-0 right-0 w-full py-4 z-50 transition-all duration-300 ${
      hasScrolled || isAuthPage 
        ? "bg-white/70 backdrop-filter backdrop-blur-lg border-b border-white/20 shadow-sm" 
        : "bg-white border-b border-gray-100"
    }`}>
      <div className="container mx-auto flex items-center justify-between">
        {/* Logo with proper margins */}
        <div className="flex items-center w-[200px] mx-6 md:mx-12">
          <Link href="/" className="flex items-center space-x-1">
            <Image 
              src="/peppapig.png" 
              alt="Peppa Pig" 
              width={36} 
              height={36} 
              className="object-contain w-9 h-9"
            />
            <span className="text-xl font-bold">Piggywise</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center justify-center flex-1">
          <div className="flex space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative py-1 tracking-[0.02em] text-base ${
                  pathname === link.href 
                    ? "text-black font-semibold after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-[2px] after:bg-black" 
                    : "text-gray-500 hover:text-black"
                }`}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </nav>

        {/* Login/Signup buttons - Right section */}
        <div className="hidden md:flex items-center space-x-4 w-[200px] justify-end mx-8 md:mx-16">
          <Link href="/login">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black">Log in</button>
          </Link>
          <Link href="/signup">
            <button className="px-4 py-2 text-sm font-medium bg-green-800 text-white rounded hover:bg-green-900">
              Sign up
            </button>
          </Link>
        </div>

        <button className="md:hidden mx-8" onClick={toggleMenu} aria-label="Toggle menu">
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className={`container mx-auto py-4 space-y-4 px-8 md:px-16 ${
            hasScrolled || isAuthPage ? "bg-white/80 backdrop-filter backdrop-blur-md" : "bg-white"
          }`}>
            <nav className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={pathname === link.href ? "text-black font-medium" : "text-gray-500 hover:text-black"}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col space-y-2 pt-2 border-t">
              <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-black text-left">
                  Log in
                </button>
              </Link>
              <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                <button className="w-full px-4 py-2 text-sm font-medium bg-green-800 text-white rounded hover:bg-green-900 text-left">
                  Sign up
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

