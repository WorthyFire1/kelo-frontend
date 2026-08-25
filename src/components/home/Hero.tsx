import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, PlayCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Container } from '@/components/ui/Container';

const slides = [
  { src: '/images/slider/slide-01.webp', alt: 'Пряничная форма с птицей и готовый пряник' },
  { src: '/images/slider/slide-02.webp', alt: 'Пряничная форма с Дедом Морозом в праздничной композиции' },
  { src: '/images/slider/slide-03.webp', alt: 'Деревянная форма и пряник в виде Деда Мороза' },
  { src: '/images/slider/slide-04.webp', alt: 'Готовые пряники рядом с формой Деда Мороза' },
  { src: '/images/slider/slide-05.webp', alt: 'Деревянная форма для пряника и праздничные ингредиенты' },
  { src: '/images/slider/slide-06.webp', alt: 'Пряники в виде Деда Мороза и деревянная форма' },
  { src: '/images/slider/slide-07.webp', alt: 'Крупный план формы и пряника в виде Деда Мороза' },
  { src: '/images/slider/slide-08.webp', alt: 'Праздничная композиция с деревянной формой и пряниками' },
  { src: '/images/slider/slide-09.webp', alt: 'Деревянная форма и пряник в виде Щелкунчика' },
  { src: '/images/slider/slide-10.webp', alt: 'Пряник Щелкунчик рядом с деревянной формой' },
  { src: '/images/slider/slide-11.webp', alt: 'Крупный план деревянной формы Щелкунчика' },
  { src: '/images/slider/slide-12.webp', alt: 'Форма Щелкунчика в праздничной сервировке' },
  { src: '/images/slider/slide-13.webp', alt: 'Пряник Щелкунчик и деревянная форма на фоне ёлки' },
  { src: '/images/slider/slide-14.webp', alt: 'Пряничная форма и пряник в виде оленя' },
  { src: '/images/slider/slide-15.webp', alt: 'Олень из пряничного теста рядом с деревянной формой' },
  { src: '/images/slider/slide-16.webp', alt: 'Деревянная форма оленя и готовые пряники' },
  { src: '/images/slider/slide-17.webp', alt: 'Светлый и шоколадный пряники в виде оленя' },
  { src: '/images/slider/slide-18.webp', alt: 'Пряники-олени и деревянная форма ручной работы' },
  { src: '/images/slider/slide-19.webp', alt: 'Крупный план пряников в виде оленя' },
  { src: '/images/slider/slide-20.webp', alt: 'Деревянная форма и пряник в виде шишки' },
];

interface HeroProps {
  readySketches?: number;
  averageRating?: number;
  guaranteeMonths?: number;
}

export function Hero({ readySketches = 120, averageRating = 4.9, guaranteeMonths = 6 }: HeroProps) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const interval = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % slides.length);
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  useEffect(() => {
    const nextImage = new Image();
    nextImage.src = slides[(activeSlide + 1) % slides.length].src;
  }, [activeSlide]);

  const showPrevious = () => {
    setActiveSlide((current) => (current - 1 + slides.length) % slides.length);
  };

  const showNext = () => {
    setActiveSlide((current) => (current + 1) % slides.length);
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
  const slideNumber = String(activeSlide + 1).padStart(2, '0');
  const slidesCount = String(slides.length).padStart(2, '0');

  return (
    <section
      className="hero hero--slider"
      aria-label="Фотографии изделий КЕЛО"
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
          <span className="eyebrow">Собственное производство</span>
          <h1>Пряничные формы с характером</h1>
          <p>
            Деревянные формы КЕЛО помогают создавать выразительные пряники для праздников, подарков и тёплых семейных традиций.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" to="/catalog">Перейти в каталог <ArrowRight size={18} /></Link>
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
            style={{ backgroundImage: `url(${slide.src})` }}
            aria-hidden="true"
          />
          <img
            key={slide.src}
            src={slide.src}
            alt={slide.alt}
            fetchPriority="high"
          />
          <span className="sr-only" aria-live="polite">Фотография {activeSlide + 1} из {slides.length}</span>
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
