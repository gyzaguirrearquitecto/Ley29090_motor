export function toNumber(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export function isTrue(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

export function normalizeStr(s) {
  return (s ?? "").toString().trim().toLowerCase();
}

export function matchCondition(input, cond) {
  if (!cond || typeof cond !== "object") return true;

  if (cond.al_menos_uno && typeof cond.al_menos_uno === "object") {
    return Object.entries(cond.al_menos_uno).some(([k, v]) => matchCondition(input, { [k]: v }));
  }

  for (const [key, val] of Object.entries(cond)) {
    if (key === "al_menos_uno") continue;

    if (key.endsWith("_en") && Array.isArray(val)) {
      const baseKey = key.replace(/_en$/, "");
      const inVal = normalizeStr(input[baseKey]);
      const set = val.map(normalizeStr);
      if (!set.includes(inVal)) return false;
      continue;
    }

    if (key.endsWith("_max")) {
      const baseKey = key.replace(/_max$/, "");
      const n = toNumber(input[baseKey]);
      if (n === null) return false;
      if (n > Number(val)) return false;
      continue;
    }

    if (key.endsWith("_min")) {
      const baseKey = key.replace(/_min$/, "");
      const n = toNumber(input[baseKey]);
      if (n === null) return false;
      if (n < Number(val)) return false;
      continue;
    }

    if (typeof val === "boolean") {
      if (isTrue(input[key]) !== val) return false;
      continue;
    }

    if (Array.isArray(val)) {
      const inVal = normalizeStr(input[key]);
      const set = val.map(normalizeStr);
      if (!set.includes(inVal)) return false;
      continue;
    }

    if (typeof val === "number") {
      const n = toNumber(input[key]);
      if (n === null || n !== val) return false;
      continue;
    }

    if (normalizeStr(input[key]) !== normalizeStr(val)) return false;
  }

  return true;
}

export function uniq(arr) {
  return [...new Set((arr ?? []).filter(Boolean))];
}
