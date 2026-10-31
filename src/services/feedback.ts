/**
 * Punto de extensión para el feedback al usuario (vibración, sonido, etc.).
 * La lógica de ventas solo llama a notify(); agregar sonido o mensajes hápticos más tarde
 * no obliga a tocar el flujo.
 */
export type FeedbackEvent = 'sale-saved' | 'sale-voided' | 'error';

export interface FeedbackService {
  notify(event: FeedbackEvent): void;
}

export const noopFeedback: FeedbackService = { notify() {} };

export const browserFeedback: FeedbackService = {
  notify(event) {
    if (typeof navigator === 'undefined' || !('vibrate' in navigator)) return;
    const pattern = event === 'sale-saved' ? 60 : event === 'error' ? [40, 40, 40] : 30;
    navigator.vibrate(pattern);
  },
};
