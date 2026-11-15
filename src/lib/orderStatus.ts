export const orderStatuses = [
  { value: 'New', label: 'Новый', editable: true },
  { value: 'Processing', label: 'В обработке', editable: true },
  { value: 'Shipped', label: 'Отправлен', editable: true },
  { value: 'Delivered', label: 'Доставлен', editable: true },
  { value: 'Cancelled', label: 'Отменён', editable: true },
  { value: 'ReadyForPickup', label: 'Готов к выдаче', editable: false },
  { value: 'InTransit', label: 'В пути', editable: false },
  { value: 'DeliveryFailed', label: 'Не удалось доставить', editable: false },
  { value: 'CdekError', label: 'Ошибка оформления доставки', editable: false },
] as const;

export const editableOrderStatuses = orderStatuses.filter((status) => status.editable);

export function orderStatusLabel(status: string): string {
  return orderStatuses.find((item) => item.value === status)?.label ?? status;
}
