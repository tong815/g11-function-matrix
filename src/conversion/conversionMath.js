import { EPS, fmt, buildFactoredExpression } from "../math/format.js";

export function L(lang, en, zh) {
  return lang === "zh" ? zh : en;
}

export function formatRational(num, den) {
  if (!Number.isFinite(num) || !Number.isFinite(den) || Math.abs(den) < EPS) return "?";
  const val = num / den;
  for (let d = 1; d <= 64; d++) {
    const n = Math.round(val * d);
    if (Math.abs(n / d - val) < 1e-8) {
      if (d === 1) return String(n);
      const g = gcd(Math.abs(n), d);
      const sn = n / g;
      const sd = d / g;
      if (sd === 1) return String(sn);
      return `${sn}/${sd}`;
    }
  }
  return fmt(val);
}

function gcd(a, b) {
  while (b) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a || 1;
}

export function evalStandard(a, b, c, x) {
  return a * x * x + b * x + c;
}

export function buildVertexFormText(a, h, k) {
  let inner = "x";
  if (Math.abs(h) >= EPS) {
    inner = h > 0 ? "(x - " + fmt(h) + ")" : "(x + " + fmt(-h) + ")";
  }
  let text = "y = " + fmt(a) + inner + "²";
  if (Math.abs(k) >= EPS) text += k > 0 ? " + " + fmt(k) : " - " + fmt(Math.abs(k));
  return text;
}

export function buildStandardFromVertex(a, h, k) {
  const b = -2 * a * h;
  const c = a * h * h + k;
  return { b, c };
}

export function buildFactoredText(a, r1, r2) {
  return "y = " + buildFactoredExpression(a, r1, r2);
}

export function buildSlopeIntercept(m, b) {
  let text = "y = " + fmt(m) + "x";
  if (Math.abs(b) >= EPS) text += b > 0 ? " + " + fmt(b) : " - " + fmt(Math.abs(b));
  return text;
}

export function buildPointSlope(m, x1, y1) {
  const xPart = Math.abs(x1) < EPS ? "x" : x1 > 0 ? "(x - " + fmt(x1) + ")" : "(x + " + fmt(-x1) + ")";
  return "y - " + fmt(y1) + " = " + fmt(m) + xPart;
}
