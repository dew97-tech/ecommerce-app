import { Header } from "@/components/layout/header/header"
import { getNavData } from "@/lib/catalog/nav-data"

export async function NavbarContainer() {
  const navData = await getNavData()
  return <Header navData={navData} />
}
