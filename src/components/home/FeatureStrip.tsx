import { BadgeCheck, PackageCheck, RotateCcw, Truck, type LucideIcon } from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface FeatureItem {
  icon: string;
  title: string;
  description: string;
}

const defaultFeatures: FeatureItem[] = [
  { icon: 'fa-industry', title: 'Сами производим', description: 'Контролируем материал и качество резьбы' },
  { icon: 'fa-truck', title: 'Доставка по России', description: 'СДЭК, Почта России и курьерские службы' },
  { icon: 'fa-undo', title: 'Простой возврат', description: 'Поможем с обменом и решим любой вопрос' },
  { icon: 'fa-box', title: 'Надёжная упаковка', description: 'Каждое изделие защищено при перевозке' },
];

const featureIcons: Record<string, LucideIcon> = {
  'fa-industry': BadgeCheck,
  'fa-truck': Truck,
  'fa-undo': RotateCcw,
  'fa-box': PackageCheck,
};

export function FeatureStrip({ features = defaultFeatures }: { features?: FeatureItem[] }) {
  const items = features.length ? features : defaultFeatures;

  return (
    <section className="feature-strip">
      <Container className="feature-strip__grid">
        {items.map(({ icon, title, description }) => {
          const Icon = featureIcons[icon] ?? BadgeCheck;

          return (
            <div className="feature-item" key={title}>
              <Icon size={27} />
              <div><strong>{title}</strong><span>{description}</span></div>
            </div>
          );
        })}
      </Container>
    </section>
  );
}
