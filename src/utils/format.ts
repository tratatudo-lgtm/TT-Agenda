export function getDefaultCurrency(countryCode: string): string {
  const currencyMap: Record<string, string> = {
    PT: 'EUR', ES: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR',
    BR: 'BRL', GB: 'GBP', US: 'USD', CH: 'CHF',
    AO: 'AOA', MZ: 'MZN', CV: 'CVE',
  };
  return currencyMap[countryCode] || 'EUR';
}

export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency,
  }).format(amount);
}
