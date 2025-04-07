"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function ResetPassword({
  params,
}: {
  params: { token: string }
}) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isSuccess, setIsSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    if (password.length < 8) {
      setError("Password must be at least 8 characters long")
      setIsLoading(false)
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/reset-password/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: params.token,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Something went wrong")
      }

      setIsSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 3000)
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
      } else {
        setError("An error occurred. Please try again.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-6rem)]">
      <div className="w-full max-w-md px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Set new password</h1>
          <p className="text-gray-600 mt-2">
            Enter your new password below
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-800 rounded">
            {error}
          </div>
        )}

        {!isSuccess ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <input
                type="password"
                placeholder="New Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Confirm New Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-green-800"
              />
            </div>

            <button
              type="submit"
              className="w-full p-3 bg-green-800 text-white rounded hover:bg-green-900 transition-colors"
              disabled={isLoading}
            >
              {isLoading ? "Setting new password..." : "Set new password"}
            </button>
          </form>
        ) : (
          <div className="bg-green-50 border border-green-200 p-4 rounded">
            <h3 className="text-green-800 font-medium mb-2">Password updated successfully!</h3>
            <p className="text-gray-600">
              Your password has been reset. You will be redirected to the login page in a few seconds.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 