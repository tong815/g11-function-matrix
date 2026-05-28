import { validateExponentialParams, getExponentialFeatures } from "../math/exponential.js";

export function deriveExponentialFeatures(canonical, currentLang) {
  const check = validateExponentialParams(canonical);
  if (!check.valid) {
    return getExponentialFeatures(canonical, currentLang);
  }
  return getExponentialFeatures(
    { a: check.a, b: check.b, h: check.h, k: check.k },
    currentLang
  );
}
