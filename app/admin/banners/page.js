import { BannerForm } from "@/components/admin/banner-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { deleteBanner } from "@/lib/admin-banner-actions"
import { db } from "@/lib/db"
import Image from "next/image"

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const banners = await db.banner.findMany({ orderBy: { createdAt: 'desc' } })

  return (
    <div className="p-8 pt-6 space-y-8">
      <h2 className="text-3xl font-bold tracking-tight">Banners</h2>
      
      <Card>
        <CardHeader>
          <CardTitle>Add New Banner</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerForm />
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
              </div>
              <form action={deleteBanner.bind(null, banner.id)}>
                <Button variant="destructive" size="sm">Delete</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
