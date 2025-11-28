import { BannerEditDialog } from "@/components/admin/banner-edit-dialog"
import { BannerForm } from "@/components/admin/banner-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteBanner } from "@/lib/admin-banner-actions"
import { db } from "@/lib/db"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const [banners, categories] = await Promise.all([
    db.banner.findMany({ orderBy: { createdAt: 'desc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } })
  ])

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'All Products', path: '/products' },
    ...categories.map(c => ({ name: `Category: ${c.name}`, path: `/products?category=${c.slug}` }))
  ]

  return (
    <div className="p-8 pt-6 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Banners</h2>
          <p className="text-muted-foreground mt-1">Manage your homepage banners</p>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerForm routes={routes} />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {banners.map((banner) => (
          <Card key={banner.id} className="overflow-hidden">
            <div className="relative aspect-video">
              <Image src={banner.image} alt={banner.title || "Banner"} fill className="object-cover" />
            </div>
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="font-bold">{banner.title}</p>
                <p className="text-sm text-muted-foreground">{banner.link}</p>
                {banner.buttonText && <p className="text-xs text-primary mt-1">Button: {banner.buttonText}</p>}
              </div>
              <div className="flex gap-2">
                <BannerEditDialog banner={banner} routes={routes} />
                <form action={deleteBanner.bind(null, banner.id)}>
                    <Button variant="destructive" size="sm">Delete</Button>
                </form>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
