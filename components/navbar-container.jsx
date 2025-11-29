import { Navbar } from "@/components/navbar"
import { getCategoryData } from "@/lib/data"

export async function NavbarContainer() {
  const categoryData = await getCategoryData()
  return <Navbar categoryData={categoryData} />
}
