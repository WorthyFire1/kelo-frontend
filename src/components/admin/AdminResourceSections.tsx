import { useState, type FormEvent, type ReactNode } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Eye, Image, Pencil, Plus, RefreshCw, Tags, Trash2, X } from 'lucide-react';
import {
  adminService,
  type AdminBlogPost,
  type AdminBrand,
  type AdminCategory,
} from '@/services/adminService';

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 0,
});
const dateFormatter = new Intl.DateTimeFormat('ru-RU', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
});
const orderStatuses = [
  { value: 'New', label: 'Новый' },
  { value: 'Processing', label: 'В обработке' },
  { value: 'Shipped', label: 'Отправлен' },
  { value: 'Delivered', label: 'Доставлен' },
  { value: 'Cancelled', label: 'Отменён' },
];

function formatDate(value?: string | null) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
}

function getImage(formData: FormData, name: string): File | null {
  const entry = formData.get(name);
  if (!(entry instanceof File) || entry.size === 0) return null;
  if (entry.size > 5 * 1024 * 1024) throw new Error('Размер изображения не должен превышать 5 МБ.');
  return entry;
}

function ResourceState({ pending, error, retry }: { pending: boolean; error: boolean; retry: () => void }) {
  if (pending) {
    return <div className="admin-state"><RefreshCw className="spin" /><strong>Получаем данные</strong><span>Запрашиваем актуальную информацию у backend.</span></div>;
  }
  if (error) {
    return <div className="admin-state is-error"><strong>Не удалось загрузить данные</strong><button type="button" onClick={retry}><RefreshCw size={16} /> Повторить</button></div>;
  }
  return null;
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="admin-modal" role="dialog" aria-modal="true" aria-label={title}>
      <button className="admin-modal__overlay" type="button" onClick={onClose} aria-label="Закрыть форму" />
      <div className="admin-modal__panel">
        <div className="admin-modal__header">
          <div><span className="admin-kicker">Управление</span><h2>{title}</h2></div>
          <button type="button" onClick={onClose} aria-label="Закрыть"><X /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminOrdersSection() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const ordersQuery = useQuery({
    queryKey: ['admin', 'orders', status],
    queryFn: () => adminService.getOrders(status),
  });
  const orderQuery = useQuery({
    queryKey: ['admin', 'order', selectedId],
    queryFn: () => adminService.getOrder(selectedId as number),
    enabled: selectedId !== null,
  });
  const updateMutation = useMutation({
    mutationFn: ({ id, nextStatus }: { id: number; nextStatus: string }) => adminService.updateOrderStatus(id, nextStatus),
    onSuccess: async (_, variables) => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'order', variables.id] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });

  return (
    <>
      <section className="admin-panel-card">
        <div className="admin-section-heading">
          <div><span className="admin-kicker">Продажи</span><h2>Все заказы</h2><p>{ordersQuery.data ? `${ordersQuery.data.total} заказов в backend` : 'Очередь заказов магазина'}</p></div>
          <label className="admin-status-filter"><span>Статус</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Все</option>{orderStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
        </div>
        <ResourceState pending={ordersQuery.isPending} error={ordersQuery.isError} retry={() => void ordersQuery.refetch()} />
        {ordersQuery.data && (
          <div className="admin-table-scroll">
            <table className="admin-table">
              <thead><tr><th>Заказ</th><th>Покупатель</th><th>Дата</th><th>Сумма</th><th>Позиций</th><th>Статус</th><th aria-label="Действия" /></tr></thead>
              <tbody>
                {ordersQuery.data.orders.map((order) => (
                  <tr key={order.id}>
                    <td><strong>{order.orderNumber}</strong></td><td>{order.customerName}</td><td>{formatDate(order.orderDate)}</td>
                    <td><strong>{moneyFormatter.format(order.total)}</strong></td><td>{order.itemsCount}</td>
                    <td><select className="admin-order-status" value={order.status} disabled={updateMutation.isPending && updateMutation.variables?.id === order.id} onChange={(event) => updateMutation.mutate({ id: order.id, nextStatus: event.target.value })}>{orderStatuses.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></td>
                    <td><button className="admin-row-action" type="button" onClick={() => setSelectedId(order.id)} aria-label="Открыть заказ"><Eye size={16} /></button></td>
                  </tr>
                ))}
                {!ordersQuery.data.orders.length && <tr><td className="admin-table-empty" colSpan={7}>Заказов с выбранным статусом нет.</td></tr>}
              </tbody>
            </table>
          </div>
        )}
        {updateMutation.isError && <div className="admin-mutation-error">{getErrorMessage(updateMutation.error, 'Статус не сохранён.')}</div>}
      </section>

      {selectedId !== null && (
        <Modal title="Карточка заказа" onClose={() => setSelectedId(null)}>
          <ResourceState pending={orderQuery.isPending} error={orderQuery.isError} retry={() => void orderQuery.refetch()} />
          {orderQuery.data && (
            <>
              <dl className="admin-detail-grid">
                <div><dt>Номер</dt><dd>{orderQuery.data.orderNumber}</dd></div>
                <div><dt>Дата</dt><dd>{formatDate(orderQuery.data.orderDate)}</dd></div>
                <div><dt>Оплата</dt><dd>{orderQuery.data.paymentMethod} · {orderQuery.data.paymentStatus}</dd></div>
                <div><dt>Доставка</dt><dd>{orderQuery.data.shippingMethod}</dd></div>
                <div className="admin-form-wide"><dt>Адрес</dt><dd>{orderQuery.data.shippingAddress || '—'}</dd></div>
                <div className="admin-form-wide"><dt>Комментарий</dt><dd>{orderQuery.data.comment || '—'}</dd></div>
              </dl>
              <div className="admin-table-scroll">
                <table className="admin-table">
                  <thead><tr><th>Товар</th><th>Артикул</th><th>Количество</th><th>Цена</th><th>Сумма</th></tr></thead>
                  <tbody>{(orderQuery.data.orderItems ?? []).map((item) => <tr key={item.id}><td>{item.productName}</td><td>{item.productSku || '—'}</td><td>{item.quantity}</td><td>{moneyFormatter.format(item.unitPrice)}</td><td><strong>{moneyFormatter.format(item.totalPrice)}</strong></td></tr>)}</tbody>
                </table>
              </div>
              <dl className="admin-order-totals">
                <div><dt>Товары</dt><dd>{moneyFormatter.format(orderQuery.data.subtotal)}</dd></div>
                <div><dt>Доставка</dt><dd>{moneyFormatter.format(orderQuery.data.shippingCost)}</dd></div>
                <div><dt>Скидка</dt><dd>{moneyFormatter.format(orderQuery.data.discountAmount)}</dd></div>
                <div><dt>Итого</dt><dd>{moneyFormatter.format(orderQuery.data.total)}</dd></div>
              </dl>
            </>
          )}
        </Modal>
      )}
    </>
  );
}

export function AdminCategoriesSection() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminCategory | 'new' | null>(null);
  const query = useQuery({ queryKey: ['admin', 'categories'], queryFn: adminService.getCategories });
  const saveMutation = useMutation({
    mutationFn: ({ id, name, description, displayOrder }: { id?: number; name: string; description: string; displayOrder: number }) => {
      const input = { name, description, displayOrder, parentCategoryId: null };
      return id ? adminService.updateCategory(id, input) : adminService.createCategory(input);
    },
    onSuccess: async () => {
      setEditing(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'product-options'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteCategory,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'categories'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'product-options'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
      ]);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    saveMutation.mutate({
      id: editing === 'new' || editing === null ? undefined : editing.id,
      name: String(data.get('name') ?? '').trim(),
      description: String(data.get('description') ?? '').trim(),
      displayOrder: Number(data.get('displayOrder')),
    });
  };

  return (
    <>
      <section className="admin-panel-card">
        <div className="admin-section-heading"><div><span className="admin-kicker">Каталог</span><h2>Категории</h2><p>{query.data ? `${query.data.length} категорий` : 'Структура каталога'}</p></div><button type="button" onClick={() => { saveMutation.reset(); setEditing('new'); }}><Plus size={17} /> Добавить категорию</button></div>
        <ResourceState pending={query.isPending} error={query.isError} retry={() => void query.refetch()} />
        {query.data && <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Категория</th><th>Slug</th><th>Товаров</th><th>Порядок</th><th aria-label="Действия" /></tr></thead><tbody>
          {query.data.map((category) => <tr key={category.id}><td><strong>{category.name}</strong><br /><small>{category.description || 'Без описания'}</small></td><td><code>{category.slug}</code></td><td>{category.productCount}</td><td>{category.displayOrder}</td><td><div className="admin-row-actions"><button className="admin-row-action" type="button" onClick={() => { saveMutation.reset(); setEditing(category); }} aria-label="Редактировать"><Pencil size={16} /></button><button className="admin-row-action is-danger" type="button" disabled={deleteMutation.isPending} onClick={() => window.confirm(`Удалить категорию «${category.name}»?`) && deleteMutation.mutate(category.id)} aria-label="Удалить"><Trash2 size={16} /></button></div></td></tr>)}
          {!query.data.length && <tr><td className="admin-table-empty" colSpan={5}>Категорий пока нет.</td></tr>}
        </tbody></table></div>}
        {deleteMutation.isError && <div className="admin-mutation-error">{getErrorMessage(deleteMutation.error, 'Категория не удалена. Возможно, к ней привязаны товары.')}</div>}
      </section>
      {editing && <Modal title={editing === 'new' ? 'Новая категория' : 'Редактирование категории'} onClose={() => setEditing(null)}>
        <form onSubmit={submit}>
          <div className="admin-form-grid">
            <label className="admin-form-wide"><span>Название</span><input name="name" required maxLength={100} defaultValue={editing === 'new' ? '' : editing.name} /></label>
            <label><span>Порядок отображения</span><input name="displayOrder" type="number" min="0" defaultValue={editing === 'new' ? 0 : editing.displayOrder} /></label>
            <label className="admin-form-wide"><span>Описание</span><textarea name="description" maxLength={500} rows={4} defaultValue={editing === 'new' ? '' : editing.description ?? ''} /></label>
          </div>
          {saveMutation.isError && <div className="admin-mutation-error">{getErrorMessage(saveMutation.error, 'Категория не сохранена.')}</div>}
          <div className="admin-modal__actions"><button type="button" onClick={() => setEditing(null)}>Отмена</button><button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Сохраняем...' : 'Сохранить'}</button></div>
        </form>
      </Modal>}
    </>
  );
}

export function AdminBrandsSection() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminBrand | 'new' | null>(null);
  const [logoSelected, setLogoSelected] = useState(false);
  const query = useQuery({ queryKey: ['admin', 'brands'], queryFn: adminService.getBrands });
  const loadMutation = useMutation({
    mutationFn: adminService.getBrand,
    onSuccess: (brand) => {
      setLogoSelected(false);
      setEditing(brand);
    },
  });
  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: Parameters<typeof adminService.createBrand>[0] }) => id ? adminService.updateBrand(id, input) : adminService.createBrand(input),
    onSuccess: async () => {
      setLogoSelected(false);
      setEditing(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'product-options'] }),
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteBrand,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'brands'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'product-options'] }),
        queryClient.invalidateQueries({ queryKey: ['brands'] }),
      ]);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const logo = getImage(data, 'logo');
      saveMutation.mutate({
        id: editing === 'new' || editing === null ? undefined : editing.id,
        input: {
          name: String(data.get('name') ?? '').trim(),
          description: String(data.get('description') ?? '').trim(),
          isActive: data.get('isActive') === 'on',
          logo,
          logoUrl: editing === 'new' || editing === null ? null : editing.sourceLogoUrl,
          removeLogo: data.get('removeLogo') === 'on' && !logo,
        },
      });
    } catch (error) {
      window.alert(getErrorMessage(error, 'Проверьте выбранный файл.'));
    }
  };

  return (
    <>
      <section className="admin-panel-card">
        <div className="admin-section-heading"><div><span className="admin-kicker">Каталог</span><h2>Бренды</h2><p>{query.data ? `${query.data.total} брендов` : 'Производители товаров'}</p></div><button type="button" onClick={() => { saveMutation.reset(); setLogoSelected(false); setEditing('new'); }}><Plus size={17} /> Добавить бренд</button></div>
        <ResourceState pending={query.isPending} error={query.isError} retry={() => void query.refetch()} />
        {query.data && <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Бренд</th><th>Slug</th><th>Товаров</th><th aria-label="Действия" /></tr></thead><tbody>
          {query.data.brands.map((brand) => <tr key={brand.id}><td><div className="admin-product-cell">{brand.logoUrl ? <img src={brand.logoUrl} alt="" /> : <span>{brand.name.slice(0, 1)}</span>}<div><strong>{brand.name}</strong><small>{brand.description || 'Без описания'}</small></div></div></td><td><code>{brand.slug}</code></td><td>{brand.productCount}</td><td><div className="admin-row-actions"><button className="admin-row-action" type="button" disabled={loadMutation.isPending} onClick={() => loadMutation.mutate(brand.id)} aria-label="Редактировать"><Pencil size={16} /></button><button className="admin-row-action is-danger" type="button" disabled={deleteMutation.isPending} onClick={() => window.confirm(`Удалить бренд «${brand.name}»?`) && deleteMutation.mutate(brand.id)} aria-label="Удалить"><Trash2 size={16} /></button></div></td></tr>)}
          {!query.data.brands.length && <tr><td className="admin-table-empty" colSpan={4}>Брендов пока нет.</td></tr>}
        </tbody></table></div>}
        {(loadMutation.isError || deleteMutation.isError) && <div className="admin-mutation-error">{getErrorMessage(loadMutation.error ?? deleteMutation.error, 'Операция с брендом не выполнена.')}</div>}
      </section>
      {editing && <Modal title={editing === 'new' ? 'Новый бренд' : 'Редактирование бренда'} onClose={() => { setLogoSelected(false); setEditing(null); }}>
        <form onSubmit={submit}>
          <div className="admin-form-grid">
            <label className="admin-form-wide"><span>Название</span><input name="name" required maxLength={100} defaultValue={editing === 'new' ? '' : editing.name} /></label>
            <label className="admin-form-wide"><span>Описание</span><textarea name="description" maxLength={500} rows={4} defaultValue={editing === 'new' ? '' : editing.description ?? ''} /></label>
            <label className="admin-form-wide"><span>Логотип{editing === 'new' ? ' *' : ''}</span><input name="logo" type="file" required={editing === 'new'} accept="image/jpeg,image/png,image/gif,image/webp" onChange={(event) => setLogoSelected(Boolean(event.target.files?.length))} /><small>{editing === 'new' ? 'Обязательное поле. ' : ''}JPG, PNG, GIF или WebP, не более 5 МБ.</small></label>
          </div>
          <div className="admin-check-grid">
            <label><input name="isActive" type="checkbox" defaultChecked={editing === 'new' ? true : editing.isActive} /> Активен</label>
            {editing !== 'new' && editing.logoUrl && <label><input name="removeLogo" type="checkbox" /> Удалить текущий логотип</label>}
          </div>
          {saveMutation.isError && <div className="admin-mutation-error">{getErrorMessage(saveMutation.error, 'Бренд не сохранён.')}</div>}
          <div className="admin-modal__actions"><button type="button" onClick={() => { setLogoSelected(false); setEditing(null); }}>Отмена</button><button type="submit" disabled={saveMutation.isPending || (editing === 'new' && !logoSelected)}>{saveMutation.isPending ? 'Сохраняем...' : 'Сохранить'}</button></div>
        </form>
      </Modal>}
    </>
  );
}

export function AdminBlogSection() {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<AdminBlogPost | 'new' | null>(null);
  const query = useQuery({ queryKey: ['admin', 'blog'], queryFn: adminService.getBlogPosts });
  const loadMutation = useMutation({ mutationFn: adminService.getBlogPost, onSuccess: setEditing });
  const saveMutation = useMutation({
    mutationFn: ({ id, input }: { id?: number; input: Parameters<typeof adminService.createBlogPost>[0] }) => id ? adminService.updateBlogPost(id, input) : adminService.createBlogPost(input),
    onSuccess: async () => {
      setEditing(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] }),
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
      ]);
    },
  });
  const deleteMutation = useMutation({
    mutationFn: adminService.deleteBlogPost,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'blog'] }),
        queryClient.invalidateQueries({ queryKey: ['articles'] }),
      ]);
    },
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    try {
      const featuredImage = getImage(data, 'featuredImage');
      saveMutation.mutate({
        id: editing === 'new' || editing === null ? undefined : editing.id,
        input: {
          title: String(data.get('title') ?? '').trim(),
          shortDescription: String(data.get('shortDescription') ?? '').trim(),
          content: String(data.get('content') ?? '').trim(),
          category: String(data.get('category') ?? '').trim(),
          readTimeMinutes: Number(data.get('readTimeMinutes')),
          isPublished: data.get('isPublished') === 'on',
          tags: String(data.get('tags') ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
          featuredImage,
          removeFeaturedImage: data.get('removeFeaturedImage') === 'on' && !featuredImage,
        },
      });
    } catch (error) {
      window.alert(getErrorMessage(error, 'Проверьте выбранный файл.'));
    }
  };

  return (
    <>
      <section className="admin-panel-card">
        <div className="admin-section-heading"><div><span className="admin-kicker">Контент</span><h2>Публикации</h2><p>{query.data ? `${query.data.totalPosts} материалов` : 'Статьи магазина'}</p></div><button type="button" onClick={() => { saveMutation.reset(); setEditing('new'); }}><Plus size={17} /> Новая статья</button></div>
        <ResourceState pending={query.isPending} error={query.isError} retry={() => void query.refetch()} />
        {query.data && <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Публикация</th><th>Категория</th><th>Дата</th><th>Статус</th><th aria-label="Действия" /></tr></thead><tbody>
          {query.data.posts.map((post) => <tr key={post.id}><td><div className="admin-post-cell"><span>{post.featuredImageUrl ? <Image size={18} /> : <BookOpen size={18} />}</span><div><strong>{post.title}</strong><small>/{post.slug} · {post.readTimeMinutes} мин.</small></div></div></td><td>{post.category || 'Без категории'}</td><td>{formatDate(post.publishedAt)}</td><td><span className={`admin-badge ${post.isPublished ? 'is-success' : 'is-muted'}`}>{post.isPublished ? 'Опубликована' : 'Черновик'}</span></td><td><div className="admin-row-actions"><button className="admin-row-action" type="button" disabled={loadMutation.isPending} onClick={() => loadMutation.mutate(post.id)} aria-label="Редактировать"><Pencil size={16} /></button><button className="admin-row-action is-danger" type="button" disabled={deleteMutation.isPending} onClick={() => window.confirm(`Удалить статью «${post.title}»?`) && deleteMutation.mutate(post.id)} aria-label="Удалить"><Trash2 size={16} /></button></div></td></tr>)}
          {!query.data.posts.length && <tr><td className="admin-table-empty" colSpan={5}>Публикаций пока нет.</td></tr>}
        </tbody></table></div>}
        {(loadMutation.isError || deleteMutation.isError) && <div className="admin-mutation-error">{getErrorMessage(loadMutation.error ?? deleteMutation.error, 'Операция со статьёй не выполнена.')}</div>}
      </section>
      {editing && <Modal title={editing === 'new' ? 'Новая статья' : 'Редактирование статьи'} onClose={() => setEditing(null)}>
        <form onSubmit={submit}>
          <div className="admin-form-grid">
            <label className="admin-form-wide"><span>Заголовок</span><input name="title" required maxLength={200} defaultValue={editing === 'new' ? '' : editing.title} /></label>
            <label><span>Категория</span><select name="category" required defaultValue={editing === 'new' ? query.data?.categories[0] ?? '' : editing.category ?? ''}><option value="">Выберите категорию</option>{query.data?.categories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label>
            <label><span>Время чтения, мин.</span><input name="readTimeMinutes" type="number" min="1" defaultValue={editing === 'new' ? 5 : editing.readTimeMinutes} /></label>
            <label className="admin-form-wide"><span>Краткое описание</span><textarea name="shortDescription" maxLength={500} rows={3} defaultValue={editing === 'new' ? '' : editing.shortDescription ?? ''} /></label>
            <label className="admin-form-wide"><span>Текст статьи</span><textarea name="content" required rows={10} defaultValue={editing === 'new' ? '' : editing.content} /></label>
            <label className="admin-form-wide"><span><Tags size={14} /> Теги через запятую</span><input name="tags" defaultValue={editing === 'new' ? '' : editing.tags.join(', ')} /></label>
            <label className="admin-form-wide"><span>Обложка</span><input name="featuredImage" type="file" accept="image/jpeg,image/png,image/gif,image/webp" /><small>JPG, PNG, GIF или WebP, не более 5 МБ.</small></label>
          </div>
          <div className="admin-check-grid">
            <label><input name="isPublished" type="checkbox" defaultChecked={editing === 'new' ? true : editing.isPublished} /> Опубликована</label>
            {editing !== 'new' && editing.featuredImageUrl && <label><input name="removeFeaturedImage" type="checkbox" /> Удалить текущую обложку</label>}
          </div>
          {saveMutation.isError && <div className="admin-mutation-error">{getErrorMessage(saveMutation.error, 'Статья не сохранена.')}</div>}
          <div className="admin-modal__actions"><button type="button" onClick={() => setEditing(null)}>Отмена</button><button type="submit" disabled={saveMutation.isPending}>{saveMutation.isPending ? 'Сохраняем...' : 'Сохранить'}</button></div>
        </form>
      </Modal>}
    </>
  );
}
