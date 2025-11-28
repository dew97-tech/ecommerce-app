'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { deleteCategories, deleteCategory } from "@/lib/admin-category-actions"
import { useCategorySelectionStore } from "@/lib/stores/category-selection-store"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { toast } from "sonner"
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog"

export function CategoriesTable({ categories }) {
  const { selectedIds, toggleId, selectIds, deselectIds, clearSelection } = useCategorySelectionStore()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null) // For single item delete

  // Check if all items on CURRENT page are selected
  const allOnPageSelected = categories.length > 0 && categories.every(c => selectedIds.includes(c.id))

  const toggleSelectAll = () => {
    if (allOnPageSelected) {
      // Deselect all on current page
      deselectIds(categories.map(c => c.id))
    } else {
      // Select all on current page
      selectIds(categories.map(c => c.id))
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
        // Single delete
        const result = await deleteCategory(itemToDelete)
        if (result.message.includes("success")) {
          toast.success(result.message)
          // Also remove from selection if it was selected
          if (selectedIds.includes(itemToDelete)) {
             toggleId(itemToDelete)
          }
        } else {
          toast.error(result.message)
        }
      } else {
        // Bulk delete
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
    <div className="space-y-4">
      <DeleteConfirmationDialog 
        open={showDeleteDialog} 
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleConfirmDelete}
        title={itemToDelete ? "Delete Category?" : `Delete ${selectedIds.length} Categories?`}
        description={itemToDelete 
            ? "Are you sure you want to delete this category? This action cannot be undone." 
            : `Are you sure you want to delete ${selectedIds.length} categories? This action cannot be undone.`
        }
      />

      {selectedIds.length > 0 && (
        <div className="bg-accent/30 p-2 rounded-lg flex items-center justify-between">
          <span className="text-sm font-medium px-2">{selectedIds.length} selected</span>
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={handleBulkDeleteClick}
            disabled={isDeleting}
            className="gap-2"
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        </div>
      )}

      <div className="rounded-md bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead className="w-[50px]">
                <Checkbox 
                  checked={allOnPageSelected}
                  onCheckedChange={toggleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold">Name</TableHead>
              <TableHead className="font-semibold">Slug</TableHead>
              <TableHead className="font-semibold">Products</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground">
                  No categories found.
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={category.id} className="hover:bg-muted/50 transition-colors">
                  <TableCell>
                    <Checkbox 
                      checked={selectedIds.includes(category.id)}
                      onCheckedChange={() => toggleId(category.id)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {category.name}
                      {category.isFeatured && (
                        <Badge variant="secondary" className="text-[10px] h-5">Featured</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{category.slug}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{category._count.products} products</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Link href={`/admin/categories/${category.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-primary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:text-destructive"
                          onClick={() => handleDeleteClick(category.id)}
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
