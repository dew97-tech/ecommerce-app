import { Footer } from "@/components/footer"
import { getCategoryData } from "@/lib/data"

export async function FooterContainer() {
  const categoryData = await getCategoryData()
  return <Footer categories={categoryData} />
}
