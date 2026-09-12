'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { parseProductData } from '@/lib/product-parser'
import { useState } from 'react'

function isStrictJsonObject(value) {
  if (typeof value !== 'string' || !value.trim()) return false

  try {
    const parsed = JSON.parse(value)
    return parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)
  } catch (error) {
    return false
  }
}

function validateSpecifications(value) {
  if (typeof value !== 'string' || !value.trim()) return 'empty'
  if (isStrictJsonObject(value)) return 'valid'

  const parsed = parseProductData(value)
  if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) return 'valid'

  return 'invalid'
}

export function ProductSpecificationsField({ name = 'specifications', initialValue = '' }) {
  const [value, setValue] = useState(typeof initialValue === 'string' ? initialValue : '')

  const status = validateSpecifications(value)
  const canFormat = isStrictJsonObject(value)

  function handleFormat() {
    setValue(JSON.stringify(JSON.parse(value), null, 2))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={!canFormat}
          onClick={handleFormat}
        >
          Format
        </Button>
        <span className="text-xs text-muted-foreground">{value.length} characters</span>
      </div>

      <Textarea
        name={name}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        rows={10}
        spellCheck={false}
        className="font-mono text-xs leading-relaxed"
      />

      {status === 'invalid' && (
        <p className="text-xs font-medium text-warning">
          Not valid JSON — the storefront will not render these specifications.
        </p>
      )}
    </div>
  )
}
