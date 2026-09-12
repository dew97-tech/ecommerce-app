import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { BannerActiveToggle } from "@/components/admin/banner-active-toggle"
import { BannerDeleteButton } from "@/components/admin/banner-delete-button"
import { BannerEditDialog } from "@/components/admin/banner-edit-dialog"
import { BannerForm } from "@/components/admin/banner-form"
import { EmptyState } from "@/components/admin/empty-state"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { db } from "@/lib/db"
import { ExternalLink, Image as ImageIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

export default async function BannersPage() {
  const [banners, categories] = await Promise.all([
    db.banner.findMany({ orderBy: { createdAt: 'desc' } }),
    db.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const routes = [
    { name: 'Home', path: '/' },
    { name: 'PC Builder', path: '/pc-builder' },
    { name: 'All Products', path: '/products' },
    ...categories.map((category) => ({
      name: `Category: ${category.name}`,
      path: `/categories/${category.id}`,
    })),
  ]

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Banners"
        description="Manage the homepage hero. Desktop and mobile artwork are served separately."
        actions={
          <Link
            href="/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            View homepage
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Add a banner</CardTitle>
        </CardHeader>
        <CardContent>
          <BannerForm routes={routes} />
        </CardContent>
      </Card>

      {banners.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No banners yet"
          description="Add your first hero banner above — it appears on the homepage immediately."
        />
      ) : (
        <div className="grid gap-5 lg:grid-cols-2">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className="overflow-hidden rounded-xl border border-border bg-card"
            >
              <div className="grid grid-cols-[2fr_1fr] gap-px bg-border">
                <div className="relative aspect-[3/1] bg-white">
                  <Image
                    src={banner.image}
                    alt={banner.title || "Desktop banner"}
                    fill
                    sizes="(max-width: 1024px) 66vw, 480px"
                    className="object-cover"
                  />
                  <Badge className="absolute left-2 top-2 border-0 bg-slate-900/80 text-[10px] text-white">
                    Desktop
                  </Badge>
                </div>

                <div className="relative bg-white">
                  {banner.imageMobile ? (
                    <Image
                      src={banner.imageMobile}
                      alt={banner.title || "Mobile banner"}
                      fill
                      sizes="240px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-2 text-center text-xs text-muted-foreground">
                      No mobile image
                    </div>
                  )}
                  <Badge className="absolute left-2 top-2 border-0 bg-slate-900/80 text-[10px] text-white">
                    Mobile
                  </Badge>
                </div>
              </div>

              <div className="flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-foreground">
                      {banner.title || "Untitled banner"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {banner.link || "No link set"}
                    </p>
                    {banner.buttonText && (
                      <p className="mt-1 text-xs text-muted-foreground">
                        Button:{" "}
                        <span className="font-medium text-foreground">
                          {banner.buttonText}
                        </span>
                      </p>
                    )}
                  </div>

                  <BannerActiveToggle
                    bannerId={banner.id}
                    isActive={banner.isActive}
                    label={banner.title}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 border-t border-border pt-3">
                  <BannerEditDialog banner={banner} routes={routes} />
                  <BannerDeleteButton
                    bannerId={banner.id}
                    bannerTitle={banner.title}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
