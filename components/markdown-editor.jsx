'use client'

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Bold, Code, Heading2, Italic, Link as LinkIcon, List, ListOrdered } from "lucide-react"
import { useState } from 'react'
import { MarkdownRenderer } from "./markdown-renderer"

export function MarkdownEditor({ value, onChange, placeholder = "Write your content in markdown..." }) {
  const [activeTab, setActiveTab] = useState("edit")

  const insertMarkdown = (before, after = '') => {
    const textarea = document.getElementById('markdown-textarea')
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end)
    onChange(newText)
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length)
    }, 0)
  }

  const toolbarButtons = [
    { icon: Bold, label: 'Bold', before: '**', after: '**' },
    { icon: Italic, label: 'Italic', before: '_', after: '_' },
    { icon: Heading2, label: 'Heading', before: '## ', after: '' },
    { icon: List, label: 'Bullet List', before: '- ', after: '' },
    { icon: ListOrdered, label: 'Numbered List', before: '1. ', after: '' },
    { icon: LinkIcon, label: 'Link', before: '[', after: '](url)' },
    { icon: Code, label: 'Code', before: '`', after: '`' },
  ]

  return (
    <div className="border rounded-lg overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b bg-muted/50 p-2 flex items-center justify-between">
          <div className="flex gap-1">
            {toolbarButtons.map((btn) => (
              <Button
                key={btn.label}
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => insertMarkdown(btn.before, btn.after)}
                title={btn.label}
              >
                <btn.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          <TabsList>
            <TabsTrigger value="edit">Edit</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="edit" className="m-0">
          <Textarea
            id="markdown-textarea"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] border-0 focus-visible:ring-0 font-mono text-sm resize-none"
          />
        </TabsContent>
        
        <TabsContent value="preview" className="m-0 p-4 min-h-[400px] prose prose-sm max-w-none dark:prose-invert">
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-muted-foreground italic">Nothing to preview yet...</p>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
