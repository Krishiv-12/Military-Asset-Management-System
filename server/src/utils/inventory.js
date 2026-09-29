import { AppError } from "./AppError.js";

export async function getOrCreateInventory(tx, baseId, equipmentTypeId) {
  return tx.inventory.upsert({
    where: {
      baseId_equipmentTypeId: { baseId, equipmentTypeId },
    },
    update: {},
    create: { baseId, equipmentTypeId, quantity: 0 },
  });
}

export async function increaseInventory(tx, baseId, equipmentTypeId, quantity) {
  await getOrCreateInventory(tx, baseId, equipmentTypeId);
  return tx.inventory.update({
    where: { baseId_equipmentTypeId: { baseId, equipmentTypeId } },
    data: { quantity: { increment: quantity } },
  });
}

export async function decreaseInventory(tx, baseId, equipmentTypeId, quantity) {
  await getOrCreateInventory(tx, baseId, equipmentTypeId);
  const updated = await tx.inventory.updateMany({
    where: {
      baseId,
      equipmentTypeId,
      quantity: { gte: quantity },
    },
    data: { quantity: { decrement: quantity } },
  });
  if (updated.count !== 1) {
    const current = await tx.inventory.findUnique({
      where: { baseId_equipmentTypeId: { baseId, equipmentTypeId } },
    });
    throw new AppError(
      `Insufficient inventory. Available: ${current?.quantity ?? 0}, requested: ${quantity}`,
      409,
    );
  }
  return tx.inventory.findUnique({
    where: { baseId_equipmentTypeId: { baseId, equipmentTypeId } },
  });
}

export function createMovement(tx, data) {
  return tx.inventoryMovement.create({ data });
}

export function signedQuantity(type, quantity) {
  if (type === "PURCHASE" || type === "TRANSFER_IN") return quantity;
  return -quantity;
}
