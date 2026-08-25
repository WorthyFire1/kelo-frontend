import { useMemo, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowUpRight,
  BookOpen,
  Boxes,
  ChevronRight,
  CircleUserRound,
  FilePenLine,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  Pencil,
  Percent,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  ShoppingBag,
  Store,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService, type AdminProduct, type AdminProductDetails } from '@/services/adminService';
import { useAuthStore } from '@/store/useAuthStore';

type AdminSection = 'overview' | 'products' | 'orders' | 'users' | 'discounts' | 'blog' | 'custom-orders';

interface AdminNavItem {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
}

const navigation: AdminNavItem[] = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'products', label: 'Товары', icon: Boxes },
  { id: 'orders', label: 'Заказы', icon: ShoppingBag },
  { id: 'users', label: 'Пользователи', icon: UsersRound },
  { id: 'discounts', label: 'Скидки', icon: Percent },
  { id: 'blog', label: 'Блог', icon: BookOpen },
  { id: 'custom-orders', label: 'Индивидуальные заказы', icon: FilePenLine },
];

const sectionNames: Record<AdminSection, string> = {
  overview: 'Обзор магазина',
  products: 'Товары',
  orders: 'Заказы',
  users: 'Пользователи',
  discounts: 'Скидки и промокоды',
  blog: 'Публикации блога',
  'custom-orders': 'Индивидуальные заказы',
};

const moneyFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
const orderStatuses = [
  { value: 'New', label: 'Новый' },
  { value: 'Processing', label: 'В обработке' },
  { value: 'Shipped', label: 'Отправлен' },
  { value: 'Delivered', label: 'Доставлен' },
  { value: 'Cancelled', label: 'Отменён' },
];

function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatDate(value: string | null) {
  if (!value) return 'Без срока';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

function ProductTable({ products, compact = false, onEdit, onDelete, editingId, deletingId }: { products: AdminProduct[]; compact?: boolean; onEdit?: (product: AdminProduct) => void; onDelete?: (product: AdminProduct) => void; editingId?: number; deletingId?: number }) {
  const hasActions = Boolean(onEdit || onDelete);

  return (
    <div className="admin-table-scroll">
      <table className="admin-table">
        <thead><tr><th>Товар</th><th>Категория</th><th>Цена</th><th>Остаток</th><th>Статус</th>{hasActions && <th aria-label="Действия" />}</tr></thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>
                <div className="admin-product-cell">
                  {product.mainImageUrl ? <img src={product.mainImageUrl} alt="" /> : <span>{product.name.slice(0, 1)}</span>}
                  <div><strong>{product.name}</strong><small>#{product.id} · {product.materialName || 'Материал не указан'}</small></div>
                </div>
              </td>
              <td>{product.categoryName || 'Без категории'}</td>
              <td><strong>{formatMoney(product.price)}</strong></td>
              <td>{product.stockQuantity} шт.</td>
              <td><span className={`admin-badge ${product.isActive !== false && product.stockQuantity > 0 ? 'is-success' : 'is-muted'}`}>{product.isActive === false ? 'Скрыт' : product.stockQuantity > 0 ? 'В наличии' : 'Нет в наличии'}</span></td>
              {hasActions && <td><div className="admin-row-actions">
                {onEdit && <button className="admin-row-action" type="button" disabled={editingId === product.id} onClick={() => onEdit(product)} aria-label={`Редактировать ${product.name}`}>{editingId === product.id ? <RefreshCw className="spin" size={16} /> : <Pencil size={16} />}</button>}
                {onDelete && <button className="admin-row-action is-danger" type="button" disabled={deletingId === product.id} onClick={() => onDelete(product)} aria-label={`Удалить ${product.name}`}><Trash2 size={16} /></button>}
              </div></td>}
            </tr>
          ))}
          {!products.length && <tr><td className="admin-table-empty" colSpan={hasActions ? 6 : 5}>Товары не найдены.</td></tr>}
        </tbody>
      </table>
      {compact && products.length > 0 && <div className="admin-table-caption">Последние товары из актуального каталога backend</div>}
    </div>
  );
}

function QueryState({ isPending, isError, onRetry }: { isPending: boolean; isError: boolean; onRetry: () => void }) {
  if (isPending) return <div className="admin-state"><RefreshCw className="spin" /><strong>Получаем данные</strong><span>Запрашиваем актуальную информацию у backend.</span></div>;
  if (isError) return <div className="admin-state is-error"><AlertCircle /><strong>Не удалось загрузить данные</strong><span>Проверьте доступность backend и повторите запрос.</span><button type="button" onClick={onRetry}><RefreshCw size={16} /> Повторить</button></div>;
  return null;
}

function IntegrationNote() {
  return <div className="admin-integration-note"><AlertCircle size={18} /><span><strong>Режим просмотра.</strong> Актуальный backend отдаёт данные, но ещё не содержит административных методов создания, изменения и удаления.</span></div>;
}

function UnavailableSection({ icon: Icon, title, description, endpoints }: { icon: LucideIcon; title: string; description: string; endpoints: string[] }) {
  return (
    <div className="admin-unavailable">
      <span className="admin-unavailable__icon"><Icon size={28} /></span>
      <p className="admin-kicker">Интерфейс подготовлен</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <div className="admin-endpoint-list">
        <strong>Для подключения нужны защищённые методы backend:</strong>
        {endpoints.map((endpoint) => <code key={endpoint}>{endpoint}</code>)}
      </div>
      <div className="admin-unavailable__status"><ShieldCheck size={17} /> Клиент не обращается к пользовательским методам вместо административных</div>
    </div>
  );
}

export function AdminPage() {
  useDocumentTitle('Админ-панель');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user)!;
  const logout = useAuthStore((state) => state.logout);
  const [section, setSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<AdminProductDetails | null>(null);
  const [orderStatus, setOrderStatus] = useState('');

  const dashboardQuery = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminService.getStats, enabled: section === 'overview' });
  const productsQuery = useQuery({ queryKey: ['admin', 'products'], queryFn: adminService.getProducts, enabled: section === 'overview' || section === 'products' });
  const ordersQuery = useQuery({ queryKey: ['admin', 'orders', orderStatus], queryFn: () => adminService.getOrders(orderStatus), enabled: section === 'orders' });
  const usersQuery = useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.getUsers, enabled: section === 'users' });
  const discountsQuery = useQuery({ queryKey: ['admin', 'discounts'], queryFn: adminService.getDiscounts, enabled: section === 'discounts' });
  const blogQuery = useQuery({ queryKey: ['admin', 'blog'], queryFn: adminService.getBlogPosts, enabled: section === 'blog' });

  const createProductMutation = useMutation({
    mutationFn: adminService.createProduct,
    onSuccess: async () => {
      setProductFormOpen(false);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });
  const loadProductMutation = useMutation({
    mutationFn: adminService.getProduct,
    onSuccess: (product) => {
      setEditingProduct(product);
      setProductFormOpen(true);
    },
  });
  const updateProductMutation = useMutation({
    mutationFn: adminService.updateProduct,
    onSuccess: async () => {
      setProductFormOpen(false);
      setEditingProduct(null);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });
  const deleteProductMutation = useMutation({
    mutationFn: adminService.deleteProduct,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['admin', 'products'] }),
        queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] }),
      ]);
    },
  });
  const updateOrderMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => adminService.updateOrderStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] }),
  });

  const filteredProducts = useMemo(() => {
    const products = productsQuery.data?.products ?? [];
    const query = productSearch.trim().toLocaleLowerCase('ru-RU');
    if (!query) return products;
    return products.filter((product) => [product.name, product.categoryName, product.materialName, String(product.id)].join(' ').toLocaleLowerCase('ru-RU').includes(query));
  }, [productSearch, productsQuery.data]);

  const selectSection = (nextSection: AdminSection) => {
    setSection(nextSection);
    setSidebarOpen(false);
  };

  const signOut = () => {
    logout();
    navigate('/');
  };

  const openCreateProduct = () => {
    setEditingProduct(null);
    createProductMutation.reset();
    updateProductMutation.reset();
    setProductFormOpen(true);
  };

  const openEditProduct = (product: AdminProduct) => {
    createProductMutation.reset();
    updateProductMutation.reset();
    loadProductMutation.mutate(product.id);
  };

  const closeProductForm = () => {
    if (createProductMutation.isPending || updateProductMutation.isPending) return;
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const saveProduct = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const stockQuantity = Number(data.get('stockQuantity'));
    const product = {
      name: String(data.get('name') ?? '').trim(),
      shortDescription: String(data.get('shortDescription') ?? '').trim(),
      fullDescription: String(data.get('fullDescription') ?? '').trim(),
      price: Number(data.get('price')),
      sku: String(data.get('sku') ?? '').trim(),
      stockQuantity,
      isInStock: stockQuantity > 0,
      isOnSale: data.get('isOnSale') === 'on',
      isNew: data.get('isNew') === 'on',
      isActive: data.get('isActive') === 'on',
      mainImageUrl: String(data.get('mainImageUrl') ?? '').trim(),
    };

    if (editingProduct) {
      updateProductMutation.mutate({ ...editingProduct, ...product });
      return;
    }

    createProductMutation.mutate(product);
  };

  const deleteProduct = (product: AdminProduct) => {
    if (window.confirm(`Скрыть товар «${product.name}» из каталога?`)) {
      deleteProductMutation.mutate(product.id);
    }
  };

  return (
    <div className="admin-shell">
      <aside className={`admin-sidebar ${sidebarOpen ? 'is-open' : ''}`}>
        <div className="admin-sidebar__brand"><span>КЕЛО</span><small>управление магазином</small></div>
        <button className="admin-sidebar__close" type="button" onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню"><X /></button>
        <nav aria-label="Разделы админ-панели">
          {navigation.map((item) => {
            const Icon = item.icon;
            return <button className={section === item.id ? 'is-active' : ''} type="button" key={item.id} onClick={() => selectSection(item.id)}><Icon size={19} /><span>{item.label}</span><ChevronRight size={16} /></button>;
          })}
        </nav>
        <div className="admin-sidebar__bottom">
          <Link to="/"><Store size={18} /> Вернуться в магазин <ArrowUpRight size={15} /></Link>
          <button type="button" onClick={signOut}><LogOut size={18} /> Выйти</button>
        </div>
      </aside>
      {sidebarOpen && <button className="admin-sidebar-overlay" type="button" onClick={() => setSidebarOpen(false)} aria-label="Закрыть меню" />}

      <main className="admin-main">
        <header className="admin-topbar">
          <button className="admin-menu-button" type="button" onClick={() => setSidebarOpen(true)} aria-label="Открыть меню"><Menu /></button>
          <div><span className="admin-kicker">Панель администратора</span><h1>{sectionNames[section]}</h1></div>
          <div className="admin-profile"><span><strong>{user.name}</strong><small>Admin</small></span><div>{user.firstName?.slice(0, 1) || user.email.slice(0, 1)}</div></div>
        </header>

        <div className="admin-content">
          {section === 'overview' && (
            <>
              <QueryState isPending={dashboardQuery.isPending} isError={dashboardQuery.isError} onRetry={() => void dashboardQuery.refetch()} />
              {dashboardQuery.data && (
                <>
                  <section className="admin-metric-grid">
                    <article><span><Boxes /></span><div><small>Товаров в каталоге</small><strong>{dashboardQuery.data.totalProducts}</strong><em>активных позиций</em></div></article>
                    <article><span><ShoppingBag /></span><div><small>Заказов всего</small><strong>{dashboardQuery.data.totalOrders}</strong><em>{dashboardQuery.data.newOrders} новых заказов</em></div></article>
                    <article><span><CircleUserRound /></span><div><small>Пользователей</small><strong>{dashboardQuery.data.totalUsers}</strong><em>зарегистрировано</em></div></article>
                    <article><span><PackageCheck /></span><div><small>Выручка</small><strong>{formatMoney(dashboardQuery.data.revenue)}</strong><em>по доставленным заказам</em></div></article>
                  </section>
                  <section className="admin-panel-card">
                    <div className="admin-section-heading"><div><span className="admin-kicker">Каталог</span><h2>Новые товары</h2></div><button type="button" onClick={() => selectSection('products')}>Все товары <ChevronRight size={17} /></button></div>
                    <QueryState isPending={productsQuery.isPending} isError={productsQuery.isError} onRetry={() => void productsQuery.refetch()} />
                    {productsQuery.data && <ProductTable products={productsQuery.data.products.slice(0, 6)} compact />}
                  </section>
                  <section className="admin-backend-grid">
                    <article><span className="is-online" /><div><strong>Backend доступен</strong><small>Статистика получена из <code>GET /api/admin/stats</code></small></div></article>
                    <article><ShieldCheck /><div><strong>Роль подтверждена</strong><small>Доступ открыт по роли Admin из JWT</small></div></article>
                    <article><Store /><div><strong>{dashboardQuery.data.totalCategories} категорий</strong><small>Актуальная структура каталога КЕЛО</small></div></article>
                  </section>
                </>
              )}
            </>
          )}

          {section === 'products' && (
            <section className="admin-panel-card">
              <div className="admin-section-heading"><div><span className="admin-kicker">Каталог</span><h2>Все товары</h2><p>{productsQuery.data ? `${productsQuery.data.total} позиций в backend` : 'Актуальные позиции магазина'}</p></div><button type="button" onClick={openCreateProduct}><Plus size={17} /> Добавить товар</button></div>
              <div className="admin-toolbar"><label><Search size={18} /><input value={productSearch} onChange={(event) => setProductSearch(event.target.value)} placeholder="Название, категория или ID" /></label><button type="button" onClick={() => void productsQuery.refetch()}><RefreshCw size={17} /> Обновить</button></div>
              <QueryState isPending={productsQuery.isPending} isError={productsQuery.isError} onRetry={() => void productsQuery.refetch()} />
              {productsQuery.data && <ProductTable products={filteredProducts} onEdit={openEditProduct} onDelete={deleteProduct} editingId={loadProductMutation.variables} deletingId={deleteProductMutation.variables} />}
              {loadProductMutation.isError && <div className="admin-mutation-error">Не удалось загрузить товар для редактирования. Проверьте ответ backend.</div>}
              {deleteProductMutation.isError && <div className="admin-mutation-error">Не удалось удалить товар. Проверьте ответ backend.</div>}
            </section>
          )}

          {section === 'orders' && (
            <section className="admin-panel-card">
              <div className="admin-section-heading"><div><span className="admin-kicker">Продажи</span><h2>Все заказы</h2><p>{ordersQuery.data ? `${ordersQuery.data.total} заказов в backend` : 'Очередь заказов магазина'}</p></div><label className="admin-status-filter"><span>Статус</span><select value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}><option value="">Все</option>{orderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></label></div>
              <QueryState isPending={ordersQuery.isPending} isError={ordersQuery.isError} onRetry={() => void ordersQuery.refetch()} />
              {ordersQuery.data && <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Заказ</th><th>Покупатель</th><th>Дата</th><th>Сумма</th><th>Позиций</th><th>Статус</th></tr></thead><tbody>
                {ordersQuery.data.orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td>{order.customerName}</td><td>{formatDate(order.orderDate)}</td><td><strong>{formatMoney(order.total)}</strong></td><td>{order.itemsCount}</td><td><select className="admin-order-status" value={order.status} disabled={updateOrderMutation.isPending && updateOrderMutation.variables?.id === order.id} onChange={(event) => updateOrderMutation.mutate({ id: order.id, status: event.target.value })}>{orderStatuses.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></td></tr>)}
                {!ordersQuery.data.orders.length && <tr><td className="admin-table-empty" colSpan={6}>Заказов с выбранным статусом нет.</td></tr>}
              </tbody></table></div>}
              {updateOrderMutation.isError && <div className="admin-mutation-error">Статус не сохранён. Повторите попытку.</div>}
            </section>
          )}
          {section === 'users' && (
            <section className="admin-panel-card">
              <div className="admin-section-heading"><div><span className="admin-kicker">Аудитория</span><h2>Пользователи</h2><p>{usersQuery.data ? `${usersQuery.data.total} зарегистрированных пользователей` : 'Покупатели магазина'}</p></div></div>
              <QueryState isPending={usersQuery.isPending} isError={usersQuery.isError} onRetry={() => void usersQuery.refetch()} />
              {usersQuery.data && <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Пользователь</th><th>E-mail</th><th>Телефон</th><th>Регистрация</th><th>Последний вход</th></tr></thead><tbody>
                {usersQuery.data.users.map((customer) => <tr key={customer.id}><td><div className="admin-user-cell"><span>{customer.firstName?.slice(0, 1) || customer.email.slice(0, 1)}</span><div><strong>{`${customer.firstName ?? ''} ${customer.lastName ?? ''}`.trim() || 'Без имени'}</strong><small>ID {customer.id}</small></div></div></td><td>{customer.email}</td><td>{customer.phoneNumber || '—'}</td><td>{formatDate(customer.createdAt)}</td><td>{customer.lastLoginAt ? formatDate(customer.lastLoginAt) : 'Ещё не входил'}</td></tr>)}
                {!usersQuery.data.users.length && <tr><td className="admin-table-empty" colSpan={5}>Пользователей пока нет.</td></tr>}
              </tbody></table></div>}
            </section>
          )}
          {section === 'custom-orders' && <UnavailableSection icon={FilePenLine} title="Заявки на индивидуальные изделия" description="GET /api/customorder выдаёт только заявки авторизованного пользователя. Для общей очереди производства нужен отдельный защищённый контракт." endpoints={['GET /api/admin/custom-orders', 'GET /api/admin/custom-orders/{id}', 'PUT /api/admin/custom-orders/{id}/status']} />}

          {section === 'discounts' && (
            <section className="admin-panel-card">
              <div className="admin-section-heading"><div><span className="admin-kicker">Маркетинг</span><h2>Активные скидки</h2><p>Промокоды, которые сейчас отдаёт backend.</p></div><button type="button" disabled>Новая скидка</button></div>
              <IntegrationNote />
              <QueryState isPending={discountsQuery.isPending} isError={discountsQuery.isError} onRetry={() => void discountsQuery.refetch()} />
              {discountsQuery.data && (
                <div className="admin-discount-grid">
                  {discountsQuery.data.map((discount) => <article key={discount.id}><div><span className="admin-badge is-success">Активна</span><code>{discount.code}</code></div><h3>{discount.name}</h3><p>{discount.description}</p><strong>{discount.type === 'Percentage' ? `${discount.amount}%` : formatMoney(discount.amount)}</strong><small>до {formatDate(discount.validTo)}{discount.minOrderAmount ? ` · от ${formatMoney(discount.minOrderAmount)}` : ''}</small></article>)}
                  {!discountsQuery.data.length && <div className="admin-empty-card"><Percent /><strong>Активных скидок нет</strong><span>Backend вернул пустой список.</span></div>}
                </div>
              )}
            </section>
          )}

          {section === 'blog' && (
            <section className="admin-panel-card">
              <div className="admin-section-heading"><div><span className="admin-kicker">Контент</span><h2>Публикации</h2><p>{blogQuery.data ? `${blogQuery.data.totalPosts} опубликованных материалов` : 'Статьи из актуального backend'}</p></div><button type="button" disabled>Новая статья</button></div>
              <IntegrationNote />
              <QueryState isPending={blogQuery.isPending} isError={blogQuery.isError} onRetry={() => void blogQuery.refetch()} />
              {blogQuery.data && (
                <div className="admin-table-scroll"><table className="admin-table"><thead><tr><th>Публикация</th><th>Категория</th><th>Автор</th><th>Дата</th><th>Чтение</th></tr></thead><tbody>
                  {blogQuery.data.posts.map((post) => <tr key={post.id}><td><div className="admin-post-cell"><span><BookOpen size={18} /></span><div><strong>{post.title}</strong><small>/{post.slug}</small></div></div></td><td>{post.category || 'Без категории'}</td><td>{post.authorName || 'КЕЛО'}</td><td>{formatDate(post.publishedAt)}</td><td>{post.readTimeMinutes} мин.</td></tr>)}
                  {!blogQuery.data.posts.length && <tr><td className="admin-table-empty" colSpan={5}>Опубликованных статей пока нет.</td></tr>}
                </tbody></table></div>
              )}
            </section>
          )}
        </div>
      </main>

      {productFormOpen && (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
          <button className="admin-modal__overlay" type="button" onClick={closeProductForm} aria-label="Закрыть форму" />
          <div className="admin-modal__panel">
            <div className="admin-modal__header"><div><span className="admin-kicker">Каталог</span><h2 id="product-form-title">{editingProduct ? 'Редактирование товара' : 'Новый товар'}</h2></div><button type="button" onClick={closeProductForm} aria-label="Закрыть"><X /></button></div>
            <form key={editingProduct?.id ?? 'new'} onSubmit={saveProduct}>
              <div className="admin-form-grid">
                <label className="admin-form-wide"><span>Название</span><input name="name" required maxLength={200} defaultValue={editingProduct?.name ?? ''} /></label>
                <label><span>Цена, ₽</span><input name="price" type="number" required min="0" step="0.01" defaultValue={editingProduct?.price ?? ''} /></label>
                <label><span>Остаток, шт.</span><input name="stockQuantity" type="number" required min="0" step="1" defaultValue={editingProduct?.stockQuantity ?? ''} /></label>
                <label><span>Артикул</span><input name="sku" required maxLength={100} defaultValue={editingProduct?.sku ?? ''} /></label>
                <label><span>Ссылка на изображение</span><input name="mainImageUrl" type="url" maxLength={200} placeholder="https://..." defaultValue={editingProduct?.mainImageUrl ?? ''} /></label>
                <label className="admin-form-wide"><span>Краткое описание</span><textarea name="shortDescription" required maxLength={1000} rows={3} defaultValue={editingProduct?.shortDescription ?? ''} /></label>
                <label className="admin-form-wide"><span>Полное описание</span><textarea name="fullDescription" required rows={5} defaultValue={editingProduct?.fullDescription ?? ''} /></label>
              </div>
              <div className="admin-check-grid">
                <label><input name="isActive" type="checkbox" defaultChecked={editingProduct?.isActive ?? true} /> Активен</label>
                <label><input name="isNew" type="checkbox" defaultChecked={editingProduct?.isNew ?? false} /> Новинка</label>
                <label><input name="isOnSale" type="checkbox" defaultChecked={editingProduct?.isOnSale ?? false} /> Участвует в акции</label>
              </div>
              {createProductMutation.isError && <div className="admin-mutation-error">Товар не создан. Проверьте обязательные поля и ответ backend.</div>}
              {updateProductMutation.isError && <div className="admin-mutation-error">Изменения не сохранены. Проверьте ответ backend.</div>}
              <div className="admin-modal__actions"><button type="button" onClick={closeProductForm}>Отмена</button><button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending}>{createProductMutation.isPending ? 'Создаём...' : updateProductMutation.isPending ? 'Сохраняем...' : editingProduct ? 'Сохранить изменения' : 'Создать товар'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
