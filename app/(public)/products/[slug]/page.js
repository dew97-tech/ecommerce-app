import { ProductDetails } from "@/components/product/product-details"
import { ProductImages } from "@/components/product/product-images"
import { ProductTabs } from "@/components/product/product-tabs"
import { RelatedProducts } from "@/components/product/related-products"
import { JsonLd } from "@/components/seo/json-ld"
import { db } from "@/lib/db"
import { CACHE_TAGS, CACHE_TTL, staggeredTtl } from "@/lib/cache/config"
import { parseImages } from "@/lib/images"
import { breadcrumbSchema, productSchema } from "@/lib/seo/structured-data"
import { unstable_cache } from "next/cache"
import { notFound } from "next/navigation"
import { cache } from "react"

export const dynamic = 'force-dynamic'

const loadProduct = unstable_cache(
  async (slug) =>
    db.product.findFirst({
      where: { slug, isActive: true },
      include: {
        category: true,
        variants: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: { select: { id: true, name: true, image: true } },
          },
          orderBy: { createdAt: 'desc' }
        }
      },
    }),
  ["product-detail"],
  {
    tags: [CACHE_TAGS.products, CACHE_TAGS.reviews],
    revalidate: staggeredTtl(CACHE_TTL.product),
  }
)

const getProduct = cache(loadProduct)

function plainText(value, limit = 160) {
  return String(value ?? "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit)
}

export async function generateMetadata({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    return { title: "Product not found", robots: { index: false, follow: false } }
  }

  const description =
    plainText(product.shortDescription || product.description) ||
    `Buy ${product.name} at RigNexus with genuine warranty and nationwide delivery.`
  const images = parseImages(product.images).slice(0, 4)

  return {
    title: `${product.name} Price in Bangladesh`,
    description,
    alternates: { canonical: `/products/${product.slug}` },
    robots: product.isActive
      ? { index: true, follow: true }
      : { index: false, follow: true },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/products/${product.slug}`,
      images: images.length > 0 ? images.map((image) => ({ url: image })) : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: images.length > 0 ? images : undefined,
    },
  }
}

export default async function ProductDetailsPage({ params }) {
  const { slug } = await params
  const product = await getProduct(slug)

  if (!product) {
    notFound()
  }

  let images = []
  if (product.images) {
    try {
      const parsed = JSON.parse(product.images)
      if (Array.isArray(parsed)) {
        images = parsed
      }
    } catch (e) {
      images = product.images.split(',')
    }
  }

  const breadcrumbs = [
    { name: "Home", path: "/" },
    ...(product.category
      ? [{ name: product.category.name, path: `/categories/${product.category.id}` }]
      : []),
    { name: product.name, path: `/products/${product.slug}` },
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <JsonLd data={productSchema(product)} />
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />

      <div className="grid md:grid-cols-2 gap-8 mb-12">
        <div className="space-y-4">
          <ProductImages images={images} productName={product.name} />
        </div>

        <ProductDetails product={product} />
      </div>

      <div className="grid md:grid-cols-12 gap-8">

         <div className="md:col-span-9">
            <ProductTabs product={product} />
         </div>

         <div className="md:col-span-3">
            <div className="sticky top-20">
              <RelatedProducts categoryId={product.categoryId} currentProductId={product.id} limit={5} />
            </div>
         </div>
      </div>
    </div>
  )
}
