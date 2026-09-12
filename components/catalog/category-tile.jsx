import { CategoryIcon } from "@/components/catalog/category-icon"
import { cn } from "@/lib/utils"
import Image from "next/image"

export function isCategoryTile(image) {
  return Boolean(image) && !String(image).includes("placehold.co")
}

export function CategoryTile({
  name,
  image,
  className,
  iconClassName,
  sizes = "96px",
  priority = false,
}) {
  if (!isCategoryTile(image)) {
    return (
      <span
        className={cn(
          "flex shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary",
          className
        )}
      >
        <CategoryIcon name={name} className={iconClassName ?? "h-5 w-5"} />
      </span>
    )
  }

  return (
    <span
      className={cn(
        "relative block shrink-0 overflow-hidden rounded-xl bg-muted",
        className
      )}
    >
      <Image
        src={image}
        alt=""
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
      />
    </span>
  )
}
