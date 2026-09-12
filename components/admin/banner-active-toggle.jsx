'use client'

import { setBannerActive } from '@/lib/actions/admin-banners'
import { cn } from '@/lib/utils'
import { useState } from 'react'
import { toast } from 'sonner'

export function BannerActiveToggle({ bannerId, isActive, label }) {
  const [active, setActive] = useState(Boolean(isActive))
  const [isPending, setIsPending] = useState(false)

  const handleToggle = async () => {
    if (isPending) return

    const next = !active
    setActive(next)
    setIsPending(true)

    const result = await setBannerActive(bannerId, next)
    setIsPending(false)

    if (result?.message?.toLowerCase().includes('fail')) {
      setActive(!next)
      toast.error(result.message)
      return
    }

    toast.success(result.message)
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        role="switch"
        aria-checked={active}
        aria-label={`${active ? 'Hide' : 'Show'} ${label || 'banner'}`}
        disabled={isPending}
        onClick={handleToggle}
        className={cn(
          'relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:opacity-60',
          active ? 'bg-success' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-[left] duration-200',
            active ? 'left-[18px]' : 'left-0.5'
          )}
        />
      </button>
      <span className="text-xs font-medium text-muted-foreground">
        {active ? 'Active' : 'Hidden'}
      </span>
    </div>
  )
}
