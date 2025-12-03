import { FooterContainer } from "@/components/footer-container"
import { NavbarContainer } from "@/components/navbar-container"

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="sticky top-0 z-40 w-full">
        <NavbarContainer />
      </div>
      <main className="flex-1">{children}</main>
      <FooterContainer />
    </div>
  )
}
