"use client";

import { getBuildState } from "@/lib/actions/pc-builder";
import { downloadBuildQuotation } from "@/lib/pc-builder/pdf";
import {
  BUILDER_SLOT_GROUPS,
  BUILDER_SLOTS,
  getSlotsByGroup,
} from "@/lib/pc-builder/slots";
import { useCartStore } from "@/store/useCartStore";
import { useIsMounted } from "@/lib/use-is-mounted";
import {
  buildBuildParam,
  parseBuildParam,
  usePcBuilderStore,
} from "@/store/usePcBuilderStore";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import { toast } from "sonner";
import { BuildSummary } from "./build-summary";
import { MobileSummaryBar } from "./mobile-summary-bar";
import { SlotList } from "./slot-list";

const GROUPS = BUILDER_SLOT_GROUPS.map((group) => ({
  ...group,
  slots: getSlotsByGroup(group.id),
}));

const REQUIRED_SLOTS = BUILDER_SLOTS.filter((slot) => slot.required);
const TOTAL_SLOTS = BUILDER_SLOTS.length;

export function BuilderShell() {
  const isMounted = useIsMounted();
  const router = useRouter();
  const searchParams = useSearchParams();
  const addItem = useCartStore((state) => state.addItem);

  const selections = usePcBuilderStore((state) => state.selections);
  const remove = usePcBuilderStore((state) => state.remove);
  const setSelections = usePcBuilderStore((state) => state.setSelections);
  const clear = usePcBuilderStore((state) => state.clear);

  const [build, setBuild] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    usePcBuilderStore.persist.rehydrate();
  }, []);

  useEffect(() => {
    if (!isMounted) return;

    const shared = parseBuildParam(searchParams.get("build"));
    if (shared) {
      setSelections(shared);
    }
  }, [isMounted, searchParams, setSelections]);

  const selectionKey = useMemo(() => JSON.stringify(selections), [selections]);

  useEffect(() => {
    if (!isMounted) return;

    let cancelled = false;
    const timer = setTimeout(() => {
      startTransition(async () => {
        const next = await getBuildState(selections);
        if (!cancelled) setBuild(next);
      });
    }, 200);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [isMounted, selectionKey, selections]);

  const items = build?.items ?? [];
  const selectedCount = items.filter((item) => item.product).length;
  const requiredSelected = REQUIRED_SLOTS.filter((slot) =>
    items.some((item) => item.slotKey === slot.key && item.product)
  ).length;

  const handleRemove = useCallback((slotKey) => remove(slotKey), [remove]);

  const handleClear = useCallback(() => {
    clear();
    toast.success("Build cleared");
  }, [clear]);

  const handleAddToCart = useCallback(async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fresh = await getBuildState(selections);

      if (fresh.error) {
        toast.error(fresh.error);
        return;
      }

      if (fresh.hasBlockers) {
        toast.error("Resolve the compatibility issues before adding to cart.");
        return;
      }

      const selectedItems = fresh.items.filter((item) => item.product);
      const available = selectedItems.filter(
        (item) =>
          item.product.availabilityStatus !== "OUT_OF_STOCK" &&
          item.product.stock > 0
      );
      const unavailableCount = selectedItems.length - available.length;

      if (available.length === 0) {
        toast.error("None of the selected parts are currently in stock.");
        return;
      }

      for (const { product } of available) {
        addItem({
          id: product.id,
          name: product.name,
          price: product.discountedPrice ?? product.price,
          image: product.image,
          quantity: 1,
          stock: product.stock,
        });
      }

      toast.success(
        unavailableCount > 0
          ? `${available.length} of ${selectedItems.length} parts added — ${unavailableCount} unavailable`
          : `${available.length} parts added to cart`,
        {
          action: {
            label: "View cart",
            onClick: () => router.push("/cart"),
          },
        }
      );
    } catch (error) {
      console.error(error);
      toast.error("Failed to add the build to the cart.");
    } finally {
      setIsSubmitting(false);
    }
  }, [addItem, isSubmitting, router, selections]);

  const handleDownload = useCallback(async () => {
    try {
      await downloadBuildQuotation(build ?? {});
    } catch (error) {
      console.error(error);
      toast.error("Failed to generate the quotation.");
    }
  }, [build]);

  const handleShare = useCallback(async () => {
    const param = buildBuildParam(selections);
    const url = `${window.location.origin}/pc-builder?build=${param}`;

    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      toast.success("Build link copied to clipboard");
    } catch {
      toast.error("Could not copy the link.");
    }
  }, [selections]);

  if (!isMounted) {
    return (
      <div className="space-y-4">
        {[0, 1, 2, 3].map((row) => (
          <div key={row} className="h-20 animate-pulse rounded-xl bg-muted/40" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SlotList
            groups={GROUPS}
            items={items}
            isLoading={isPending && build === null}
            onRemove={handleRemove}
          />
        </div>

        <div className="lg:col-span-1">
          <BuildSummary
            build={build}
            isLoading={isPending}
            selectedCount={selectedCount}
            requiredCount={REQUIRED_SLOTS.length}
            requiredSelected={requiredSelected}
            totalSlots={TOTAL_SLOTS}
            isCopied={isCopied}
            isSubmitting={isSubmitting}
            onClear={handleClear}
            onAddToCart={handleAddToCart}
            onDownload={handleDownload}
            onShare={handleShare}
          />
        </div>
      </div>

      <MobileSummaryBar
        subtotal={build?.subtotal ?? 0}
        selectedCount={selectedCount}
        disabled={!build || build.hasBlockers || isPending}
        isSubmitting={isSubmitting}
        onAddToCart={handleAddToCart}
      />
    </div>
  );
}
