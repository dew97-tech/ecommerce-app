export async function restoreOrderStock(tx, orderId) {
  const items = await tx.orderItem.findMany({ where: { orderId } })

  for (const item of items) {
    await tx.product.update({
      where: { id: item.productId },
      data: { stock: { increment: item.quantity } },
    })
  }
}

export async function deductItemsStock(tx, items) {
  for (const item of items) {
    const updated = await tx.product.updateMany({
      where: { id: item.productId, stock: { gte: item.quantity } },
      data: { stock: { decrement: item.quantity } },
    })

    if (updated.count === 0) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
        select: { stock: true },
      })
      const remaining = product?.stock ?? 0

      throw new Error(
        `Not enough stock for "${item.name}". Only ${remaining} left.`
      )
    }
  }
}
