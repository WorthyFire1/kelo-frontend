import type { Availability, CatalogFilterOption } from '@/types/catalog';

export interface FilterState {
  minPrice: string;
  maxPrice: string;
  materials: string[];
  availability: Availability[];
}

interface FiltersSidebarProps {
  value: FilterState;
  materials: CatalogFilterOption[];
  brands: CatalogFilterOption[];
  brand: string;
  onBrandChange: (brand: string) => void;
  onChange: (value: FilterState) => void;
  onReset: () => void;
}

const availabilityOptions: Array<{ value: Availability; label: string }> = [
  { value: 'in-stock', label: 'В наличии' },
  { value: 'out-of-stock', label: 'Нет в наличии' },
];

export function FiltersSidebar({ value, materials, brands, brand, onBrandChange, onChange, onReset }: FiltersSidebarProps) {
  const toggleMaterial = (materialId: string) => {
    onChange({
      ...value,
      materials: value.materials.includes(materialId)
        ? value.materials.filter((item) => item !== materialId)
        : [...value.materials, materialId],
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
          <label className="check-row" key={material.id}>
            <input
              type="checkbox"
              checked={value.materials.includes(material.id)}
              onChange={() => toggleMaterial(material.id)}
            />
            <span>{material.name}</span>
          </label>
        ))}
      </div>
      <div className="filter-group">
        <h3>Бренд</h3>
        <label className="filter-select">
          <span className="sr-only">Выберите бренд</span>
          <select value={brand} onChange={(event) => onBrandChange(event.target.value)}>
            <option value="">Все бренды</option>
            {brands.map((item) => <option value={item.id} key={item.id}>{item.name} ({item.productCount})</option>)}
          </select>
        </label>
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
