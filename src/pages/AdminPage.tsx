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
import { AdminBlogSection, AdminBrandsSection, AdminCategoriesSection, AdminOrdersSection } from '@/components/admin/AdminResourceSections';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';
import { adminService, type AdminProduct, type AdminProductDetails } from '@/services/adminService';
import { useAuthStore } from '@/store/useAuthStore';

type AdminSection = 'overview' | 'products' | 'categories' | 'brands' | 'orders' | 'users' | 'discounts' | 'blog' | 'custom-orders';

interface AdminNavItem {
  id: AdminSection;
  label: string;
  icon: LucideIcon;
}

const navigation: AdminNavItem[] = [
  { id: 'overview', label: 'Обзор', icon: LayoutDashboard },
  { id: 'products', label: 'Товары', icon: Boxes },
  { id: 'categories', label: 'Категории', icon: Store },
  { id: 'brands', label: 'Бренды', icon: PackageCheck },
  { id: 'orders', label: 'Заказы', icon: ShoppingBag },
  { id: 'users', label: 'Пользователи', icon: UsersRound },
  { id: 'discounts', label: 'Скидки', icon: Percent },
  { id: 'blog', label: 'Блог', icon: BookOpen },
  { id: 'custom-orders', label: 'Индивидуальные заказы', icon: FilePenLine },
];

const sectionNames: Record<AdminSection, string> = {
  overview: 'Обзор магазина',
  products: 'Товары',
  categories: 'Категории',
  brands: 'Бренды',
  orders: 'Заказы',
  users: 'Пользователи',
  discounts: 'Скидки и промокоды',
  blog: 'Публикации блога',
  'custom-orders': 'Индивидуальные заказы',
};

const moneyFormatter = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const dateFormatter = new Intl.DateTimeFormat('ru-RU', { day: '2-digit', month: 'short', year: 'numeric' });
function formatMoney(value: number) {
  return moneyFormatter.format(value);
}

function formatDate(value: string | null) {
  if (!value) return 'Без срока';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : dateFormatter.format(date);
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message ? error.message : fallback;
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

  const dashboardQuery = useQuery({ queryKey: ['admin', 'stats'], queryFn: adminService.getStats, enabled: section === 'overview' });
  const productsQuery = useQuery({ queryKey: ['admin', 'products'], queryFn: adminService.getProducts, enabled: section === 'overview' || section === 'products' });
  const usersQuery = useQuery({ queryKey: ['admin', 'users'], queryFn: adminService.getUsers, enabled: section === 'users' });
  const discountsQuery = useQuery({ queryKey: ['admin', 'discounts'], queryFn: adminService.getDiscounts, enabled: section === 'discounts' });
  const productOptionsQuery = useQuery({ queryKey: ['admin', 'product-options'], queryFn: adminService.getProductOptions, enabled: productFormOpen });

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
    queryClient.removeQueries({ queryKey: ['user', 'profile'] });
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
    const optionalNumber = (name: string) => {
      const value = String(data.get(name) ?? '').trim();
      return value ? Number(value) : null;
    };
    const imageEntry = data.get('imageFile');
    const imageFile = imageEntry instanceof File && imageEntry.size > 0 ? imageEntry : null;

    if (imageFile && imageFile.size > 5 * 1024 * 1024) {
      window.alert('Размер изображения не должен превышать 5 МБ.');
      return;
    }

    const product = {
      name: String(data.get('name') ?? '').trim(),
      shortDescription: String(data.get('shortDescription') ?? '').trim(),
      fullDescription: String(data.get('fullDescription') ?? '').trim(),
      price: Number(data.get('price')),
      oldPrice: optionalNumber('oldPrice'),
      costPrice: optionalNumber('costPrice'),
      sku: String(data.get('sku') ?? '').trim(),
      stockQuantity,
      lowStockThreshold: optionalNumber('lowStockThreshold'),
      isNew: data.get('isNew') === 'on',
      isActive: data.get('isActive') === 'on',
      categoryId: Number(data.get('categoryId')),
      brandId: Number(data.get('brandId')),
      materialId: Number(data.get('materialId')),
      imageFile,
      removeImage: data.get('removeImage') === 'on' && !imageFile,
    };

    if (editingProduct) {
      updateProductMutation.mutate({ ...product, id: editingProduct.id, mainImageUrl: editingProduct.sourceMainImageUrl, slug: editingProduct.slug });
      return;
    }

    createProductMutation.mutate(product);
  };

  const deleteProduct = (product: AdminProduct) => {
    if (window.confirm(`Удалить товар «${product.name}»? Это действие нельзя отменить.`)) {
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
                    <article><ShieldCheck /><div><strong>Клиентская проверка роли</strong><small>Backend должен вернуть [Authorize(Roles = "Admin")] на AdminController</small></div></article>
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
              {loadProductMutation.isError && <div className="admin-mutation-error">{getErrorMessage(loadProductMutation.error, 'Не удалось загрузить товар для редактирования.')}</div>}
              {deleteProductMutation.isError && <div className="admin-mutation-error">{getErrorMessage(deleteProductMutation.error, 'Не удалось удалить товар.')}</div>}
            </section>
          )}

          {section === 'orders' && <AdminOrdersSection />}

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
          {section === 'categories' && <AdminCategoriesSection />}
          {section === 'brands' && <AdminBrandsSection />}

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

          {section === 'blog' && <AdminBlogSection />}
        </div>
      </main>

      {productFormOpen && (
        <div className="admin-modal" role="dialog" aria-modal="true" aria-labelledby="product-form-title">
          <button className="admin-modal__overlay" type="button" onClick={closeProductForm} aria-label="Закрыть форму" />
          <div className="admin-modal__panel">
            <div className="admin-modal__header"><div><span className="admin-kicker">Каталог</span><h2 id="product-form-title">{editingProduct ? 'Редактирование товара' : 'Новый товар'}</h2></div><button type="button" onClick={closeProductForm} aria-label="Закрыть"><X /></button></div>
            <form key={`${editingProduct?.id ?? 'new'}-${productOptionsQuery.data ? 'ready' : 'loading'}`} onSubmit={saveProduct}>
              <div className="admin-form-grid">
                <label className="admin-form-wide"><span>Название</span><input name="name" required maxLength={200} defaultValue={editingProduct?.name ?? ''} /></label>
                <label><span>Цена, ₽</span><input name="price" type="number" required min="0" step="0.01" defaultValue={editingProduct?.price ?? ''} /></label>
                <label><span>Старая цена, ₽</span><input name="oldPrice" type="number" min="0" step="0.01" defaultValue={editingProduct?.oldPrice ?? ''} /></label>
                <label><span>Себестоимость, ₽</span><input name="costPrice" type="number" min="0" step="0.01" defaultValue={editingProduct?.costPrice ?? ''} /></label>
                <label><span>Остаток, шт.</span><input name="stockQuantity" type="number" required min="0" step="1" defaultValue={editingProduct?.stockQuantity ?? ''} /></label>
                <label><span>Порог малого остатка</span><input name="lowStockThreshold" type="number" min="0" step="1" defaultValue={editingProduct?.lowStockThreshold ?? ''} /></label>
                <label><span>Артикул</span><input name="sku" maxLength={100} defaultValue={editingProduct?.sku ?? ''} /></label>
                <label><span>Категория</span><select name="categoryId" required defaultValue={editingProduct?.categoryId ?? ''}><option value="">Выберите категорию</option>{productOptionsQuery.data?.categories.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                <label><span>Бренд</span><select name="brandId" required defaultValue={editingProduct?.brandId ?? ''}><option value="">Выберите бренд</option>{productOptionsQuery.data?.brands.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                <label><span>Материал</span><select name="materialId" required defaultValue={editingProduct?.materialId ?? ''}><option value="">Выберите материал</option>{productOptionsQuery.data?.materials.map((option) => <option key={option.id} value={option.id}>{option.name}</option>)}</select></label>
                <label className="admin-form-wide"><span>{editingProduct?.mainImageUrl ? 'Новое изображение (заменит текущее)' : 'Изображение товара'}</span><input name="imageFile" type="file" accept=".jpg,.jpeg,.png,.gif,.webp,image/jpeg,image/png,image/gif,image/webp" /><small>JPG, PNG, GIF или WebP, не более 5 МБ.</small></label>
                <label className="admin-form-wide"><span>Краткое описание</span><textarea name="shortDescription" required maxLength={1000} rows={3} defaultValue={editingProduct?.shortDescription ?? ''} /></label>
                <label className="admin-form-wide"><span>Полное описание</span><textarea name="fullDescription" required rows={5} defaultValue={editingProduct?.fullDescription ?? ''} /></label>
              </div>
              <div className="admin-check-grid">
                <label><input name="isActive" type="checkbox" defaultChecked={editingProduct?.isActive ?? true} /> Активен</label>
                <label><input name="isNew" type="checkbox" defaultChecked={editingProduct?.isNew ?? false} /> Новинка</label>
                {editingProduct?.mainImageUrl && <label><input name="removeImage" type="checkbox" /> Удалить текущее изображение</label>}
              </div>
              {productOptionsQuery.isError && <div className="admin-mutation-error">{getErrorMessage(productOptionsQuery.error, 'Не удалось загрузить категории, бренды и материалы.')}</div>}
              {createProductMutation.isError && <div className="admin-mutation-error">{getErrorMessage(createProductMutation.error, 'Товар не создан.')}</div>}
              {updateProductMutation.isError && <div className="admin-mutation-error">{getErrorMessage(updateProductMutation.error, 'Изменения не сохранены.')}</div>}
              <div className="admin-modal__actions"><button type="button" onClick={closeProductForm}>Отмена</button><button type="submit" disabled={createProductMutation.isPending || updateProductMutation.isPending || productOptionsQuery.isPending || productOptionsQuery.isError}>{createProductMutation.isPending ? 'Создаём...' : updateProductMutation.isPending ? 'Сохраняем...' : productOptionsQuery.isPending ? 'Загружаем справочники...' : editingProduct ? 'Сохранить изменения' : 'Создать товар'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
