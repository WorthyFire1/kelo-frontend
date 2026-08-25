import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { useArticles } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

const categories = ['Все', 'Советы', 'Истории', 'Новости', 'Уход за деревом'] as const;

export function BlogPage() {
  useDocumentTitle('Блог');
  const articlesQuery = useArticles();
  const [category, setCategory] = useState<(typeof categories)[number]>('Все');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ru-RU');
    return articlesQuery.data?.filter((article) =>
      (category === 'Все' || article.category === category)
      && (!normalized || `${article.title} ${article.excerpt}`.toLocaleLowerCase('ru-RU').includes(normalized)),
    ) ?? [];
  }, [articlesQuery.data, category, query]);

  return (
    <Container className="page-shell">
      <Breadcrumbs items={[{ label: 'Блог' }]} />
      <div className="page-heading">
        <div>
          <span className="eyebrow">Знания и вдохновение</span>
          <h1>Блог КЕЛО</h1>
          <p>Рассказываем о дереве, печатных пряниках, сервировке и создании новых изделий.</p>
        </div>
      </div>
      <div className="blog-toolbar">
        <div className="category-tabs">
          {categories.map((item) => <button className={category === item ? 'is-active' : ''} type="button" onClick={() => setCategory(item)} key={item}>{item}</button>)}
        </div>
        <label className="inline-search"><Search size={18} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск по статьям" /></label>
      </div>
      {filtered.length ? (
        <div className="article-grid article-grid--large">
          {filtered.map((article) => (
            <article className="article-card" key={article.id}>
              <Link to={`/blog/${article.slug}`}><ImagePlaceholder src={article.image} alt={article.title} label={article.category} /></Link>
              <div className="article-card__body">
                <span>{article.category} · {article.publishedAt} · {article.readingTime} мин.</span>
                <h2><Link to={`/blog/${article.slug}`}>{article.title}</Link></h2>
                <p>{article.excerpt}</p>
                <Link to={`/blog/${article.slug}`}>Читать <ArrowRight size={16} /></Link>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState icon={<Search />} title="Статьи не найдены" description="Измените запрос или выберите другую рубрику." />
      )}
    </Container>
  );
}
