import { useMemo, useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { EmptyState } from '@/components/ui/EmptyState';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { Pagination } from '@/components/ui/Pagination';
import { useArticlePage } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function BlogPage() {
  useDocumentTitle('Блог');
  const [category, setCategory] = useState('Все');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const hasSearch = Boolean(query.trim());
  const articlesQuery = useArticlePage(hasSearch ? 1 : page, hasSearch ? 1000 : 9, category === 'Все' ? undefined : category);

  const categories = useMemo(
    () => ['Все', ...(articlesQuery.data?.categories ?? [])],
    [articlesQuery.data],
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('ru-RU');
    const matches = articlesQuery.data?.articles.filter((article) =>
      !normalized || (article.title + ' ' + article.excerpt).toLocaleLowerCase('ru-RU').includes(normalized),
    ) ?? [];
    return hasSearch ? matches.slice((page - 1) * 9, page * 9) : matches;
  }, [articlesQuery.data, hasSearch, page, query]);
  const totalPages = hasSearch
    ? Math.max(1, Math.ceil((articlesQuery.data?.articles.filter((article) => (article.title + ' ' + article.excerpt).toLocaleLowerCase('ru-RU').includes(query.trim().toLocaleLowerCase('ru-RU'))).length ?? 0) / 9))
    : articlesQuery.data?.totalPages ?? 1;

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
          {categories.map((item) => <button className={category === item ? 'is-active' : ''} type="button" onClick={() => { setCategory(item); setPage(1); }} key={item}>{item}</button>)}
        </div>
        <label className="inline-search"><Search size={18} /><input value={query} onChange={(event) => { setQuery(event.target.value); setPage(1); }} placeholder="Поиск по статьям" /></label>
      </div>
      {articlesQuery.isLoading ? (
        <div className="article-grid article-grid--large" aria-label="Загрузка статей">
          {Array.from({ length: 6 }, (_, index) => (
            <div className="skeleton-card" key={index}>
              <div className="skeleton skeleton--image" />
              <div className="skeleton skeleton--line" />
              <div className="skeleton skeleton--line skeleton--short" />
            </div>
          ))}
        </div>
      ) : articlesQuery.isError ? (
        <EmptyState
          icon={<Search />}
          title="Не удалось загрузить статьи"
          description={articlesQuery.error instanceof Error ? articlesQuery.error.message : 'Проверьте доступность backend и повторите запрос.'}
          action={<button className="button button--primary" type="button" onClick={() => void articlesQuery.refetch()}>Повторить</button>}
        />
      ) : filtered.length ? (
        <><div className="article-grid article-grid--large">
          {filtered.map((article) => (
            <article className="article-card" key={article.id}>
              <Link to={'/blog/' + article.slug}><ImagePlaceholder src={article.image} alt={article.title} label={article.category} /></Link>
              <div className="article-card__body">
                <span>{article.category} · {article.publishedAt} · {article.readingTime} мин.</span>
                <h2><Link to={'/blog/' + article.slug}>{article.title}</Link></h2>
                <p>{article.excerpt}</p>
                <Link to={'/blog/' + article.slug}>Читать <ArrowRight size={16} /></Link>
              </div>
            </article>
          ))}
        </div><Pagination page={page} totalPages={totalPages} onChange={(nextPage) => { setPage(nextPage); window.scrollTo({ top: 0, behavior: 'smooth' }); }} /></>
      ) : (
        <EmptyState icon={<Search />} title="Статьи не найдены" description="Измените запрос или выберите другую рубрику." />
      )}
    </Container>
  );
}
