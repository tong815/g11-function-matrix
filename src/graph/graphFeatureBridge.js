import { deriveFeaturesForRoot, fromGraphAdapterParams } from "../functionRegistry/index.js";
import { linearGraphAdapter } from "./linearGraphAdapter.js";
import { exponentialGraphAdapter } from "./exponentialGraphAdapter.js";

const legacyFeatureAdapters = {
  linear: linearGraphAdapter,
  exponential: exponentialGraphAdapter
};

export function featuresForRoot(root, lang, i18n) {
  if (!root) return { valid: false, error: "noRoot" };
  return deriveFeaturesForRoot(root, lang, i18n);
}

/** Derive features from committed adapter params via RootFunction normalization. */
export function featuresForAdapterParams(adapterId, params, formId, lang, i18n) {
  if (adapterId === "quadratic") {
    const root = fromGraphAdapterParams("quadratic", params, formId ?? "qStandard");
    if (!root) return { valid: false, error: "invalid" };
    return deriveFeaturesForRoot(root, lang, i18n);
  }
  const adapter = legacyFeatureAdapters[adapterId];
  if (!adapter?.getFeatures) return { valid: false, error: "invalid" };
  return adapter.getFeatures(params, lang, i18n);
}
