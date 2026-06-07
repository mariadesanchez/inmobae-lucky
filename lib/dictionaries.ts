import 'server-only';
import type { Locale } from '@/i18n-config';

// Import directly the Spanish dictionary
import esDict from '@/dictionaries/es.json';

const dictionaries = {
  es: () => esDict,
};

export const getDictionary = async (_locale?: Locale) => {
  return esDict;
};
