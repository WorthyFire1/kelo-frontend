export function LoadingGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="product-grid" aria-label="Загрузка товаров">
      {Array.from({ length: count }, (_, index) => (
        <div className="skeleton-card" key={index}>
          <div className="skeleton skeleton--image" />
          <div className="skeleton skeleton--line" />
          <div className="skeleton skeleton--line skeleton--short" />
        </div>
      ))}
    </div>
  );
}
