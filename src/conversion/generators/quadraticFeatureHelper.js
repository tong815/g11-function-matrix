import { quadraticDefinition } from "../../functionRegistry/quadratic.js";
import { deriveQuadraticFeatures } from "../../features/quadraticFeatures.js";

const defaultI18n = {
  en: { noRealFactored: "No real factored form" },
  zh: { noRealFactored: "无实数因式分解式" }
};

/** CW params + fromFormId → canonical → deriveQuadraticFeatures */
export function featuresFromConversionParams(fromFormId, params, lang, i18n = defaultI18n) {
  const norm = quadraticDefinition.normalizeFromForm(fromFormId, params);
  if (!norm.valid) return null;
  return deriveQuadraticFeatures(norm.canonical, lang, i18n);
}
