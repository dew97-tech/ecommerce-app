import { cn } from "@/lib/utils";
import {
  CircleAlert,
  CircleDashed,
  Clock,
  PackageCheck,
  ShoppingBag,
  Truck,
  XCircle,
} from "lucide-react";

const ORDER_STATUS = {
  PENDING: {
    label: "Pending",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: Clock,
  },
  PROCESSING: {
    label: "Processing",
    className: "border-primary/30 bg-primary/10 text-primary",
    icon: CircleDashed,
  },
  SHIPPED: {
    label: "Shipped",
    className: "border-indigo-500/30 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400",
    icon: Truck,
  },
  DELIVERED: {
    label: "Delivered",
    className: "border-success/30 bg-success/10 text-success",
    icon: PackageCheck,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-border bg-muted text-muted-foreground",
    icon: XCircle,
  },
  FAILED: {
    label: "Failed",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: CircleAlert,
  },
};

const PAYMENT_STATUS = {
  PAID: {
    label: "Paid",
    className: "border-success/30 bg-success/10 text-success",
    icon: PackageCheck,
  },
  PENDING: {
    label: "Unpaid",
    className: "border-warning/30 bg-warning/10 text-warning",
    icon: Clock,
  },
  FAILED: {
    label: "Failed",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    icon: CircleAlert,
  },
  CANCELLED: {
    label: "Cancelled",
    className: "border-border bg-muted text-muted-foreground",
    icon: XCircle,
  },
};

export function StatusBadge({ status, kind = "order", className }) {
  const map = kind === "payment" ? PAYMENT_STATUS : ORDER_STATUS;
  const config = map[status] ?? {
    label: status ?? "Unknown",
    className: "border-border bg-muted text-muted-foreground",
    icon: ShoppingBag,
  };
  const Icon = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium",
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
