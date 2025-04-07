import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <Navbar />
      <main className="pt-[72px]">{children}</main>
      <Footer />
    </div>
  )
} 