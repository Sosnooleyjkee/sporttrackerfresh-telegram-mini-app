export function formatNumber(value: number) {
  return new Intl.NumberFormat("ru-RU").format(value);
}

export function formatDecimal(value: number) {
  return new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(value);
}

