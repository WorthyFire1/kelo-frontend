import { apiRequest } from '@/api/client';

export interface FeedbackRequest {
  name: string;
  phone: string;
  email?: string;
  message: string;
  kind: 'callback' | 'custom-order' | 'question';
}

const useMocks = import.meta.env.VITE_USE_MOCKS !== 'false';

export const feedbackService = {
  async send(request: FeedbackRequest): Promise<void> {
    if (!useMocks) {
      await apiRequest<void>('/feedback', {
        method: 'POST',
        body: JSON.stringify(request),
      });
      return;
    }

    await new Promise((resolve) => window.setTimeout(resolve, 500));
  },
};
