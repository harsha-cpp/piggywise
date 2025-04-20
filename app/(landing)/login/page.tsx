"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { signIn, useSession, signOut } from "next-auth/react"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginType, setLoginType] = useState<"CHILD" | "PARENT">("CHILD")
  const [error, setError] = useState("")
  const router = useRouter()
  const { data: session, status } = useSession()

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

      // Successful login - let the session update handle the confirmation screen
      // No redirection needed here as the component will re-render with authenticated status
    } catch (error) {
      setError("An error occurred. Please try again.")
      console.error("Login error:", error)
    }
    
    setIsLoading(false)
  }

  const handleLogout = async () => {
    setIsLoading(true);
    await signOut({ redirect: false });
    setIsLoading(false);
    // The page will rerender with status="unauthenticated"
  }

  if (status === "authenticated") {
    const userType = session?.user?.userType || 'USER';
    const dashboardPath = userType === "PARENT" ? "/dashboard/parent" : "/dashboard/child";
    
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 sm:px-6">
        <div className="w-full max-w-md p-4 sm:p-6 bg-white rounded-lg shadow-md">
          <div className="text-center mb-4 sm:mb-6">
            <h1 className="text-lg sm:text-xl font-bold">Login Success</h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              You're currently logged in as {session?.user?.name || session?.user?.email} ({userType})
            </p>
          </div>
          
          <div className="flex flex-col space-y-3 sm:space-y-4">
            <button
              onClick={() => router.push(dashboardPath)}
              className="w-full p-2.5 sm:p-3 bg-green-800 text-white text-sm sm:text-base rounded hover:bg-green-900 transition-colors"
            >
              Go to Dashboard
            </button>
            
            <button
              onClick={handleLogout}
              className="w-full p-2.5 sm:p-3 bg-gray-200 text-gray-800 text-sm sm:text-base rounded hover:bg-gray-300 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Logging out..." : "Login with a different account"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-72px)] px-4 sm:px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-4 sm:mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold">Check back in</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">Welcome back to your financial journey</p>
        </div>

        {/* Toggle Between Child and Parent Login */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="flex rounded-full shadow-md overflow-hidden w-full max-w-[280px]">
            <button
              onClick={() => setLoginType("CHILD")}
              className={`w-1/2 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-all duration-300 ${
                loginType === "CHILD"
                  ? "bg-green-800 text-white"
                  : "bg-gray-200 text-gray-500 hover:bg-gray-300"
              }`}
            >
              Child
            </button>
            <button
              onClick={() => setLoginType("PARENT")}
              className={`w-1/2 py-2 sm:py-3 px-3 sm:px-4 text-sm sm:text-base font-medium transition-all duration-300 ${
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
          <div className="mb-4 p-2.5 sm:p-3 bg-red-100 text-red-800 rounded text-sm sm:text-base">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 mt-4">
          <div>
            <input
              type="email"
              placeholder="Email Id"
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

          <div className="flex justify-end">
            <Link href="/reset-password/forgot-password" className="text-xs sm:text-sm text-green-800 hover:underline">
              Forgotten Password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full p-2.5 sm:p-3 bg-green-800 text-white rounded hover:bg-green-900 transition-colors mt-2 text-sm sm:text-base"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : loginType === "PARENT" ? "Parent Login" : "Child Login"}
          </button>
        </form>

        <div className="text-center mt-4 sm:mt-6">
          <p className="text-xs sm:text-sm text-gray-600">
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

