import 'server-only';

// Import directly the Spanish dictionary
import esDict from '@/dictionaries/es.json';

const dictionaries = {
  es: () => esDict,
};

export const getDictionary = async () => {
  return esDict;
};
