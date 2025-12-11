export interface PriceData {
  currency: string;
  date: string;
  price: number;
}

export interface Token {
  symbol: string;
  name: string; // Using symbol as name if name isn't available
  price: number;
}

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}
