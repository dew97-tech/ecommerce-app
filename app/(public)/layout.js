import { FooterContainer } from "@/components/footer-container"
import { NavbarContainer } from "@/components/navbar-container"

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarContainer />
      <main className="flex-1">{children}</main>
      <FooterContainer />
    </div>
  )
}
