import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ProductGrid } from '@/components/catalog/ProductGrid';
import { FeatureStrip } from '@/components/home/FeatureStrip';
import { Hero } from '@/components/home/Hero';
import { Newsletter } from '@/components/home/Newsletter';
import { PromoSplit } from '@/components/home/PromoSplit';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { LoadingGrid } from '@/components/ui/LoadingGrid';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { useArticles, useHomeData } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function HomePage() {
  useDocumentTitle('Главная');
  const homeQuery = useHomeData();
  const articlesQuery = useArticles();

  const homeData = homeQuery.data;
  const featured = homeData?.newProducts ?? [];
  const articles = articlesQuery.data?.slice(0, 3) ?? [];

  return (
    <>
      <Hero
        readySketches={homeData?.readySketches}
        averageRating={homeData?.averageRating}
        guaranteeMonths={homeData?.guaranteeMonths}
      />
      <FeatureStrip features={homeData?.advantages} />
      <PromoSplit />
      <section className="section section--soft">
        <Container>
          <SectionHeader
            eyebrow="Новинки"
            title="Новые изделия КЕЛО"
            description={homeData
              ? `Всего товаров в каталоге: ${homeData.totalProducts}. Свежие работы собственного производства.`
              : 'Свежие работы собственного производства.'}
            action={<Link className="text-link" to="/catalog?sort=newest">Смотреть все <ArrowRight size={17} /></Link>}
          />
          {homeQuery.isLoading && <LoadingGrid />}
          {homeQuery.isError && (
            <div className="home-api-message" role="alert">
              <strong>Не удалось загрузить данные с сервера</strong>
              <span>Проверьте подключение к Radmin VPN и доступность backend.</span>
              <button className="button button--secondary" type="button" onClick={() => void homeQuery.refetch()}>Повторить</button>
            </div>
          )}
          {homeQuery.isSuccess && featured.length > 0 && <ProductGrid products={featured} />}
          {homeQuery.isSuccess && featured.length === 0 && (
            <div className="home-api-message">
              <strong>Новинки скоро появятся</strong>
              <span>На сервере пока нет товаров с признаком новинки.</span>
            </div>
          )}
        </Container>
      </section>
      <section className="section story-section">
        <Container className="story-section__inner">
          <ImagePlaceholder alt="Производство КЕЛО" label="Фотография мастерской" />
          <div>
            <span className="eyebrow">КЕЛО изнутри</span>
            <h2>От идеи до готового изделия — в одной мастерской</h2>
            <p>Продумываем рисунок, выбираем древесину, настраиваем резьбу и проверяем каждую форму вручную.</p>
            <ul className="check-list">
              <li>Чистая древесина без сколов и глубоких трещин</li>
              <li>Ручная финишная шлифовка</li>
              <li>Безопасные покрытия для контакта с пищей</li>
              <li>Тестовый отпечаток для новых сюжетов</li>
            </ul>
            <Link className="button button--secondary" to="/about">Подробнее о производстве</Link>
          </div>
        </Container>
      </section>
      <section className="section">
        <Container>
          <SectionHeader
            eyebrow="Полезное"
            title="Блог КЕЛО"
            description="Уход за деревом, секреты печатных пряников и истории новых коллекций."
            action={<Link className="text-link" to="/blog">Все статьи <ArrowRight size={17} /></Link>}
          />
          <div className="article-grid">
            {articles.map((article) => (
              <article className="article-card" key={article.id}>
                <Link to={`/blog/${article.slug}`}>
                  <ImagePlaceholder src={article.image} alt={article.title} label={article.category} />
                </Link>
                <div className="article-card__body">
                  <span>{article.category} · {article.readingTime} мин.</span>
                  <h3><Link to={`/blog/${article.slug}`}>{article.title}</Link></h3>
                  <p>{article.excerpt}</p>
                  <Link to={`/blog/${article.slug}`}>Читать статью <ArrowRight size={16} /></Link>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
      <Newsletter />
    </>
  );
}
