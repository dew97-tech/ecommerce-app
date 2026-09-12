"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  AppWindow,
  BatteryCharging,
  Box,
  CircuitBoard,
  Cpu,
  Fan,
  HardDrive,
  Headphones,
  Keyboard,
  MemoryStick,
  MonitorPlay,
  Mouse,
  PlugZap,
  RefreshCw,
  Trash2,
  Tv,
} from "lucide-react";
import Link from "next/link";
import { createElement } from "react";

const SLOT_ICONS = {
  cpu: Cpu,
  motherboard: CircuitBoard,
  ram: MemoryStick,
  storage: HardDrive,
  gpu: MonitorPlay,
  casing: Box,
  psu: PlugZap,
  cooler: Fan,
  os: AppWindow,
  monitor: Tv,
  keyboard: Keyboard,
  mouse: Mouse,
  headset: Headphones,
  ups: BatteryCharging,
};

function SlotIcon({ slotKey, className }) {
  return createElement(SLOT_ICONS[slotKey] ?? Box, { className });
}

function isAvailable(product) {
  return (
    product &&
    product.availabilityStatus !== "OUT_OF_STOCK" &&
    product.stock > 0
  );
}

export function SlotList({ groups, items, isLoading, onRemove }) {
  const itemsBySlot = new Map(items.map((item) => [item.slotKey, item]));

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <section key={group.id}>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-foreground">{group.label}</h2>
            <p className="text-sm text-muted-foreground">{group.description}</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            {group.slots.map((slot) => {
              const item = itemsBySlot.get(slot.key);
              const product = item?.product;

              return (
                <div
                  key={slot.key}
                  className={cn(
                    "flex flex-col gap-3 p-4 sm:flex-row sm:items-center",
                    !product && "bg-muted/20"
                  )}
                >
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span
                      className={cn(
                        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                        product
                          ? "bg-primary/10 text-primary"
                          : "bg-muted text-muted-foreground"
                      )}
                    >
                      <SlotIcon slotKey={slot.key} className="h-5 w-5" />
                    </span>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {slot.label}
                        </p>
                        {slot.required && !product && (
                          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-destructive">
                            Required
                          </span>
                        )}
                      </div>

                      {product ? (
                        <div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
                          <Link
                            href={`/products/${product.slug}`}
                            className="truncate text-sm font-medium text-foreground hover:text-primary"
                          >
                            {product.name}
                          </Link>
                          {product.chips?.length > 0 && (
                            <span className="hidden gap-1.5 sm:flex">
                              {product.chips.map((chip) => (
                                <span
                                  key={chip}
                                  className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
                                >
                                  {chip}
                                </span>
                              ))}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {isLoading
                            ? "Loading…"
                            : item?.missing
                              ? "This product is no longer available."
                              : `Choose a ${slot.label.toLowerCase()} for your build.`}
                        </p>
                      )}
                    </div>
                  </div>

                  {product && (
                    <div className="flex shrink-0 items-center gap-4 sm:justify-end">
                      <div className="text-right">
                        <p className="text-sm font-semibold text-price">
                          ৳
                          {(
                            product.discountedPrice ?? product.price
                          ).toLocaleString("en-US")}
                        </p>
                        <p
                          className={cn(
                            "text-xs",
                            isAvailable(product)
                              ? "text-success"
                              : "text-destructive"
                          )}
                        >
                          {isAvailable(product) ? "In stock" : "Out of stock"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/pc-builder/select?slot=${slot.key}`}>
                            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                            Replace
                          </Link>
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => onRemove(slot.key)}
                          aria-label={`Remove ${slot.label}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {!product && (
                    <Button asChild size="sm" className="shrink-0">
                      <Link href={`/pc-builder/select?slot=${slot.key}`}>
                        Choose {slot.label}
                      </Link>
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
