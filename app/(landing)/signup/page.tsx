"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function Signup() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [name, setName] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [signupType, setSignupType] = useState<"CHILD" | "PARENT">("CHILD")
  const [error, setError] = useState("")
  const router = useRouter()
  const { status } = useSession()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  // Update background color when signup type changes and hide footer
  useEffect(() => {
    // Apply background color to the entire body
    document.body.style.backgroundColor = signupType === "CHILD" ? "#EFDECD" : "#E4DFDA"
    
    // Add class to hide footer
    document.body.classList.add('hide-footer')
    
    // Cleanup function to reset when component unmounts
    return () => {
      document.body.style.backgroundColor = ""
      document.body.classList.remove('hide-footer')
    }
  }, [signupType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords don't match")
      return
    }

    if (!agreeTerms) {
      setError("Please agree to the terms and conditions")
      return
    }

    setIsLoading(true)

    try {
      // Register user via API
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name, 
          email, 
          password,
          userType: signupType
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      // Registration successful - redirect to login page
      router.push(`/login?registered=true&type=${signupType.toLowerCase()}`)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred during registration")
      }
      console.error("Registration error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Create an account</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Join Piggywise to manage your credit score</p>
        </div>

        {/* Toggle Between Child and Parent Signup */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex rounded-full shadow-md overflow-hidden w-full max-w-[280px]">
            <button
              onClick={() => setSignupType("CHILD")}
              className={`w-1/2 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-all duration-300 ${
                signupType === "CHILD"
                  ? "bg-green-800 text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              Child
            </button>
            <button
              onClick={() => setSignupType("PARENT")}
              className={`w-1/2 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-all duration-300 ${
                signupType === "PARENT"
                  ? "bg-green-800 text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              Parent
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-2.5 sm:p-3 bg-red-100 text-red-800 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
          <div>
            <input
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full p-2.5 sm:p-3 text-sm sm:text-base border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="terms"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="terms" className="text-xs sm:text-sm text-gray-600">
              I agree to the{" "}
              <Link href="/terms" className="text-green-800 hover:underline">
                terms and conditions
              </Link>
            </label>
          </div>

          <button
            type="submit"
            className="w-full p-2.5 sm:p-3 bg-green-800 text-white rounded hover:bg-green-900 transition-colors mt-2 text-sm sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? "Creating account..." : signupType === "PARENT" ? "Parent Sign up" : "Child Sign up"}
          </button>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-600">
            Already have an account?{" "}
            <Link href="/login" className="text-green-800 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

