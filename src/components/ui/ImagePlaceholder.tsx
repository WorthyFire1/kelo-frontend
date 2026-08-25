import { useState } from 'react';
import { ImageIcon, Trees } from 'lucide-react';
import clsx from 'clsx';

interface ImagePlaceholderProps {
  src?: string;
  alt: string;
  label?: string;
  className?: string;
  compact?: boolean;
}

export function ImagePlaceholder({ src, alt, label, className, compact }: ImagePlaceholderProps) {
  const [failedSrc, setFailedSrc] = useState<string>();

  if (src && failedSrc !== src) {
    return <img className={clsx('image-cover', className)} src={src} alt={alt} loading="lazy" onError={() => setFailedSrc(src)} />;
  }

  return (
    <div className={clsx('image-placeholder', compact && 'image-placeholder--compact', className)} role="img" aria-label={alt}>
      <Trees size={compact ? 24 : 38} strokeWidth={1.5} />
      {!compact && <strong>{label ?? 'Фотография скоро появится'}</strong>}
      {!compact && <span>Здесь будет изображение заказчика</span>}
      {compact && <ImageIcon size={16} aria-hidden="true" />}
    </div>
  );
}
