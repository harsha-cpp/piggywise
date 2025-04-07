"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<"CHILD" | "PARENT">("CHILD")
  const [error, setError] = useState("")
  const router = useRouter()
  const { status } = useSession()

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard")
    }
  }, [status, router])

  // Update background color when login type changes and hide footer
  useEffect(() => {
    // Apply background color to the entire body
    document.body.style.backgroundColor = loginType === "CHILD" ? "#EFDECD" : "#E4DFDA"
    
    // Add class to hide footer
    document.body.classList.add('hide-footer')
    
    // Cleanup function to reset when component unmounts
    return () => {
      document.body.style.backgroundColor = ""
      document.body.classList.remove('hide-footer')
    }
  }, [loginType])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Call NextAuth signIn method
      const result = await signIn("credentials", {
        email,
        password,
        userType: loginType,
        redirect: false,
      })

      if (result?.error) {
        if (result.error === "Invalid user type") {
          setError("This email is registered with a different account type")
        } else {
          setError("Invalid email or password")
        }
        setIsLoading(false)
        return
      }

      // Successful login - will be redirected by useEffect when session updates
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error("Login error:", error)
    }
    
    setIsLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)]">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">Check back in</h1>
          <p className="text-gray-600 mt-2">Welcome back to your financial journey</p>
        </div>

        {/* Toggle Between Child and Parent Login */}
        <div className="flex justify-center mb-6">
          <div className="flex rounded-full shadow-md overflow-hidden w-[280px]">
            <button
              onClick={() => setLoginType("CHILD")}
              className={`w-1/2 py-3 px-4 text-base font-medium transition-all duration-300 ${
                loginType === "CHILD"
                  ? "bg-green-800 text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              Child
            </button>
            <button
              onClick={() => setLoginType("PARENT")}
              className={`w-1/2 py-3 px-4 text-base font-medium transition-all duration-300 ${
                loginType === "PARENT"
                  ? "bg-green-800 text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              Parent
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <input
              type="email"
              placeholder="Email Id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
            />
          </div>

          <div className="flex justify-end">
            <Link href="/reset-password/forgot-password
" className="text-sm text-green-800 hover:underline">
              Forgotten Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full p-3 bg-green-800 text-white rounded hover:bg-green-900 transition-colors mt-2"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : loginType === "PARENT" ? "Parent Login" : "Child Login"}
          </button>
        </form>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            New to Piggywise?{" "}
            <Link href="/signup" className="text-green-800 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

