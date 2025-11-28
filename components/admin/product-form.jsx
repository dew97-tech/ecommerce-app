'use client'

import { MarkdownEditor } from '@/components/markdown-editor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createProduct, updateProduct } from '@/lib/admin-actions'
import { Plus, Trash2 } from 'lucide-react'
import { useActionState, useFormStatus, useState } from 'react'

function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? 'Updating...' : 'Creating...') : (isEditing ? 'Update Product' : 'Create Product')}
    </Button>
  )
}

export function ProductForm({ product, categories }) {
  const initialState = { message: null, errors: {} }
  const updateProductWithId = updateProduct.bind(null, product?.id)
  const [state, dispatch] = useActionState(product ? updateProductWithId : createProduct, initialState)
  
  const [description, setDescription] = useState(product?.description || '')
  const [variants, setVariants] = useState(
    product?.variants || [{ color: '', size: '', capacity: '', stock: 0, price: 0 }]
  )

  const addVariant = () => {
    setVariants([...variants, { color: '', size: '', capacity: '', stock: 0, price: 0 }])
  }

  const removeVariant = (index) => {
    setVariants(variants.filter((_, i) => i !== index))
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...variants]
    newVariants[index] = { ...newVariants[index], [field]: value }
    setVariants(newVariants)
  }

  return (
    <form action={(formData) => {
      formData.set('description', description)
      formData.set('variants', JSON.stringify(variants))
      dispatch(formData)
    }}>
      <Card>
        <CardHeader>
          <CardTitle>{product ? 'Edit Product' : 'New Product'}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" defaultValue={product?.name} required />
            {state.errors?.name && <p className="text-red-500 text-sm">{state.errors.name}</p>}
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="slug">Slug</Label>
            <Input id="slug" name="slug" defaultValue={product?.slug} required />
            {state.errors?.slug && <p className="text-red-500 text-sm">{state.errors.slug}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="brand">Brand</Label>
              <Input id="brand" name="brand" defaultValue={product?.brand} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="productCode">Product Code</Label>
              <Input id="productCode" name="productCode" defaultValue={product?.productCode} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="shortDescription">Short Description (Key Features)</Label>
            <Input id="shortDescription" name="shortDescription" defaultValue={product?.shortDescription} placeholder="Comma separated features" />
          </div>

          <div className="grid gap-2">
            <Label>Description (Markdown or JSON)</Label>
            <MarkdownEditor 
              value={description}
              onChange={setDescription}
              placeholder="Write product description..."
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="specifications">Specifications (JSON Format)</Label>
            <textarea 
                id="specifications" 
                name="specifications" 
                defaultValue={product?.specifications} 
                className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="{'Category': {'Key': 'Value'}}"
            />
            <p className="text-xs text-muted-foreground">Enter specifications as a JSON object or Python-style dictionary string.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="price">Base Price</Label>
              <Input id="price" name="price" type="number" defaultValue={product?.price} required />
              {state.errors?.price && <p className="text-red-500 text-sm">{state.errors.price}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="discountedPrice">Discounted Price</Label>
              <Input id="discountedPrice" name="discountedPrice" type="number" defaultValue={product?.discountedPrice} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="stock">Base Stock</Label>
            <Input id="stock" name="stock" type="number" defaultValue={product?.stock} required />
            {state.errors?.stock && <p className="text-red-500 text-sm">{state.errors.stock}</p>}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select name="categoryId" defaultValue={product?.categoryId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {state.errors?.categoryId && <p className="text-red-500 text-sm">{state.errors.categoryId}</p>}
          </div>

          <div className="grid gap-2">
            <Label>Images</Label>
            <Tabs defaultValue="url" className="w-full">
              <TabsList className="grid w-full grid-cols-2 max-w-[400px]">
                <TabsTrigger value="url">Image URLs</TabsTrigger>
                <TabsTrigger value="file">Upload Images</TabsTrigger>
              </TabsList>
              
              <TabsContent value="url" className="mt-4">
                 <Label htmlFor="images">Image URLs (Comma separated)</Label>
                 <Input id="images" name="images" defaultValue={product?.images} placeholder="https://example.com/1.jpg, https://example.com/2.jpg" />
              </TabsContent>
              
              <TabsContent value="file" className="mt-4">
                 <Label htmlFor="imageFiles">Upload Images (Multiple)</Label>
                 <Input id="imageFiles" name="imageFiles" type="file" accept="image/*" multiple />
                 <p className="text-xs text-muted-foreground mt-1">Uploading new files will replace existing images.</p>
              </TabsContent>
            </Tabs>
            <input type="hidden" name="uploadMode" value="auto" /> 
            {state.errors?.images && <p className="text-red-500 text-sm">{state.errors.images}</p>}
          </div>

          {/* Variants Section */}
          <div className="space-y-4 border-t pt-6">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-lg">Product Variants</Label>
                <p className="text-sm text-muted-foreground">Add color, size, or capacity options</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            {variants.map((variant, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="grid gap-2">
                    <Label>Color</Label>
                    <Input 
                      value={variant.color}
                      onChange={(e) => updateVariant(index, 'color', e.target.value)}
                      placeholder="e.g., Black, Blue"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Size</Label>
                    <Input 
                      value={variant.size}
                      onChange={(e) => updateVariant(index, 'size', e.target.value)}
                      placeholder="e.g., M, L, XL"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Capacity</Label>
                    <Input 
                      value={variant.capacity}
                      onChange={(e) => updateVariant(index, 'capacity', e.target.value)}
                      placeholder="e.g., 128GB, 256GB"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Stock</Label>
                    <Input 
                      type="number"
                      value={variant.stock}
                      onChange={(e) => updateVariant(index, 'stock', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>Price Adjustment</Label>
                    <Input 
                      type="number"
                      value={variant.price}
                      onChange={(e) => updateVariant(index, 'price', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button 
                      type="button" 
                      variant="destructive" 
                      size="sm"
                      onClick={() => removeVariant(index)}
                      disabled={variants.length === 1}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="isTrending" name="isTrending" defaultChecked={product?.isTrending} />
            <Label htmlFor="isTrending">Trending Product</Label>
          </div>

          <div aria-live="polite" aria-atomic="true">
            {state.message && <p className="text-red-500 text-sm">{state.message}</p>}
          </div>

          <SubmitButton isEditing={!!product} />
        </CardContent>
      </Card>
    </form>
  )
}
