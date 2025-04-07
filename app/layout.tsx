import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "./providers"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Piggywise - Credit Score Education for Kids",
  description: "Teach your kids about credit scores with Piggywise's interactive platform",
  generator: 'Piggywise',
  icons: {
    icon: '/favicon.png',
    apple: '/apple-icon.png',
  },
  metadataBase: new URL('https://piggy-wise.vercel.app'),
  openGraph: {
    title: 'Piggywise',
    description: 'teach your kid finance, with Piggywise',
    images: ['/peppapig.png'],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="light">
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  )
}