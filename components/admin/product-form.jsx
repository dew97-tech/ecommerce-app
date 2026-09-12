'use client'

import { FieldError, FormField } from '@/components/admin/form-field'
import { FormPanel } from '@/components/admin/form-panel'
import { ProductDeleteButton } from '@/components/admin/product-delete-button'
import { ProductImageManager } from '@/components/admin/product-images-manager'
import { ProductSpecificationsField } from '@/components/admin/product-specifications-field'
import { ProductVariantsEditor } from '@/components/admin/product-variants-editor'
import { RichTextEditor } from '@/components/admin/rich-text-editor'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createProduct, updateProduct } from '@/lib/actions/admin-products'
import { parseImages } from '@/lib/images'
import { ArrowLeft, Copy, ExternalLink, Loader2, Plus, Save } from 'lucide-react'
import { marked } from 'marked'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useActionState, useEffect, useRef, useState } from 'react'
import { useFormStatus } from 'react-dom'
import { toast } from 'sonner'

const AVAILABILITY_OPTIONS = [
  { value: 'IN_STOCK', label: 'In stock' },
  { value: 'OUT_OF_STOCK', label: 'Out of stock' },
  { value: 'PRE_ORDER', label: 'Pre order' },
  { value: 'UP_COMING', label: 'Upcoming' },
  { value: 'DISCONTINUED', label: 'Discontinued' },
]

const HTML_START = /^\s*<[a-z!/]/i

function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function toDescriptionHtml(value) {
  if (!value) return ''
  if (HTML_START.test(value)) return value
  try {
    return marked.parse(value)
  } catch {
    return value
  }
}

function formatDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('en-GB', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'UTC',
  }).format(date)
}

function SubmitButton({ isEditing }) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" size="sm" disabled={pending} className="gap-1.5">
      {pending ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Saving…
        </>
      ) : (
        <>
          <Save className="h-3.5 w-3.5" />
          {isEditing ? 'Save changes' : 'Create product'}
        </>
      )}
    </Button>
  )
}

function DetailRow({ label, value }) {
  if (!value) return null
  return (
    <div className="flex items-start justify-between gap-3">
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd className="min-w-0 truncate text-right font-medium text-foreground" title={String(value)}>
        {value}
      </dd>
    </div>
  )
}

export function ProductForm({ product, categories }) {
  const isEditing = Boolean(product)
  const router = useRouter()
  const boundUpdate = isEditing ? updateProduct.bind(null, product.id) : null
  const [state, dispatch] = useActionState(isEditing ? boundUpdate : createProduct, {
    message: null,
    errors: {},
  })

  const [name, setName] = useState(product?.name ?? '')
  const [slug, setSlug] = useState(product?.slug ?? '')
  const [description, setDescription] = useState(() =>
    toDescriptionHtml(product?.description)
  )
  const [imageUrls, setImageUrls] = useState(() => parseImages(product?.images))
  const [variants, setVariants] = useState(() =>
    (product?.variants ?? []).map((variant) => ({
      color: variant.color ?? '',
      size: variant.size ?? '',
      capacity: variant.capacity ?? '',
      stock: variant.stock ?? 0,
      price: variant.price ?? 0,
    }))
  )
  const [price, setPrice] = useState(product?.price ?? '')
  const [discountedPrice, setDiscountedPrice] = useState(
    product?.discountedPrice ?? ''
  )
  const [stock, setStock] = useState(product?.stock ?? 0)
  const [isActive, setIsActive] = useState(
    product ? Boolean(product.isActive) : true
  )
  const [isTrending, setIsTrending] = useState(Boolean(product?.isTrending))
  const [availability, setAvailability] = useState(
    product?.availabilityStatus ?? 'IN_STOCK'
  )
  const dirtyRef = useRef(false)

  useEffect(() => {
    if (!state?.success) return
    dirtyRef.current = false
    toast.success(state.message || 'Saved.')
    if (!isEditing && state.productId) {
      router.replace(`/admin/products/${state.productId}`)
    } else {
      router.refresh()
    }
  }, [state, isEditing, router])

  useEffect(() => {
    if (state?.success || state?.errors || !state?.message) return
    toast.error(state.message)
  }, [state])

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (!dirtyRef.current) return
      event.preventDefault()
      event.returnValue = ''
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => window.removeEventListener('beforeunload', handleBeforeUnload)
  }, [])

  const markDirty = () => {
    dirtyRef.current = true
  }

  const addVariant = () =>
    setVariants([
      ...variants,
      { color: '', size: '', capacity: '', stock: 0, price: 0 },
    ])

  const handleGenerateSlug = () => {
    setSlug(slugify(name))
    markDirty()
  }

  const handleCopySlug = async () => {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/products/${slug}`
      )
      toast.success('Product URL copied.')
    } catch {
      toast.error('Could not copy the URL.')
    }
  }

  const numericPrice = Number(price) || 0
  const numericDiscounted = discountedPrice === '' ? null : Number(discountedPrice)
  const sellingPrice =
    numericDiscounted && numericDiscounted > 0 ? numericDiscounted : numericPrice
  const discountPercent =
    numericPrice > 0 && sellingPrice < numericPrice
      ? Math.round(((numericPrice - sellingPrice) / numericPrice) * 100)
      : 0
  const lowStock = Number(stock) <= 5

  return (
    <form
      action={(formData) => {
        formData.set('description', description)
        formData.set('variants', JSON.stringify(variants))
        formData.set('images', JSON.stringify(imageUrls))
        formData.set('isActive', isActive ? 'on' : '')
        formData.set('isTrending', isTrending ? 'on' : '')
        formData.set('availabilityStatus', availability)
        dispatch(formData)
      }}
      onInput={markDirty}
      className="pb-10"
    >
      <div className="sticky top-16 z-30 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/85">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 md:px-6">
          <Button asChild variant="ghost" size="icon" className="-ml-2 h-8 w-8">
            <Link href="/admin/products" aria-label="Back to products">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>

          <div className="flex min-w-0 items-center gap-2">
            <h1 className="truncate text-base font-semibold text-foreground">
              {isEditing ? 'Edit product' : 'New product'}
            </h1>
            {isEditing && (
              <Badge variant={isActive ? 'success' : 'secondary'}>
                {isActive ? 'Active' : 'Archived'}
              </Badge>
            )}
            {isEditing && product.productCode && (
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {product.productCode}
              </span>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {isEditing && (
              <Button
                asChild
                variant="outline"
                size="sm"
                className="hidden sm:inline-flex"
              >
                <Link
                  href={`/products/${product.slug}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                  View on store
                </Link>
              </Button>
            )}
            {isEditing && (
              <ProductDeleteButton
                productId={product.id}
                productName={product.name}
                redirectTo="/admin/products"
              />
            )}
            <SubmitButton isEditing={isEditing} />
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 px-4 py-6 md:px-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="min-w-0 space-y-6">
          <FormPanel title="General">
            <div className="space-y-4">
              <FormField
                label="Name"
                htmlFor="name"
                required
                error={state.errors?.name}
              >
                <Input
                  id="name"
                  name="name"
                  value={name}
                  onChange={(event) => {
                    setName(event.target.value)
                    markDirty()
                  }}
                  required
                  aria-invalid={Boolean(state.errors?.name)}
                />
              </FormField>

              <FormField
                label="Slug"
                htmlFor="slug"
                required
                error={state.errors?.slug}
              >
                <div className="flex gap-2">
                  <Input
                    id="slug"
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value)
                      markDirty()
                    }}
                    required
                    aria-invalid={Boolean(state.errors?.slug)}
                    className="font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateSlug}
                    className="shrink-0"
                  >
                    Generate
                  </Button>
                </div>
                {isEditing && slug !== product.slug && (
                  <p className="text-xs font-medium text-warning">
                    Changing the slug breaks existing storefront links.
                  </p>
                )}
                {slug && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="truncate">/products/{slug}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 shrink-0"
                      onClick={handleCopySlug}
                      aria-label="Copy product URL"
                      title="Copy product URL"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
              </FormField>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField label="Brand" htmlFor="brand">
                  <Input
                    id="brand"
                    name="brand"
                    defaultValue={product?.brand ?? ''}
                  />
                </FormField>
                <FormField label="Product code" htmlFor="productCode">
                  <Input
                    id="productCode"
                    name="productCode"
                    defaultValue={product?.productCode ?? ''}
                  />
                </FormField>
              </div>

              <FormField
                label="Category"
                htmlFor="categoryId"
                required
                error={state.errors?.categoryId}
              >
                <Select
                  name="categoryId"
                  defaultValue={product?.categoryId ?? undefined}
                  required
                >
                  <SelectTrigger
                    id="categoryId"
                    aria-invalid={Boolean(state.errors?.categoryId)}
                  >
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
              </FormField>
            </div>
          </FormPanel>

          <FormPanel
            title="Description"
            description="Rendered in the Description tab on the product page."
          >
            <div className="space-y-4">
              <FormField
                label="Key features"
                htmlFor="shortDescription"
                hint="Comma separated; each item becomes a bullet on the product page."
              >
                <Input
                  id="shortDescription"
                  name="shortDescription"
                  defaultValue={product?.shortDescription ?? ''}
                />
              </FormField>

              <div className="space-y-1.5">
                <Label>Full description</Label>
                <RichTextEditor
                  value={description}
                  onChange={(html) => {
                    setDescription(html)
                    markDirty()
                  }}
                  placeholder="Write the product description..."
                  minHeightClassName="min-h-[240px]"
                />
                <FieldError>{state.errors?.description}</FieldError>
              </div>
            </div>
          </FormPanel>

          <FormPanel
            title="Specifications"
            description="Key/value pairs shown in the Specification tab."
          >
            <ProductSpecificationsField
              name="specifications"
              initialValue={product?.specifications ?? ''}
            />
          </FormPanel>

          <FormPanel
            title="Variants"
            description="Optional. Use for color, size or capacity options."
            action={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={addVariant}
              >
                <Plus className="h-3.5 w-3.5" />
                Add variant
              </Button>
            }
          >
            <ProductVariantsEditor
              variants={variants}
              onChange={(next) => {
                setVariants(next)
                markDirty()
              }}
            />
          </FormPanel>
        </div>

        <div className="space-y-6">
          <FormPanel title="Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Active</p>
                  <p className="text-xs text-muted-foreground">
                    Visible on the storefront.
                  </p>
                </div>
                <Switch
                  checked={isActive}
                  onCheckedChange={(value) => {
                    setIsActive(value)
                    markDirty()
                  }}
                  label="Active"
                />
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">Trending</p>
                  <p className="text-xs text-muted-foreground">
                    Feature on the home page.
                  </p>
                </div>
                <Switch
                  checked={isTrending}
                  onCheckedChange={(value) => {
                    setIsTrending(value)
                    markDirty()
                  }}
                  label="Trending"
                />
              </div>

              <FormField label="Availability" htmlFor="availabilityStatus">
                <Select
                  value={availability}
                  onValueChange={(value) => {
                    setAvailability(value)
                    markDirty()
                  }}
                >
                  <SelectTrigger id="availabilityStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABILITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormField>
            </div>
          </FormPanel>

          <FormPanel title="Pricing">
            <div className="space-y-4">
              <FormField
                label="Base price (৳)"
                htmlFor="price"
                required
                error={state.errors?.price}
              >
                <Input
                  id="price"
                  name="price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={price}
                  onChange={(event) => {
                    setPrice(event.target.value)
                    markDirty()
                  }}
                  required
                  aria-invalid={Boolean(state.errors?.price)}
                />
              </FormField>

              <FormField
                label="Discounted price (৳)"
                htmlFor="discountedPrice"
                hint="Leave empty for no discount."
              >
                <Input
                  id="discountedPrice"
                  name="discountedPrice"
                  type="number"
                  min="0"
                  step="0.01"
                  value={discountedPrice ?? ''}
                  onChange={(event) => {
                    setDiscountedPrice(event.target.value)
                    markDirty()
                  }}
                />
              </FormField>

              <div className="flex items-center justify-between rounded-md bg-muted/60 px-3 py-2 text-xs">
                <span className="text-muted-foreground">Selling price</span>
                <span className="font-semibold text-price">
                  ৳{sellingPrice.toLocaleString('en-US')}
                  {discountPercent > 0 && (
                    <span className="ml-1.5 font-normal text-muted-foreground">
                      {discountPercent}% off
                    </span>
                  )}
                </span>
              </div>
            </div>
          </FormPanel>

          <FormPanel title="Inventory">
            <FormField
              label="Stock quantity"
              htmlFor="stock"
              required
              error={state.errors?.stock}
              hint={
                lowStock
                  ? 'Low stock — highlighted on the products list.'
                  : 'Update when new stock arrives.'
              }
            >
              <Input
                id="stock"
                name="stock"
                type="number"
                min="0"
                value={stock}
                onChange={(event) => {
                  setStock(event.target.value)
                  markDirty()
                }}
                required
                aria-invalid={Boolean(state.errors?.stock)}
              />
            </FormField>
          </FormPanel>

          <FormPanel
            title="Media"
            description="First image is the storefront cover."
          >
            <ProductImageManager
              value={imageUrls}
              onChange={(urls) => {
                setImageUrls(urls)
                markDirty()
              }}
            />
            <FieldError className="mt-2">{state.errors?.images}</FieldError>
          </FormPanel>

          {isEditing && (
            <FormPanel title="Details">
              <dl className="space-y-2.5 text-xs">
                <DetailRow label="Product ID" value={product.id} />
                <DetailRow label="Created" value={formatDateTime(product.createdAt)} />
                <DetailRow label="Updated" value={formatDateTime(product.updatedAt)} />
                {product.sourceStatus && (
                  <DetailRow label="Source status" value={product.sourceStatus} />
                )}
                {product.lastSyncedAt && (
                  <DetailRow
                    label="Last synced"
                    value={formatDateTime(product.lastSyncedAt)}
                  />
                )}
              </dl>
              {product.sourceUrl && (
                <a
                  href={product.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  Source listing
                  <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </FormPanel>
          )}
        </div>
      </div>
    </form>
  )
}
