import { PriceData, Token } from '../types';

const PRICE_URL = 'https://interview.switcheo.com/prices.json';

export const fetchPrices = async (): Promise<Token[]> => {
  try {
    const response = await fetch(PRICE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }
    const data: PriceData[] = await response.json();

    const priceMap = new Map<string, PriceData>();

    data.forEach((item) => {
      const existing = priceMap.get(item.currency);
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        priceMap.set(item.currency, item);
      }
    });

    const tokens: Token[] = Array.from(priceMap.values()).map((p) => ({
      symbol: p.currency,
      name: p.currency,
      price: p.price,
    }));

    return tokens;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
};
