/**
 * Formats a number as currency based on the provided currency code and locale.
 * @param value The numeric value to format
 * @param currency The currency code (e.g., 'EUR', 'BRL', 'USD')
 * @param locale The locale string (optional, defaults to 'pt-PT')
 */
export const formatCurrency = (value: number, currency: string = 'EUR', locale: string = 'pt-PT') => {
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currency,
    }).format(value);
  } catch (error) {
    console.error('Error formatting currency:', error);
    return `${currency} ${value.toFixed(2)}`;
  }
};

/**
 * Maps country codes to their default currency.
 */
export const countryToCurrency: Record<string, string> = {
  'PT': 'EUR',
  'ES': 'EUR',
  'FR': 'EUR',
  'DE': 'EUR',
  'IT': 'EUR',
  'BR': 'BRL',
  'GB': 'GBP',
  'US': 'USD',
  'CH': 'CHF',
  'AO': 'AOA',
  'MZ': 'MZN',
  'CV': 'CVE',
  'GW': 'XOF',
  'ST': 'STN',
  'TL': 'USD',
};

export const getDefaultCurrency = (countryCode: string): string => {
  return countryToCurrency[countryCode.toUpperCase()] || 'USD';
};
