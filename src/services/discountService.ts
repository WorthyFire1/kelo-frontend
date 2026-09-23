import { apiRequest } from '@/api/client';

export interface DiscountValidation {
  isValid: boolean;
  message: string;
  discountId?: number | null;
  type?: string | null;
  amount?: number | null;
  minOrderAmount?: number | null;
  description?: string | null;
}

export const discountService = {
  async validate(code: string, orderAmount: number): Promise<DiscountValidation> {
    const result = await apiRequest<DiscountValidation>('/Discount/validate', {
      method: 'POST',
      body: JSON.stringify({ code, orderAmount }),
    });

    if (result.isValid && result.minOrderAmount && orderAmount < result.minOrderAmount) {
      return {
        ...result,
        isValid: false,
        message: `Промокод действует для заказов от ${result.minOrderAmount.toLocaleString('ru-RU')} ₽`,
      };
    }

    return result.isValid ? { ...result, message: 'Промокод действителен' } : result;
  },
};
