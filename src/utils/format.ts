/**
 * Locale-aware formatting helpers.
 *
 * All display values go through these so numbers, byte sizes and timestamps
 * follow the visitor's locale instead of being assembled from string fragments.
 */

const BYTES_PER_UNIT = 1024;
const BYTE_UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;
const BYTES_PER_GIGABYTE = BYTES_PER_UNIT ** 3;

const decimalFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

const integerFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 0,
});

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
  timeStyle: 'short',
});

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  dateStyle: 'medium',
});

/** Placeholder shown when a value is missing rather than rendering `undefined`. */
export const EMPTY_VALUE = '—';

/** Formats an integer count, e.g. `1,024`. */
export const formatCount = (value: number | null | undefined): string =>
  typeof value === 'number' && Number.isFinite(value) ? integerFormatter.format(value) : EMPTY_VALUE;

/** Formats a decimal number with up to two fraction digits. */
export const formatDecimal = (value: number | null | undefined): string =>
  typeof value === 'number' && Number.isFinite(value) ? decimalFormatter.format(value) : EMPTY_VALUE;

/** Formats a 0-100 usage figure as a locale-aware percentage. */
export const formatPercent = (value: number | null | undefined): string =>
  typeof value === 'number' && Number.isFinite(value)
    ? percentFormatter.format(value / 100)
    : EMPTY_VALUE;

/** Formats a byte count using the largest sensible unit. */
export const formatBytes = (bytes: number | null | undefined): string => {
  if (typeof bytes !== 'number' || !Number.isFinite(bytes) || bytes < 0) {
    return EMPTY_VALUE;
  }

  let unitIndex = 0;
  let value = bytes;
  while (value >= BYTES_PER_UNIT && unitIndex < BYTE_UNITS.length - 1) {
    value /= BYTES_PER_UNIT;
    unitIndex += 1;
  }

  return `${decimalFormatter.format(value)} ${BYTE_UNITS[unitIndex]}`;
};

/** Formats a byte count as gigabytes, e.g. `4.21 GB`. */
export const formatGigabytesFromBytes = (bytes: number | null | undefined): string =>
  typeof bytes === 'number' && Number.isFinite(bytes)
    ? `${decimalFormatter.format(bytes / BYTES_PER_GIGABYTE)} GB`
    : EMPTY_VALUE;

/** Formats a value that is already expressed in gigabytes. */
export const formatGigabytes = (gigabytes: number | null | undefined): string =>
  typeof gigabytes === 'number' && Number.isFinite(gigabytes)
    ? `${decimalFormatter.format(gigabytes)} GB`
    : EMPTY_VALUE;

/** Formats an ISO timestamp as a localised date and time. */
export const formatDateTime = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    return EMPTY_VALUE;
  }
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateTimeFormatter.format(date);
};

/** Formats an ISO timestamp as a localised date. */
export const formatDate = (isoDate: string | null | undefined): string => {
  if (!isoDate) {
    return EMPTY_VALUE;
  }
  const date = new Date(isoDate);
  return Number.isNaN(date.getTime()) ? EMPTY_VALUE : dateFormatter.format(date);
};
