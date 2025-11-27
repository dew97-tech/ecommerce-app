'use client'

import { motion } from "framer-motion"

export function HomeWrapper({ children }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="space-y-20 pb-20 bg-gradient-to-b from-background via-background to-secondary/5"
    >
      {children}
      
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
        <div className="absolute top-[10%] left-[5%] w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-[40%] right-[5%] w-96 h-96 bg-secondary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-[10%] left-[20%] w-64 h-64 bg-accent/5 rounded-full blur-3xl" />
      </div>
    </motion.div>
  )
}
