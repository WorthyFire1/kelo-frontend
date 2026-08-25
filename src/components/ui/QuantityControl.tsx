import { Minus, Plus } from 'lucide-react';

interface QuantityControlProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

export function QuantityControl({ value, onChange, max = 99 }: QuantityControlProps) {
  return (
    <div className="quantity-control" aria-label="Количество товара">
      <button type="button" onClick={() => onChange(Math.max(1, value - 1))} aria-label="Уменьшить количество">
        <Minus size={16} />
      </button>
      <span>{value}</span>
      <button type="button" onClick={() => onChange(Math.min(max, value + 1))} aria-label="Увеличить количество">
        <Plus size={16} />
      </button>
    </div>
  );
}
