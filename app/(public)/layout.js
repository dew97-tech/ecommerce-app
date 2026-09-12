import { JumpToTop } from "@/components/common/jump-to-top"
import { FooterContainer } from "@/components/layout/footer/footer-container"
import { NavbarContainer } from "@/components/layout/header/navbar-container"

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarContainer />
      <main className="flex-1">{children}</main>
      <FooterContainer />
      <JumpToTop />
    </div>
  )
}
