import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { AdminPagination } from "@/components/admin/admin-pagination"
import { AdminSearch } from "@/components/admin/admin-search"
import { DeleteEntityButton } from "@/components/admin/delete-entity-button"
import { EmptyState } from "@/components/admin/empty-state"
import { StatCard } from "@/components/admin/stat-card"
import { UserAvatar } from "@/components/common/user-avatar"
import { StarRating } from "@/components/reviews/star-rating"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteReview } from "@/lib/actions/review"
import { db } from "@/lib/db"
import { formatAdminDate, formatAdminDateTime } from "@/lib/format"
import { parseImages } from "@/lib/images"
import { cn } from "@/lib/utils"
import { Star, TrendingUp } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export const dynamic = 'force-dynamic'

const RATING_FILTERS = [
  { value: "", label: "All" },
  { value: "5", label: "5 stars" },
  { value: "4", label: "4 stars" },
  { value: "low", label: "3 & below" },
]

function percentChange(current, previous) {
  if (!previous) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

function buildFilterHref(value, searchParams) {
  const params = new URLSearchParams(searchParams)
  params.set('page', '1')

  if (value) {
    params.set('rating', value)
  } else {
    params.delete('rating')
  }

  return `/admin/reviews?${params.toString()}`
}

export default async function AdminReviewsPage(props) {
  const searchParams = await props.searchParams
  const query = searchParams?.query || ''
  const ratingFilter = ['5', '4', 'low'].includes(searchParams?.rating)
    ? searchParams.rating
    : ''
  const currentPage = Math.max(1, Number(searchParams?.page) || 1)
  const limit = 12
  const skip = (currentPage - 1) * limit

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(now.getDate() - 30)
  const sixtyDaysAgo = new Date(now)
  sixtyDaysAgo.setDate(now.getDate() - 60)

  const and = []

  if (query) {
    and.push({
      OR: [
        { comment: { contains: query } },
        { user: { name: { contains: query } } },
        { product: { name: { contains: query } } },
      ],
    })
  }

  if (ratingFilter === '5') {
    and.push({ rating: 5 })
  } else if (ratingFilter === '4') {
    and.push({ rating: 4 })
  } else if (ratingFilter === 'low') {
    and.push({ rating: { lte: 3 } })
  }

  const where = and.length > 0 ? { AND: and } : {}

  const [
    reviews,
    totalCount,
    totalReviews,
    ratingAggregate,
    reviews30,
    reviewsPrev30,
  ] = await Promise.all([
    db.review.findMany({
      where,
      select: {
        id: true,
        rating: true,
        comment: true,
        createdAt: true,
        user: { select: { name: true, image: true } },
        product: { select: { name: true, slug: true, images: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.count({ where }),
    db.review.count(),
    db.review.aggregate({ _avg: { rating: true } }),
    db.review.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    db.review.count({
      where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
    }),
  ])

  const totalPages = Math.ceil(totalCount / limit)
  const averageRating = ratingAggregate._avg.rating
    ? ratingAggregate._avg.rating.toFixed(1)
    : "—"

  return (
    <div className="space-y-6 p-4 md:p-6">
      <AdminPageHeader
        title="Reviews"
        description="Moderate product reviews and remove spam."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Total reviews"
          value={totalReviews.toLocaleString("en-US")}
          icon={Star}
          tone="default"
        />
        <StatCard
          label="Average rating"
          value={averageRating}
          icon={Star}
          tone="warning"
          hint={`Across ${totalReviews.toLocaleString("en-US")} reviews`}
        />
        <StatCard
          label="New (30 days)"
          value={reviews30.toLocaleString("en-US")}
          icon={TrendingUp}
          tone="success"
          trend={percentChange(reviews30, reviewsPrev30)}
        />
      </div>

      <div className="rounded-xl border border-border bg-card">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-1">
            {RATING_FILTERS.map((entry) => (
              <Link
                key={entry.value || 'all'}
                href={buildFilterHref(entry.value, searchParams)}
                className={cn(
                  'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  ratingFilter === entry.value
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {entry.label}
              </Link>
            ))}
          </div>

          <AdminSearch placeholder="Search reviews..." />
        </div>

        {reviews.length === 0 ? (
          <div className="p-6">
            {totalReviews === 0 ? (
              <EmptyState
                icon={Star}
                title="No reviews yet"
                description="Customer reviews will appear here once products start getting rated."
              />
            ) : (
              <EmptyState
                icon={Star}
                title="No reviews match your filters"
                description="Try a different search term or rating filter."
              />
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 hover:bg-muted/40">
                <TableHead>Customer</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviews.map((review) => (
                <TableRow key={review.id} className="hover:bg-muted/40">
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <UserAvatar
                        name={review.user?.name}
                        image={review.user?.image}
                        className="h-8 w-8"
                      />
                      <span className="max-w-[160px] truncate font-medium text-foreground">
                        {review.user?.name || "Customer"}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} readOnly size="sm" />
                      <span className="text-xs text-muted-foreground">
                        {review.rating.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[420px] whitespace-normal">
                      <p
                        className="line-clamp-2 text-muted-foreground"
                        title={review.comment || undefined}
                      >
                        {review.comment || "—"}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="relative h-8 w-8 shrink-0 overflow-hidden rounded border border-border bg-white">
                        <Image
                          src={
                            parseImages(review.product.images)[0] ||
                            "/placeholder.png"
                          }
                          alt=""
                          fill
                          sizes="32px"
                          className="object-contain p-0.5"
                        />
                      </div>
                      <Link
                        href={`/products/${review.product.slug}`}
                        className="block max-w-[220px] truncate text-primary hover:underline"
                        title={review.product.name}
                      >
                        {review.product.name}
                      </Link>
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    <span title={formatAdminDateTime(review.createdAt)}>
                      {formatAdminDate(review.createdAt)}
                    </span>
                  </TableCell>

                  <TableCell className="text-right">
                    <DeleteEntityButton
                      id={review.id}
                      itemName={`review by ${review.user?.name || "customer"}`}
                      label="Review"
                      title="Delete review?"
                      description="This review will be permanently removed from the product page."
                      action={deleteReview}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}

        <div className="border-t border-border p-4">
          <AdminPagination totalPages={totalPages} />
        </div>
      </div>
    </div>
  )
}
