import { EPS, fmt, signedTerm, rootBracket } from "./format.js";

export const DEFAULT_QUADRATIC = { a: 1, b: 0, c: -4 };

export function buildStandardFormText(a, b, c) {
  let text = "y = ";
  text += fmt(a) + "x²";
  text += signedTerm(b, "x");
  text += signedTerm(c, "");
  return text.replace("y =  + ", "y = ").replace("y =  - ", "y = -");
}

export function buildVertexFormText(a, h, k) {
  let text = "y = " + fmt(a);
  if (h >= 0) text += "(x - " + fmt(h) + ")²";
  else text += "(x + " + fmt(-h) + ")²";
  text += signedTerm(k, "");
  return text;
}

export function buildFactoredFormText(a, delta, roots, noRealFactoredLabel) {
  if (delta < -EPS) return noRealFactoredLabel;
  if (Math.abs(delta) <= EPS) return "y = " + fmt(a) + rootBracket(roots[0]) + "²";
  return "y = " + fmt(a) + rootBracket(roots[0]) + rootBracket(roots[1]);
}

export function getQuadraticFeatures(quadratic, currentLang, i18n) {
  const a = Number(quadratic.a);
  const b = Number(quadratic.b);
  const c = Number(quadratic.c);
  if (!Number.isFinite(a) || !Number.isFinite(b) || !Number.isFinite(c)) return { valid: false, error: "invalid", a, b, c };
  if (Math.abs(a) < EPS) return { valid: false, error: "aZero", a, b, c };
  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const delta = b * b - 4 * a * c;
  let roots = [];
  if (delta > EPS) {
    const r1 = (-b - Math.sqrt(delta)) / (2 * a);
    const r2 = (-b + Math.sqrt(delta)) / (2 * a);
    roots = r1 < r2 ? [r1, r2] : [r2, r1];
  } else if (Math.abs(delta) <= EPS) {
    roots = [-b / (2 * a)];
  }
  const openingText = a > 0 ? (currentLang === "zh" ? "开口向上" : "opens up") : (currentLang === "zh" ? "开口向下" : "opens down");
  return {
    valid: true, a, b, c, delta, h, k, roots, yIntercept: c, openingText,
    standardFormText: buildStandardFormText(a, b, c),
    vertexFormText: buildVertexFormText(a, h, k),
    factoredFormText: buildFactoredFormText(a, delta, roots, i18n[currentLang].noRealFactored),
    hasTwoRoots: delta > EPS, hasDoubleRoot: Math.abs(delta) <= EPS && roots.length === 1, noRealRoots: delta < -EPS
  };
}

export function getStandardParams(quadratic) {
  const { a, b, c } = quadratic;
  return { a, b, c };
}

export function getFactoredParams(quadratic) {
  const { a, b, c } = quadratic;
  if (Math.abs(a) < EPS) return { a, r1: null, r2: null, hasRealRoots: false, isDouble: false };
  const delta = b * b - 4 * a * c;
  if (delta < -EPS) return { a, r1: null, r2: null, hasRealRoots: false, isDouble: false };
  const sqrtD = Math.sqrt(Math.max(0, delta));
  let r1 = (-b - sqrtD) / (2 * a);
  let r2 = (-b + sqrtD) / (2 * a);
  if (r1 > r2) [r1, r2] = [r2, r1];
  return { a, r1, r2, hasRealRoots: true, isDouble: Math.abs(delta) <= EPS };
}

export function getVertexParams(quadratic, currentLang, i18n) {
  const g = getQuadraticFeatures(quadratic, currentLang, i18n);
  if (!g.valid) return { a: quadratic.a, h: 0, k: quadratic.c };
  return { a: g.a, h: g.h, k: g.k };
}

export function abcFromFactored(a, r1, r2) {
  return { a, b: -a * (r1 + r2), c: a * r1 * r2 };
}

export function abcFromVertex(a, h, k) {
  return { a, b: -2 * a * h, c: a * h * h + k };
}
