import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';

interface HeroSlide {
  eyebrow: string;
  title: string;
  description: string;
  catalogPath: string;
  images: Array<{ src: string; alt: string }>;
}

const slides = [
  {
    eyebrow: 'Для кухни',
    title: 'Кухонная утварь и принадлежности из дерева',
    description: 'Природа вдохновляет на творчество, дерево сохраняет тепло ваших рук, чтобы вы могли делиться им с теми, кто вам по-настоящему дорог.',
    catalogPath: '/catalog?category=kitchenware',
    images: [
      { src: '/images/hero/octopus-menazhnitsa.webp', alt: 'Деревянная менажница в форме осьминога' },
      { src: '/images/hero/snail-menazhnitsa.webp', alt: 'Деревянная менажница в форме улитки с ложкой' },
    ],
  },
  {
    eyebrow: 'Для творчества',
    title: 'Сувениры, творчество и декор',
    description: 'Мы бережно вытачиваем форму из природного материала, чтобы вы могли вдохнуть в неё характер и создать неповторимый подарок.',
    catalogPath: '/catalog?category=souvenirs-decor',
    images: [
      { src: '/images/hero/knight-placeholder.webp', alt: 'Деревянная фигурка средневекового рыцаря' },
    ],
  },
  {
    eyebrow: 'Объёмный декор',
    title: '3D-фасады',
    description: 'Архитектурные фасады добавляют мебели объём, глубину и характер, раскрывая потенциал современного интерьера.',
    catalogPath: '/catalog?category=facades-3d',
    images: [
      { src: '/images/hero/officers-house.webp', alt: 'Архитектурный фасад Дома офицеров' },
    ],
  },
] satisfies HeroSlide[];

const SLIDE_DELAY = 5000;

interface HeroProps {
  readySketches?: number;
  averageRating?: number;
  guaranteeMonths?: number;
}

export function Hero({ readySketches = 120, averageRating = 4.9, guaranteeMonths = 6 }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const timeout = window.setTimeout(() => {
      if (activeImage + 1 < slides[activeSlide].images.length) {
        setActiveImage((current) => current + 1);
        return;
      }

      setActiveSlide((current) => (current + 1) % slides.length);
      setActiveImage(0);
    }, SLIDE_DELAY);

    return () => window.clearTimeout(timeout);
  }, [activeImage, activeSlide, isPaused]);

  useEffect(() => {
    const currentSlide = slides[activeSlide];
    const nextSource = currentSlide.images[activeImage + 1]?.src
      ?? slides[(activeSlide + 1) % slides.length].images[0].src;
    const nextImage = new Image();
    nextImage.src = nextSource;
  }, [activeImage, activeSlide]);

  const showPrevious = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
    setActiveImage(0);
  };

  const showNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
    setActiveImage(0);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLElement>) => {
    if (touchStartX.current === null) return;

    const distance = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(distance) > 50) {
      if (distance > 0) showPrevious();
      else showNext();
    }
    touchStartX.current = null;
  };

  const slide = slides[activeSlide];
  const image = slide.images[activeImage];
  const slideNumber = String(activeSlide + 1).padStart(2, '0');
  const slidesCount = String(slides.length).padStart(2, '0');

  return (
    <section
      className="hero hero--slider"
      aria-label="Направления изделий КЕЛО"
      aria-roledescription="карусель"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setIsPaused(false);
      }}
      onTouchStart={(event) => { touchStartX.current = event.touches[0].clientX; }}
      onTouchEnd={handleTouchEnd}
    >
      <Container className="hero__inner">
        <div className="hero__content">
          <span className="eyebrow">{slide.eyebrow}</span>
          <h1>{slide.title}</h1>
          <p>{slide.description}</p>
          <div className="hero__actions">
            <Link className="button button--primary" to={slide.catalogPath}>Перейти в каталог <ArrowRight size={18} /></Link>
            <Link className="button button--secondary" to="/about"><PlayCircle size={18} /> О производстве</Link>
          </div>
          <div className="hero__stats">
            <div><strong>{readySketches}+</strong><span>готовых сюжетов</span></div>
            <div><strong>{averageRating.toLocaleString('ru-RU', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}</strong><span>средняя оценка</span></div>
            <div><strong>{guaranteeMonths} мес.</strong><span>гарантия</span></div>
          </div>
        </div>
        <div className="hero-slider__media">
          <div
            className="hero-slider__backdrop"
            style={{ backgroundImage: `url(${image.src})` }}
            aria-hidden="true"
          />
          <img
            key={image.src}
            src={image.src}
            alt={image.alt}
            fetchPriority="high"
          />
          <span className="sr-only" aria-live="polite">{slide.title}. Слайд {activeSlide + 1} из {slides.length}</span>
          <div className="hero-slider__controls">
            <button type="button" onClick={showPrevious} aria-label="Предыдущая фотография">
              <ArrowLeft size={18} />
            </button>
            <span><strong>{slideNumber}</strong><i>/</i>{slidesCount}</span>
            <button type="button" onClick={showNext} aria-label="Следующая фотография">
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </Container>
    </section>
  );
}
