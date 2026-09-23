export interface FeedbackRequest {
  name: string;
  phone: string;
  email?: string;
  message: string;
  kind: 'callback' | 'custom-order' | 'question';
}

export const feedbackService = {
  async send(request: FeedbackRequest): Promise<void> {
    const subject = request.kind === 'callback' ? 'Заказать звонок' : 'Вопрос с сайта КЕЛО';
    const body = [
      `Имя: ${request.name}`,
      `Телефон: ${request.phone}`,
      `E-mail: ${request.email || 'не указан'}`,
      '',
      request.message,
    ].join('\n');
    window.location.href = `mailto:kelo_creates@mail.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  },
};
