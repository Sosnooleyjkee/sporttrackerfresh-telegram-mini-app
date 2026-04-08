export function todayIsoDate() {
  return new Date().toISOString().slice(0, 10);
}

export function nowIsoString() {
  return new Date().toISOString();
}

