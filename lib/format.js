const PAYMENT_METHOD_LABELS = {
  COD: "Cash on Delivery",
  SSLCOMMERZ: "Card / Online Payment",
}

const CANCELLED_BY_LABELS = {
  CUSTOMER: "Cancelled by customer",
  ADMIN: "Cancelled by admin",
  SYSTEM: "Cancelled by system",
}

export function formatPaymentMethod(value) {
  if (!value) return "—"
  return PAYMENT_METHOD_LABELS[value] ?? value
}

export function formatCancelledBy(value) {
  if (!value) return "Cancelled"
  return CANCELLED_BY_LABELS[value] ?? "Cancelled"
}

export function formatAdminDate(value) {
  if (!value) return "—"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "—"

  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function formatAdminDateTime(value) {
  if (!value) return ""

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""

  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}
