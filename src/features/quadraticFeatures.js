import { EPS } from "../math/format.js";
import {
  buildStandardFormText,
  buildVertexFormText,
  buildFactoredFormText
} from "../math/quadratic.js";

export function deriveQuadraticFeatures(canonical, currentLang, i18n) {
  const a = Number(canonical.a);
  const b = Number(canonical.b);
  const c = Number(canonical.c);
  if (![a, b, c].every(Number.isFinite)) {
    return { valid: false, error: "invalid", a, b, c };
  }
  if (Math.abs(a) < EPS) {
    return { valid: false, error: "aZero", a, b, c };
  }
  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const delta = b * b - 4 * a * c;
  let r1 = null;
  let r2 = null;
  let roots = [];
  let hasRealRoots = delta >= -EPS;
  if (delta > EPS) {
    const sqrtD = Math.sqrt(delta);
    r1 = (-b - sqrtD) / (2 * a);
    r2 = (-b + sqrtD) / (2 * a);
    if (r1 > r2) [r1, r2] = [r2, r1];
    roots = [r1, r2];
  } else if (Math.abs(delta) <= EPS) {
    r1 = r2 = -b / (2 * a);
    roots = [r1];
  } else {
    hasRealRoots = false;
  }
  const openingText =
    a > 0
      ? currentLang === "zh"
        ? "开口向上"
        : "opens up"
      : currentLang === "zh"
        ? "开口向下"
        : "opens down";
  const noRealLabel = i18n[currentLang]?.noRealFactored ?? "No real factored form";
  return {
    valid: true,
    error: null,
    a,
    b,
    c,
    h,
    k,
    delta,
    r1,
    r2,
    roots,
    hasRealRoots,
    yIntercept: c,
    openingText,
    axisOfSymmetry: h,
    vertex: { x: h, y: k },
    stretchFactor: a,
    standardFormText: buildStandardFormText(a, b, c),
    vertexFormText: buildVertexFormText(a, h, k),
    factoredFormText: buildFactoredFormText(a, delta, roots, noRealLabel),
    hasTwoRoots: delta > EPS,
    hasDoubleRoot: Math.abs(delta) <= EPS && roots.length === 1,
    noRealRoots: delta < -EPS
  };
}
