interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const start = Math.max(1, Math.min(page - 2, totalPages - 4));
  const end = Math.min(totalPages, start + 4);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className="pagination" aria-label="Страницы">
      <button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>Назад</button>
      {start > 1 && <><button type="button" onClick={() => onChange(1)}>1</button>{start > 2 && <span>…</span>}</>}
      {pages.map((item) => <button className={item === page ? 'is-active' : ''} type="button" aria-current={item === page ? 'page' : undefined} onClick={() => onChange(item)} key={item}>{item}</button>)}
      {end < totalPages && <>{end < totalPages - 1 && <span>…</span>}<button type="button" onClick={() => onChange(totalPages)}>{totalPages}</button></>}
      <button type="button" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>Вперёд</button>
    </nav>
  );
}
