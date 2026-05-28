import { deriveFeatures } from "../features/index.js";
import { linearCanonicalToAdapterParams } from "../features/linearFeatures.js";

export function buildGraphRepresentation(root, currentLang, i18n) {
  const features = deriveFeatures(root, currentLang, i18n);
  if (!features.valid) {
    return { valid: false, error: features.error, adapterParams: null, evaluate: null, requiredPoints: [] };
  }

  let adapterParams = null;
  let evaluate = null;
  let requiredPoints = [];

  if (root.functionType === "quadratic") {
    const { a, b, c } = root.canonicalParams;
    adapterParams = { a, b, c };
    evaluate = (x) => a * x * x + b * x + c;
    requiredPoints = [{ x: features.h, y: features.k }];
  } else if (root.functionType === "linear") {
    const { m, b } = root.canonicalParams;
    adapterParams = linearCanonicalToAdapterParams({ m, b });
    evaluate = (x) => m * x + b;
    requiredPoints = [{ x: 0, y: b }];
    if (features.xInt != null && Number.isFinite(features.xInt)) {
      requiredPoints.push({ x: features.xInt, y: 0 });
    }
  } else if (root.functionType === "exponential") {
    adapterParams = { ...root.canonicalParams };
    const { a, b, h, k } = adapterParams;
    evaluate = (x) => a * Math.pow(b, x - h) + k;
    requiredPoints = [{ x: h, y: a + k }];
  }

  return { valid: true, features, adapterParams, evaluate, requiredPoints };
}
