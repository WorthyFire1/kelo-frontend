import { ArrowLeft, Clock3 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumbs } from '@/components/ui/Breadcrumbs';
import { Container } from '@/components/ui/Container';
import { ImagePlaceholder } from '@/components/ui/ImagePlaceholder';
import { useArticle } from '@/hooks/useCatalog';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

export function ArticlePage() {
  const { slug = '' } = useParams();
  const articleQuery = useArticle(slug);
  const article = articleQuery.data;
  useDocumentTitle(article?.title ?? 'Статья');

  if (!article && !articleQuery.isLoading) {
    return <Container className="page-shell center-message"><h1>Статья не найдена</h1><Link className="button button--primary" to="/blog">Вернуться в блог</Link></Container>;
  }

  if (!article) return <Container className="page-shell"><div className="skeleton skeleton--hero" /></Container>;

  return (
    <Container className="page-shell article-page">
      <Breadcrumbs items={[{ label: 'Блог', to: '/blog' }, { label: article.title }]} />
      <header className="article-page__header">
        <span className="eyebrow">{article.category}</span>
        <h1>{article.title}</h1>
        <p>{article.excerpt}</p>
        <div><span>{article.publishedAt}</span><span><Clock3 size={16} /> {article.readingTime} минут чтения</span></div>
      </header>
      <ImagePlaceholder src={article.image} alt={article.title} label="Изображение статьи" className="article-page__image" />
      <article className="article-page__content">
        {article.content.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
        <div className="article-callout"><strong>Совет КЕЛО</strong><p>Перед использованием деревянного изделия всегда учитывайте рекомендации именно к вашей модели — покрытие и порода дерева могут отличаться.</p></div>
      </article>
      <Link className="text-link" to="/blog"><ArrowLeft size={17} /> Вернуться к статьям</Link>
    </Container>
  );
}
