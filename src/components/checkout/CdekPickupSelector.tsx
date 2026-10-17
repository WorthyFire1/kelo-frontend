import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import { LoaderCircle, MapPin, X } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { cdekService, type CdekCity, type CdekDeliveryPoint } from '@/services/cdekService';

const CdekPickupMap = lazy(() => import('./CdekPickupMap').then((module) => ({ default: module.CdekPickupMap })));

interface CdekPickupSelectorProps {
  city: CdekCity | null;
  point: CdekDeliveryPoint | null;
  onChange: (city: CdekCity | null, point: CdekDeliveryPoint | null) => void;
}

function hasCoordinates(point: CdekDeliveryPoint): boolean {
  return typeof point.latitude === 'number' && Number.isFinite(point.latitude) &&
    typeof point.longitude === 'number' && Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180 &&
    (point.latitude !== 0 || point.longitude !== 0);
}

export function CdekPickupSelector({ city, point, onChange }: CdekPickupSelectorProps) {
  const [query, setQuery] = useState('');
  const [cityQuery, setCityQuery] = useState('');

  useEffect(() => {
    if (city) return;
    const timeoutId = window.setTimeout(() => setCityQuery(query.trim()), 450);
    return () => window.clearTimeout(timeoutId);
  }, [city, query]);

  const citiesQuery = useQuery({
    queryKey: ['cdek', 'cities', cityQuery],
    queryFn: () => cdekService.searchCities(cityQuery),
    enabled: !city && cityQuery.length >= 2,
    staleTime: 5 * 60 * 1000,
    retry: false,
  });
  const pointsQuery = useQuery({
    queryKey: ['cdek', 'points', city?.code],
    queryFn: () => cdekService.getDeliveryPoints(city!.code),
    enabled: Boolean(city),
    staleTime: 5 * 60 * 1000,
    retry: false,
  });

  const cities = useMemo(() => Array.from(new Map(
    (citiesQuery.data ?? [])
      .filter((item) => !item.country_code || item.country_code.toUpperCase() === 'RU')
      .map((item) => [item.code, item]),
  ).values()), [citiesQuery.data]);

  const points = useMemo(() => {
    const search = query.trim().toLocaleLowerCase('ru-RU');
    const allPoints = pointsQuery.data ?? [];
    if (!search) return allPoints;
    return allPoints.filter((item) => [item.address, item.name, item.code]
      .some((value) => value?.toLocaleLowerCase('ru-RU').includes(search)));
  }, [pointsQuery.data, query]);
  const mappablePoints = useMemo(() => points.filter(hasCoordinates), [points]);

  const chooseCity = (selected: CdekCity) => {
    onChange(selected, null);
    setQuery('');
    setCityQuery('');
  };

  const changeQuery = (value: string) => {
    setQuery(value);
    if (city && point) onChange(city, null);
  };

  return (
    <div className="cdek-pickup-selector form-grid__wide">
      <label htmlFor="cdek-pickup-search">Город и пункт выдачи СДЭК *</label>
      <div className="cdek-pickup-search">
        {city && (
          <button className="cdek-pickup-city" type="button" onClick={() => { onChange(null, null); setQuery(''); setCityQuery(''); }} aria-label={`Изменить город ${city.city}`}>
            {city.city} <X size={14} aria-hidden="true" />
          </button>
        )}
        <input
          id="cdek-pickup-search"
          type="search"
          value={query}
          onChange={(event) => changeQuery(event.target.value)}
          onKeyDown={(event) => { if (event.key === 'Enter') event.preventDefault(); }}
          placeholder={city ? 'Поиск ПВЗ по адресу, названию или коду' : 'Введите полное название города, например Томск'}
          autoComplete="off"
          aria-controls={!city && cities.length ? 'cdek-city-options' : undefined}
          aria-expanded={!city && cities.length > 0}
        />
        {!city && (citiesQuery.isFetching || (query.trim().length >= 2 && cityQuery !== query.trim())) && <LoaderCircle size={17} className="spin" aria-label="Ищем город" />}
      </div>

      {!city && query.trim().length < 2 && <p className="cdek-pickup-hint">Введите город, затем выберите пункт выдачи на карте или в списке.</p>}
      {!city && citiesQuery.isError && <p className="form-error" role="alert">Не удалось найти города СДЭК. Попробуйте ещё раз.</p>}
      {!city && cityQuery === query.trim() && cityQuery.length >= 2 && citiesQuery.isSuccess && !cities.length && (
        <p className="cdek-pickup-hint">Город не найден. Введите полное название и проверьте написание.</p>
      )}
      {!city && cityQuery === query.trim() && cities.length > 0 && (
        <div className="cdek-city-options" id="cdek-city-options" role="listbox" aria-label="Города СДЭК">
          {cities.map((option) => (
            <button type="button" role="option" aria-selected={false} key={option.code} onClick={() => chooseCity(option)}>
              <MapPin size={17} aria-hidden="true" /> {option.city}{option.region ? `, ${option.region}` : ''}
            </button>
          ))}
        </div>
      )}

      {city && pointsQuery.isPending && <p className="cdek-pickup-hint" role="status"><LoaderCircle size={17} className="spin" /> Загружаем пункты выдачи…</p>}
      {city && pointsQuery.isError && <div className="cdek-pickup-hint" role="alert">Не удалось загрузить ПВЗ. <button type="button" onClick={() => void pointsQuery.refetch()}>Повторить</button></div>}
      {city && pointsQuery.isSuccess && !pointsQuery.data.length && <p className="cdek-pickup-hint">Пункты выдачи для этого города не найдены. Можно выбрать другой город.</p>}

      {city && pointsQuery.isSuccess && pointsQuery.data.length > 0 && (
        <div className="cdek-pickup-layout">
          <div className="cdek-pickup-list-panel">
            <p className="cdek-pickup-count">{query ? `Найдено: ${points.length}` : `Пунктов выдачи: ${points.length}`}</p>
            {points.length ? (
              <div className="cdek-pickup-list" aria-label="Пункты выдачи СДЭК">
                {points.slice(0, 100).map((option) => (
                  <button type="button" className={`cdek-pickup-option${point?.code === option.code ? ' is-selected' : ''}`} key={option.code} onClick={() => { onChange(city, option); setQuery(''); }} aria-pressed={point?.code === option.code}>
                    <strong>{option.address || option.name || option.code}</strong>
                    <span>{option.type === 'POSTAMAT' ? 'Постамат' : 'Пункт выдачи'} · {option.code}{option.workTime ? ` · ${option.workTime}` : ''}</span>
                  </button>
                ))}
                {points.length > 100 && <p className="cdek-pickup-hint">Показаны первые 100 адресов. Уточните поиск в строке выше.</p>}
              </div>
            ) : <p className="cdek-pickup-hint">По этому адресу ПВЗ не найден. Попробуйте другую улицу или код.</p>}
          </div>
          {mappablePoints.length > 0 ? (
            <Suspense fallback={<div className="cdek-pickup-map cdek-pickup-map--loading" role="status">Загружаем карту…</div>}>
              <CdekPickupMap city={city} points={points} selectedCode={point?.code ?? null} onSelect={(option) => { onChange(city, option); setQuery(''); }} />
            </Suspense>
          ) : <div className="cdek-pickup-map cdek-pickup-map--loading">{points.length ? 'СДЭК не передал координаты этих пунктов. Выберите адрес в списке.' : 'Нет точек на карте по этому запросу.'}</div>}
        </div>
      )}

      {city && point && (
        <div className="cdek-pickup-selected" role="status">
          <MapPin size={20} aria-hidden="true" />
          <div><strong>Выбран ПВЗ {point.code}</strong><span>{city.city}, {point.address || point.name}</span>{point.workTime && <small>Режим работы: {point.workTime}</small>}{point.phone && <small>Телефон: {point.phone}</small>}</div>
        </div>
      )}
    </div>
  );
}
