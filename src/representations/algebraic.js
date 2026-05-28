import { deriveFeatures } from "../features/index.js";
import { paramsForForm } from "../functionRegistry/index.js";

export function buildAlgebraicRepresentation(root, currentLang, i18n) {
  const features = deriveFeatures(root, currentLang, i18n);
  const forms = {};
  const formIds = {
    quadratic: ["qStandard", "qVertex", "qFactored"],
    linear: ["lSlope", "lPoint", "lStandard"],
    exponential: ["eTransformed"]
  }[root.functionType] ?? [];

  for (const formId of formIds) {
    const params = paramsForForm(root, formId);
    let equationText = null;
    if (features.valid) {
      if (root.functionType === "quadratic") {
        if (formId === "qVertex") equationText = features.vertexFormText;
        else if (formId === "qFactored") equationText = features.factoredFormText;
        else equationText = features.standardFormText;
      } else if (root.functionType === "linear") {
        if (formId === "lPoint") equationText = features.pointSlopeText;
        else if (formId === "lStandard") equationText = features.standardFormText;
        else equationText = features.slopeInterceptText;
      } else if (formId === "eTransformed") {
        equationText = features.transformedFormText;
      }
    }
    forms[formId] = { params, equationText };
  }

  return { valid: features.valid, error: features.error, forms, features };
}
