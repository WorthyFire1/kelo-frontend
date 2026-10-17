import { apiRequest } from '@/api/client';

export interface CdekCity {
  code: number;
  city: string;
  region?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export interface CdekDeliveryPoint {
  code: string;
  name: string;
  address: string;
  workTime?: string | null;
  phone?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  type?: string | null;
  isDressingRoom?: boolean;
  haveCashless?: boolean;
  allowedCod?: boolean;
}

export const cdekService = {
  searchCities(city: string): Promise<CdekCity[]> {
    return apiRequest(`/Cdek/searchCities?city=${encodeURIComponent(city.trim())}`, {
      method: 'POST',
    });
  },

  getDeliveryPoints(cityCode: number): Promise<CdekDeliveryPoint[]> {
    return apiRequest(`/Cdek/points?cityCode=${encodeURIComponent(cityCode)}`);
  },
};
