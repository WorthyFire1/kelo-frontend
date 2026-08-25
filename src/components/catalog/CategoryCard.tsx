import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { pluralizeProducts } from '@/lib/formatters';
import type { Category } from '@/types/catalog';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';

export function CategoryCard({ category }: { category: Category }) {
  return (
    <Link className="category-card" to={`/catalog?category=${category.id}`}>
      <ImagePlaceholder src={category.image} alt={category.name} label={category.accent} />
      <div className="category-card__content">
        <span>{pluralizeProducts(category.productCount)}</span>
        <h3>{category.name}</h3>
        <p>{category.description}</p>
        <strong>Смотреть <ArrowUpRight size={17} /></strong>
      </div>
    </Link>
  );
}
