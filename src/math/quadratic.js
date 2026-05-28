import { EPS, fmt, signedTerm, buildFactoredExpression } from "./format.js";
import { deriveQuadraticFeatures } from "../features/quadraticFeatures.js";

export const DEFAULT_QUADRATIC = { a: 1, b: 0, c: 0 };

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
  if (Math.abs(delta) <= EPS) return "y = " + buildFactoredExpression(a, roots[0], roots[0]);
  return "y = " + buildFactoredExpression(a, roots[0], roots[1]);
}

export function getQuadraticFeatures(quadratic, currentLang, i18n) {
  return deriveQuadraticFeatures(quadratic, currentLang, i18n);
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
