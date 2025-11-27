'use client'

import { FadeIn } from "@/components/animations/fade-in"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { motion } from "framer-motion"
import { ArrowRight, Calendar, PenTool, User } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export function FeaturedBlogs({ blogs }) {
  if (!blogs || blogs.length === 0) return null

  return (
    <div className="space-y-8">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/10 rounded-2xl backdrop-blur-sm">
              <PenTool className="h-8 w-8 text-purple-500" />
            </div>
            <div>
              <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/60 bg-clip-text text-transparent">
                Latest from Our Blog
              </h2>
              <p className="text-muted-foreground mt-1">Stay updated with our latest news</p>
            </div>
          </div>
          <Link href="/blogs">
            <Button variant="outline" className="gap-2 rounded-full glass hover:bg-primary hover:text-white border-0">
              View All
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </FadeIn>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {blogs.map((blog, index) => (
          <FadeIn key={blog.id} delay={index * 0.1}>
            <motion.div
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
              className="h-full"
            >
              <Link href={`/blogs/${blog.slug}`}>
                <Card className="group overflow-hidden h-full flex flex-col border-0 shadow-lg hover:shadow-2xl transition-all duration-300 glass bg-white/40">
                  <div className="relative aspect-video overflow-hidden rounded-t-lg">
                    <Image
                      src={blog.imageUrl || "/placeholder.png"}
                      alt={blog.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-300" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      <div className="flex items-center gap-4 text-xs text-white/80 mb-2">
                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                          <User className="h-3 w-3" />
                          <span>{blog.author?.name || 'Admin'}</span>
                        </div>
                        <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                          <Calendar className="h-3 w-3" />
                          <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <h3 className="font-bold text-xl text-white line-clamp-2 mb-2 group-hover:text-primary-foreground transition-colors">
                        {blog.title}
                      </h3>
                    </div>
                  </div>
                  
                  <CardContent className="flex-1 p-6 pt-4">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                      {blog.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                    </p>
                  </CardContent>
                  
                  <CardFooter className="p-6 pt-0">
                    <span className="text-sm font-medium text-primary flex items-center gap-2 group-hover:gap-3 transition-all">
                      Read Article <ArrowRight className="h-4 w-4" />
                    </span>
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
