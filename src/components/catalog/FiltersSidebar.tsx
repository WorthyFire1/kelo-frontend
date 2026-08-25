import type { Availability } from '@/types/catalog';

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  materials: string[];
  availability: Availability[];
}

interface FiltersSidebarProps {
  value: FilterState;
  materials: string[];
  onChange: (value: FilterState) => void;
  onReset: () => void;
}

const availabilityOptions: Array<{ value: Availability; label: string }> = [
  { value: 'in-stock', label: 'В наличии' },
  { value: 'made-to-order', label: 'На заказ' },
  { value: 'out-of-stock', label: 'Нет в наличии' },
];

export function FiltersSidebar({ value, materials, onChange, onReset }: FiltersSidebarProps) {
  const toggleMaterial = (material: string) => {
    onChange({
      ...value,
      materials: value.materials.includes(material)
        ? value.materials.filter((item) => item !== material)
        : [...value.materials, material],
    });
  };

  const toggleAvailability = (availability: Availability) => {
    onChange({
      ...value,
      availability: value.availability.includes(availability)
        ? value.availability.filter((item) => item !== availability)
        : [...value.availability, availability],
    });
  };

  return (
    <aside className="filters">
      <div className="filters__heading">
        <h2>Подбор по параметрам</h2>
        <button type="button" onClick={onReset}>Сбросить</button>
      </div>
      <div className="filter-group">
        <h3>Цена, ₽</h3>
        <div className="price-inputs">
          <label>
            <span>От</span>
            <input
              type="number"
              min="0"
              value={value.minPrice}
              onChange={(event) => onChange({ ...value, minPrice: event.target.value })}
              placeholder="0"
            />
          </label>
          <label>
            <span>До</span>
            <input
              type="number"
              min="0"
              value={value.maxPrice}
              onChange={(event) => onChange({ ...value, maxPrice: event.target.value })}
              placeholder="10 000"
            />
          </label>
        </div>
      </div>
      <div className="filter-group">
        <h3>Материал</h3>
        {materials.map((material) => (
          <label className="check-row" key={material}>
            <input
              type="checkbox"
              checked={value.materials.includes(material)}
              onChange={() => toggleMaterial(material)}
            />
            <span>{material}</span>
          </label>
        ))}
      </div>
      <div className="filter-group">
        <h3>Наличие</h3>
        {availabilityOptions.map((option) => (
          <label className="check-row" key={option.value}>
            <input
              type="checkbox"
              checked={value.availability.includes(option.value)}
              onChange={() => toggleAvailability(option.value)}
            />
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </aside>
  );
}
