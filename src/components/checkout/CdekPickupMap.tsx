import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import type { CdekCity, CdekDeliveryPoint } from '@/services/cdekService';

interface CdekPickupMapProps {
  city: CdekCity;
  points: CdekDeliveryPoint[];
  selectedCode: string | null;
  onSelect: (point: CdekDeliveryPoint) => void;
}

function hasPointCoordinates(point: CdekDeliveryPoint): point is CdekDeliveryPoint & { latitude: number; longitude: number } {
  return typeof point.latitude === 'number' && Number.isFinite(point.latitude) &&
    typeof point.longitude === 'number' && Number.isFinite(point.longitude) &&
    Math.abs(point.latitude) <= 90 && Math.abs(point.longitude) <= 180 &&
    (point.latitude !== 0 || point.longitude !== 0);
}

const defaultTileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const defaultAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export function CdekPickupMap({ city, points, selectedCode, onSelect }: CdekPickupMapProps) {
  const element = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const markers = useRef<L.LayerGroup | null>(null);
  const canvasRenderer = useRef<L.Renderer | null>(null);
  const markerByCode = useRef(new Map<string, L.CircleMarker>());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  useEffect(() => {
    if (!element.current) return;

    const markerRegistry = markerByCode.current;
    const instance = L.map(element.current, { scrollWheelZoom: false }).setView([55.75, 37.62], 11);
    L.tileLayer(import.meta.env.VITE_MAP_TILE_URL || defaultTileUrl, {
      maxZoom: 19,
      attribution: import.meta.env.VITE_MAP_ATTRIBUTION || defaultAttribution,
    }).addTo(instance);
    const layer = L.layerGroup().addTo(instance);
    canvasRenderer.current = L.canvas();
    map.current = instance;
    markers.current = layer;
    const frame = requestAnimationFrame(() => instance.invalidateSize());

    return () => {
      cancelAnimationFrame(frame);
      instance.remove();
      markerRegistry.clear();
      map.current = null;
      markers.current = null;
      canvasRenderer.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = map.current;
    const layer = markers.current;
    if (!instance || !layer) return;

    layer.clearLayers();
    markerByCode.current.clear();
    const bounds: L.LatLngExpression[] = [];

    for (const point of points) {
      if (!hasPointCoordinates(point)) continue;
      const coordinates: L.LatLngExpression = [point.latitude, point.longitude];
      const marker = L.circleMarker(coordinates, {
        renderer: canvasRenderer.current ?? undefined,
        radius: 8,
        color: '#fff',
        weight: 2,
        fillColor: '#22583c',
        fillOpacity: 1,
      });
      const tooltip = document.createElement('span');
      tooltip.textContent = point.address || point.name || point.code;
      marker.bindTooltip(tooltip);
      marker.on('click', () => onSelectRef.current(point));
      marker.addTo(layer);
      markerByCode.current.set(point.code, marker);
      bounds.push(coordinates);
    }

    if (bounds.length) {
      instance.fitBounds(L.latLngBounds(bounds), { padding: [24, 24], maxZoom: 13 });
    } else if (typeof city.latitude === 'number' && typeof city.longitude === 'number') {
      instance.setView([city.latitude, city.longitude], 12);
    }
  }, [city.code, city.latitude, city.longitude, points]);

  useEffect(() => {
    for (const [code, marker] of markerByCode.current) {
      marker.setStyle({ fillColor: code === selectedCode ? '#b46812' : '#22583c', radius: code === selectedCode ? 11 : 8 });
    }
    const selectedMarker = selectedCode ? markerByCode.current.get(selectedCode) : null;
    if (selectedMarker && map.current) {
      map.current.panTo(selectedMarker.getLatLng());
      selectedMarker.openTooltip();
    }
  }, [selectedCode, points]);

  return <div ref={element} className="cdek-pickup-map" role="region" aria-label={`Карта пунктов выдачи СДЭК, ${city.city}`} />;
}
