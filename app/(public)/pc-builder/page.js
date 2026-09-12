import { BuilderShell } from "@/components/pc-builder/builder-shell";
import { Cpu } from "lucide-react";

export const metadata = {
  title: "PC Builder",
  description:
    "Build a custom PC with live prices, stock, wattage estimates and compatibility checks.",
};

export default function PcBuilderPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-7xl px-4 py-10">
        <div className="mb-10 max-w-3xl">
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cpu className="h-6 w-6" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            PC Builder
          </h1>
          <p className="mt-2 text-muted-foreground">
            Choose your parts and we will keep track of live prices, stock,
            power headroom and compatibility between the CPU, motherboard,
            memory and case. Add the finished build to your cart or download a
            quotation.
          </p>
        </div>

        <BuilderShell />
      </div>
    </div>
  );
}
