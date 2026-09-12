'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { CategoryTile } from "@/components/catalog/category-tile"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { deleteCategories, deleteCategory } from "@/lib/actions/admin-categories"
import { useCategorySelectionStore } from "@/store/category-selection-store"
import { Edit, FolderTree, Trash2, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

export function CategoriesTable({ categories }) {
  const { selectedIds, toggleId, selectIds, deselectIds, clearSelection } =
    useCategorySelectionStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  const allOnPageSelected =
    categories.length > 0 &&
    categories.every((category) => selectedIds.includes(category.id))

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      deselectIds(categories.map((category) => category.id))
    } else {
      selectIds(categories.map((category) => category.id))
    }
  }

  const handleBulkDeleteClick = () => {
    setShowDeleteDialog(true)
    setItemToDelete(null)
  }

  const handleDeleteClick = (id) => {
    setItemToDelete(id)
    setShowDeleteDialog(true)
  }

  const handleConfirmDelete = async () => {
    setIsDeleting(true)
    setShowDeleteDialog(false)

    try {
      if (itemToDelete) {
        const result = await deleteCategory(itemToDelete)
        if (result.message.includes("success")) {
          toast.success(result.message)
          if (selectedIds.includes(itemToDelete)) {
            toggleId(itemToDelete)
          }
        } else {
          toast.error(result.message)
        }
      } else {
        const result = await deleteCategories(selectedIds)
        if (result.message.includes("success")) {
          toast.success(result.message)
          clearSelection()
        } else {
          toast.error(result.message)
        }
      }
    } catch (error) {
      toast.error("An error occurred during deletion")
    } finally {
      setIsDeleting(false)
      setItemToDelete(null)
    }
  }

  return (
    <div>
      <DeleteConfirmationDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={
          itemToDelete
            ? "Delete Category?"
            : `Delete ${selectedIds.length} Categories?`
        }
        description={
          itemToDelete
            ? "Are you sure you want to delete this category? This action cannot be undone."
            : `Are you sure you want to delete ${selectedIds.length} categories? This action cannot be undone.`
        }
      />

      {selectedIds.length > 0 && (
        <div className="pointer-events-none fixed inset-x-0 bottom-6 z-40 flex justify-center px-4">
          <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-border bg-popover px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.length} selected
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={clearSelection}
            >
              <X className="mr-1.5 h-3.5 w-3.5" />
              Clear
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleBulkDeleteClick}
              disabled={isDeleting}
            >
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Delete
            </Button>
          </div>
        </div>
      )}

      <div className="rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 hover:bg-muted/40">
              <TableHead className="w-[48px]">
                <Checkbox
                  checked={allOnPageSelected}
                  onCheckedChange={toggleSelectAll}
                  aria-label="Select all categories on this page"
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Parent</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="py-12 text-center text-muted-foreground"
                >
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/40">
                  <TableCell>
                    <Checkbox
                      checked={selectedIds.includes(category.id)}
                      onCheckedChange={() => toggleId(category.id)}
                      aria-label={`Select ${category.name}`}
                    />
                  </TableCell>

                  <TableCell className="font-medium">
                    <div
                      className={
                        category.parentId
                          ? "flex items-center gap-2 pl-5"
                          : "flex items-center gap-2"
                      }
                    >
                      {category.parentId && (
                        <FolderTree className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <CategoryTile
                        name={category.name}
                        image={category.image}
                        className="h-8 w-8"
                        iconClassName="h-4 w-4"
                        sizes="32px"
                      />
                      <span className="truncate">{category.name}</span>
                      {category.isFeatured && (
                        <Badge variant="secondary" className="h-5 text-[10px]">
                          Featured
                        </Badge>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-muted-foreground">
                    {category.parent?.name || "—"}
                  </TableCell>

                  <TableCell className="max-w-[220px] truncate text-muted-foreground">
                    {category.slug}
                  </TableCell>

                  <TableCell>
                    <Badge variant="outline">
                      {category._count.products} products
                    </Badge>
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1.5">
                      <Button
                        asChild
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-primary"
                      >
                        <Link
                          href={`/admin/categories/${category.id}`}
                          aria-label={`Edit ${category.name}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        onClick={() => handleDeleteClick(category.id)}
                        aria-label={`Delete ${category.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
