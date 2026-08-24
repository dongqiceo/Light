const PRICE_RE = /^(0|[1-9]\d*)\.(\d{2})$/;

const LOCALE_CURRENCY = {
  zh: { locale: 'zh-CN', currency: 'CNY' },
  en: { locale: 'en-US', currency: 'USD' },
  ar: { locale: 'ar-AE', currency: 'AED' },
};

export function isCanonicalPrice(text) {
  return typeof text === 'string' && PRICE_RE.test(text);
}

export function canonicalizePrice(value) {
  if (value === undefined || value === null || value === '') return '';
  const text = String(value).trim();
  if (!/^(0|[1-9]\d*)(\.\d{1,2})?$/.test(text)) return text;
  const [integerDigits, fraction = ''] = text.split('.');
  return `${integerDigits}.${(fraction + '00').slice(0, 2)}`;
}

function localizeDigits(asciiDigits, locale) {
  const formatter = new Intl.NumberFormat(locale, { useGrouping: false });
  return asciiDigits.replace(/[0-9]/g, (digit) => {
    const integerPart = formatter.formatToParts(Number(digit)).find((part) => part.type === 'integer');
    return integerPart ? integerPart.value : digit;
  });
}

export function formatLocalePrice(priceText, lang) {
  if (typeof BigInt !== 'function' || typeof Intl === 'undefined' || !Intl.NumberFormat?.prototype?.formatToParts) {
    return null;
  }
  const matched = PRICE_RE.exec(priceText);
  if (!matched) return null;
  const cfg = LOCALE_CURRENCY[lang] || LOCALE_CURRENCY.en;
  const integerDigits = matched[1];
  const fractionDigits = matched[2];
  const formatter = new Intl.NumberFormat(cfg.locale, {
    style: 'currency',
    currency: cfg.currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const localizedFraction = localizeDigits(fractionDigits, cfg.locale);
  return formatter
    .formatToParts(BigInt(integerDigits))
    .map((part) => (part.type === 'fraction' ? localizedFraction : part.value))
    .join('');
}
