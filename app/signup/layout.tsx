import React from "react"
import { Inter } from "next/font/google"
import "../globals.css"

const inter = Inter({ subsets: ["latin"] })

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This custom layout uses the root layout (with navbar) but omits the footer
  return children
} 