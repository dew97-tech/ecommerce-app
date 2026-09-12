"use client"

import { Button } from "@/components/ui/button"
import { Check, Facebook, Link2, MessageCircle } from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

export function BlogShare({ title }) {
  const [copied, setCopied] = useState(false)

  const currentUrl = () =>
    typeof window !== "undefined" ? window.location.href : ""

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl())}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(`${title} ${currentUrl()}`)}`,
      "_blank",
      "noopener,noreferrer"
    )
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl())
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success("Link copied")
    } catch {
      toast.error("Could not copy the link")
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-sm text-muted-foreground">Share</span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleFacebook}
      >
        <Facebook className="h-4 w-4" />
        Facebook
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleWhatsApp}
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-1.5"
        onClick={handleCopy}
      >
        {copied ? (
          <Check className="h-4 w-4" />
        ) : (
          <Link2 className="h-4 w-4" />
        )}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  )
}
