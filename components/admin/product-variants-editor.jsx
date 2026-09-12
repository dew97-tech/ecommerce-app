'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2 } from 'lucide-react'

const GRID_COLUMNS = 'grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)_80px_110px_40px]'

export function ProductVariantsEditor({ variants = [], onChange }) {
  function update(index, field, value) {
    const next = variants.map((variant, i) => {
      if (i !== index) return variant

      const parsedValue =
        field === 'stock'
          ? parseInt(value, 10) || 0
          : field === 'price'
            ? parseFloat(value) || 0
            : value

      return { ...variant, [field]: parsedValue }
    })

    onChange(next)
  }

  function remove(index) {
    onChange(variants.filter((_, i) => i !== index))
  }

  function renderRemoveButton(index) {
    return (
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => remove(index)}
        aria-label={`Remove variant ${index + 1}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    )
  }

  if (!variants.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No variants. Add one if this product comes in multiple options.
      </p>
    )
  }

  return (
    <>
      <div className="hidden md:block">
        <div className={`grid ${GRID_COLUMNS} items-center gap-2 border-b border-border pb-2`}>
          <span className="text-xs font-medium text-muted-foreground">Color</span>
          <span className="text-xs font-medium text-muted-foreground">Size</span>
          <span className="text-xs font-medium text-muted-foreground">Capacity</span>
          <span className="text-xs font-medium text-muted-foreground">Stock</span>
          <span className="text-xs font-medium text-muted-foreground">Price adj.</span>
          <span />
        </div>

        {variants.map((variant, index) => (
          <div
            key={index}
            className={`grid ${GRID_COLUMNS} items-center gap-2 border-b border-border py-2 last:border-b-0`}
          >
            <Input
              value={variant.color ?? ''}
              onChange={(event) => update(index, 'color', event.target.value)}
              placeholder="Black"
              aria-label={`Variant ${index + 1} color`}
              className="h-9"
            />
            <Input
              value={variant.size ?? ''}
              onChange={(event) => update(index, 'size', event.target.value)}
              placeholder="M"
              aria-label={`Variant ${index + 1} size`}
              className="h-9"
            />
            <Input
              value={variant.capacity ?? ''}
              onChange={(event) => update(index, 'capacity', event.target.value)}
              placeholder="256GB"
              aria-label={`Variant ${index + 1} capacity`}
              className="h-9"
            />
            <Input
              type="number"
              value={variant.stock ?? 0}
              onChange={(event) => update(index, 'stock', event.target.value)}
              placeholder="0"
              aria-label={`Variant ${index + 1} stock`}
              className="h-9"
            />
            <Input
              type="number"
              step="any"
              value={variant.price ?? 0}
              onChange={(event) => update(index, 'price', event.target.value)}
              placeholder="0"
              aria-label={`Variant ${index + 1} price adjustment`}
              title="Added to the base price for this variant"
              className="h-9"
            />
            {renderRemoveButton(index)}
          </div>
        ))}
      </div>

      <div className="space-y-3 md:hidden">
        {variants.map((variant, index) => (
          <div key={index} className="rounded-md border border-border p-3 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                Variant {index + 1}
              </span>
              {renderRemoveButton(index)}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor={`variant-${index}-color`}>Color</Label>
                <Input
                  id={`variant-${index}-color`}
                  value={variant.color ?? ''}
                  onChange={(event) => update(index, 'color', event.target.value)}
                  placeholder="Black"
                  aria-label={`Variant ${index + 1} color`}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`variant-${index}-size`}>Size</Label>
                <Input
                  id={`variant-${index}-size`}
                  value={variant.size ?? ''}
                  onChange={(event) => update(index, 'size', event.target.value)}
                  placeholder="M"
                  aria-label={`Variant ${index + 1} size`}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`variant-${index}-capacity`}>Capacity</Label>
                <Input
                  id={`variant-${index}-capacity`}
                  value={variant.capacity ?? ''}
                  onChange={(event) => update(index, 'capacity', event.target.value)}
                  placeholder="256GB"
                  aria-label={`Variant ${index + 1} capacity`}
                  className="h-9"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor={`variant-${index}-stock`}>Stock</Label>
                <Input
                  id={`variant-${index}-stock`}
                  type="number"
                  value={variant.stock ?? 0}
                  onChange={(event) => update(index, 'stock', event.target.value)}
                  placeholder="0"
                  aria-label={`Variant ${index + 1} stock`}
                  className="h-9"
                />
              </div>

              <div className="col-span-2 space-y-2">
                <Label htmlFor={`variant-${index}-price`}>Price adjustment</Label>
                <Input
                  id={`variant-${index}-price`}
                  type="number"
                  step="any"
                  value={variant.price ?? 0}
                  onChange={(event) => update(index, 'price', event.target.value)}
                  placeholder="0"
                  aria-label={`Variant ${index + 1} price adjustment`}
                  title="Added to the base price for this variant"
                  className="h-9"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
