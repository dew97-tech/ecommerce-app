'use client'

import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"

export function Providers({ children, session }) {
  return (
    <SessionProvider session={session}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        forcedTheme="light"
        disableTransitionOnChange
      >
        {children}
      </ThemeProvider>
    </SessionProvider>
  )
}
