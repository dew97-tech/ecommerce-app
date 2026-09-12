import { Footer } from "@/components/layout/footer/footer"
import { getNavData } from "@/lib/catalog/nav-data"

export async function FooterContainer() {
  const navData = await getNavData()
  const categories = navData
    .filter((category) => category.productCount > 0)
    .map(({ id, name }) => ({ id, name }))
  return <Footer categories={categories} />
}
