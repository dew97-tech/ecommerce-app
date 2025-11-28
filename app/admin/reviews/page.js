import { StarRating } from "@/components/reviews/star-rating"
import { Button } from "@/components/ui/button"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
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
import { Trash2 } from "lucide-react"
import Link from "next/link"

export default async function AdminReviewsPage({ searchParams }) {
  const { page } = await searchParams
  const currentPage = Number(page) || 1
  const limit = 10
  const skip = (currentPage - 1) * limit

  const [reviews, totalCount] = await Promise.all([
    db.review.findMany({
      include: { 
        user: true,
        product: true 
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.review.count(),
  ])

  const totalPages = Math.ceil(totalCount / limit)

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">Manage Reviews</h2>
          <p className="text-muted-foreground mt-1">Moderate product reviews</p>
        </div>
      </div>

      <div className="rounded-md border bg-card mb-6">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="font-semibold">User</TableHead>
              <TableHead className="font-semibold">Rating</TableHead>
              <TableHead className="font-semibold">Comment</TableHead>
              <TableHead className="font-semibold">Product</TableHead>
              <TableHead className="font-semibold">Date</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id} className="hover:bg-muted/50 transition-colors">
                <TableCell className="font-medium">{review.user.name}</TableCell>
                <TableCell>
                  <StarRating rating={review.rating} readOnly size="sm" />
                </TableCell>
                <TableCell className="max-w-md truncate" title={review.comment}>
                  {review.comment}
                </TableCell>
                <TableCell>
                  <Link href={`/products/${review.product.slug}`} className="text-primary hover:underline">
                    {review.product.name}
                  </Link>
                </TableCell>
                <TableCell>{new Date(review.createdAt).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <form action={deleteReview.bind(null, review.id)}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </TableCell>
              </TableRow>
            ))}
            {reviews.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No reviews found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious 
                href={`?page=${Math.max(1, currentPage - 1)}`}
                aria-disabled={currentPage <= 1}
                className={currentPage <= 1 ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
            {Array.from({ length: totalPages }).map((_, i) => (
              <PaginationItem key={i}>
                <PaginationLink 
                  href={`?page=${i + 1}`} 
                  isActive={currentPage === i + 1}
                >
                  {i + 1}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem>
              <PaginationNext 
                href={`?page=${Math.min(totalPages, currentPage + 1)}`}
                aria-disabled={currentPage >= totalPages}
                className={currentPage >= totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}
