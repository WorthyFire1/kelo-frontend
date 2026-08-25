# Предлагаемый API для backend КЕЛО

Frontend уже отделён от источника данных. Для переключения с mock-данных на backend достаточно реализовать контракт и установить `VITE_USE_MOCKS=false`.

## Главная

### `GET /api/Home`

Возвращает статистику магазина, новинки, преимущества, данные компании, срок гарантии и количество готовых сюжетов. Главная страница всегда получает эти данные с backend независимо от режима mock-данных остальных разделов.

## Каталог

### `GET /api/categories`

Возвращает список категорий.

### `GET /api/products`

Рекомендуемые query-параметры:

- `query`
- `category`
- `materials`
- `availability`
- `minPrice`
- `maxPrice`
- `badge`
- `sort`
- `page`
- `pageSize`

На первом этапе frontend принимает массив `Product[]`. При добавлении серверной пагинации рекомендуется вернуть:

```json
{
  "items": [],
  "page": 1,
  "pageSize": 24,
  "total": 120
}
```

### `GET /api/products/{slug}`

Возвращает подробную карточку товара.

## Контент

- `GET /api/promotions`
- `GET /api/articles`
- `GET /api/articles/{slug}`
- `GET /api/brands`

## Заказы

### `POST /api/orders`

Тело запроса соответствует интерфейсу `CreateOrderRequest` из `src/types/catalog.ts`.

Рекомендуемый ответ:

```json
{
  "id": "uuid",
  "number": "KL-2026-12345",
  "status": "created",
  "total": 7490,
  "createdAt": "2026-07-27T12:00:00Z"
}
```

Backend должен самостоятельно повторно рассчитать цену, скидки и доставку. Нельзя доверять итоговой сумме, переданной браузером.

## Обратная связь

### `POST /api/feedback`

Типы заявок:

- `callback`
- `custom-order`
- `question`

Для прикрепления эскизов к индивидуальным заказам позднее можно добавить отдельную загрузку файлов через `multipart/form-data` или presigned URL.

## Авторизация

Рекомендуемые маршруты:

- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/logout`
- `GET /api/account`
- `PATCH /api/account`
- `GET /api/account/orders`

Для web-клиента предпочтительны защищённые HttpOnly-cookie или короткоживущий access token с безопасным refresh-механизмом.

## Дополнительные интеграции

- расчёт СДЭК и Почты России;
- платёжный шлюз;
- промокоды;
- остатки и резервирование;
- уведомления e-mail/SMS;
- административная панель или CMS для товаров, статей и акций;
- загрузка и оптимизация изображений;
- отзывы и рейтинг;
- серверный поиск.
