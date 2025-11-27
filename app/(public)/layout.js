import { Footer } from "@/components/footer"
import { Navbar } from "@/components/navbar"

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
