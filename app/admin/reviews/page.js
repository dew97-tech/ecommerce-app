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
      <h1 className="text-2xl font-bold mb-6">Manage Reviews</h1>

      <div className="border rounded-lg mb-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Rating</TableHead>
              <TableHead>Comment</TableHead>
              <TableHead>Product</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {reviews.map((review) => (
              <TableRow key={review.id}>
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
                    <Button variant="ghost" size="icon" className="text-destructive">
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
