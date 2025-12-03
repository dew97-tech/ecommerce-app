import { BuilderLayout } from "@/components/pc-builder/builder-layout"
import { Cpu, Monitor, Zap } from "lucide-react"

export const metadata = {
  title: 'PC Builder - Build Your Dream PC',
  description: 'Select components and build your custom PC with our interactive tool.',
}

export default function PcBuilderPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/20 via-background to-background">
      <div className="container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-16 space-y-6 relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-3xl h-32 bg-primary/20 blur-[100px] -z-10" />
          
          <div className="p-4 bg-background/50 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl mb-2 ring-1 ring-white/20">
            <Monitor className="h-12 w-12 text-primary" />
          </div>
          
          <div className="space-y-4 max-w-3xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/50 bg-clip-text text-transparent">
              Build Your <span className="text-primary">Dream PC</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              Craft your perfect machine with our intelligent builder. 
              <span className="hidden md:inline"> Real-time compatibility checks and pricing updates.</span>
            </p>
          </div>

          <div className="flex gap-4 text-sm font-medium text-muted-foreground bg-accent/50 p-2 rounded-full border border-border/50 backdrop-blur-sm">
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 shadow-sm">
              <Cpu className="h-4 w-4 text-primary" /> Custom Parts
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-background/50 shadow-sm">
              <Zap className="h-4 w-4 text-yellow-500" /> Instant Quote
            </span>
          </div>
        </div>

        <BuilderLayout />
      </div>
    </div>
  )
}
