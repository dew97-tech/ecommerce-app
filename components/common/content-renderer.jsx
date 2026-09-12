import { MarkdownRenderer } from "@/components/common/markdown-renderer"
import { isHtmlContent, sanitizeContentHtml } from "@/lib/sanitize"

export function ContentRenderer({ content, className = "" }) {
  if (!content) return null

  const classes = `rich-content ${className}`.trim()

  if (isHtmlContent(content)) {
    return (
      <div
        className={classes}
        dangerouslySetInnerHTML={{ __html: sanitizeContentHtml(content) }}
      />
    )
  }

  return (
    <div className={classes}>
      <MarkdownRenderer content={content} />
    </div>
  )
}
