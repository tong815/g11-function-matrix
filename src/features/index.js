import { deriveQuadraticFeatures } from "./quadraticFeatures.js";
import { deriveLinearFeatures } from "./linearFeatures.js";
import { deriveExponentialFeatures } from "./exponentialFeatures.js";

export function deriveFeatures(root, currentLang, i18n) {
  const { functionType, canonicalParams } = root;
  switch (functionType) {
    case "quadratic":
      return deriveQuadraticFeatures(canonicalParams, currentLang, i18n);
    case "linear":
      return deriveLinearFeatures(canonicalParams);
    case "exponential":
      return deriveExponentialFeatures(canonicalParams, currentLang);
    default:
      return { valid: false, error: "unknown" };
  }
}

export { deriveQuadraticFeatures, deriveLinearFeatures, deriveExponentialFeatures };
