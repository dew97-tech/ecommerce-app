import { Button } from "@/components/ui/button";
import { Cpu } from "lucide-react";
import Link from "next/link";

export function PcBuilderBand() {
  return (
    <section className="rounded-xl border border-border bg-primary/5 p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            PC Builder
          </p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Build your perfect PC
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick your parts with live prices and stock, plus compatibility
            checks for socket, memory type and power headroom.
          </p>
        </div>

        <Button asChild size="lg" className="shrink-0">
          <Link href="/pc-builder">
            <Cpu className="mr-2 h-4 w-4" />
            Start building
          </Link>
        </Button>
      </div>
    </section>
  );
}
