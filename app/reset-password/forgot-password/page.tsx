"use client"

import { useState } from "react"
import Link from "next/link"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong");
      }

      setIsSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError("An error occurred. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Reset password</h1>
          <p className="text-gray-600 mt-2">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-green-800 text-white rounded hover:bg-green-900 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send reset link"}
            </button>

            <div className="text-center">
              <Link href="/login" className="text-sm text-gray-600 hover:underline">
                Back to login
              </Link>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 p-4 rounded">
              <h3 className="text-green-800 font-medium mb-2">Check your email</h3>
              <p className="text-gray-600">
                If your email is registered with us, you will receive a password reset link shortly. Please check your inbox and follow the instructions.
              </p>
            </div>
            <div className="text-center">
              <Link href="/login">
                <button className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50">
                  Back to login
                </button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 