import { PriceData, Token } from '../types';

const PRICE_URL = 'https://interview.switcheo.com/prices.json';

export const fetchPrices = async (): Promise<Token[]> => {
  try {
    const response = await fetch(PRICE_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch prices: ${response.statusText}`);
    }
    const data: PriceData[] = await response.json();

    // The API might return duplicate entries or multiple dates.
    // We want the most recent price for each currency.
    const priceMap = new Map<string, PriceData>();

    data.forEach((item) => {
      const existing = priceMap.get(item.currency);
      // If we don't have it, or the new one is more recent (lexicographical string comparison works for ISO dates usually, 
      // but let's assume the data is reasonably sorted or we replace if we want strict latest logic)
      // Actually, standard practice for this dataset is usually just taking the latest entry or unique currency.
      // Let's ensure uniqueness by currency.
      if (!existing || new Date(item.date) > new Date(existing.date)) {
        priceMap.set(item.currency, item);
      }
    });

    const tokens: Token[] = Array.from(priceMap.values()).map((p) => ({
      symbol: p.currency,
      name: p.currency, // The API only gives currency code, using it as name
      price: p.price,
    }));

    return tokens;
  } catch (error) {
    console.error('Error fetching prices:', error);
    return [];
  }
};
