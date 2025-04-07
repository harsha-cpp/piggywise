import React from "react"
import { Inter } from "next/font/google"
import "../globals.css"
import Navbar from "@/components/navbar"
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] })

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // This custom layout uses the root layout (with navbar) but omits the footer
  return children
} 