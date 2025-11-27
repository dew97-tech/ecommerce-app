'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function FeaturedBlogs({ blogs }) {
  if (!blogs || blogs.length === 0) return null

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Latest from Our Blog</h2>
            <p className="text-muted-foreground mt-1">Stay updated with our latest news and articles</p>
          </div>
          <Link href="/blogs">
            <Button variant="outline" className="gap-2">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogs.map((blog, index) => (
          <FadeIn key={blog.id} delay={index * 0.1}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <Link href={`/blogs/${blog.slug}`}>
                <Card className="group overflow-hidden h-full flex flex-col border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-card/50 backdrop-blur-sm">
                  <div className="relative aspect-video overflow-hidden bg-gray-100">
                    <Image
                      src={blog.imageUrl || "/placeholder.png"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <CardHeader className="flex-1">
                    <h3 className="font-bold text-xl line-clamp-2 group-hover:text-primary transition-colors">
                      {blog.title}
                    </h3>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between text-xs text-muted-foreground border-t pt-4">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      <span>{blog.author?.name || 'Admin'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </CardFooter>
                </Card>
              </Link>
            </motion.div>
          </FadeIn>
        ))}
      </div>
    </div>
  )
}
