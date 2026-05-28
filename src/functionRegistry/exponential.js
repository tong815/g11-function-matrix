import { validateExponentialParams } from "../math/exponential.js";
import { conversionDefaultParams } from "../conversion/conversionParamSchemas.js";
import { createRootFunction } from "../state/RootFunction.js";
import { deriveExponentialFeatures } from "../features/exponentialFeatures.js";
import { buildAlgebraicRepresentation } from "../representations/algebraic.js";

const FORM_ID = "eTransformed";

function normalizeFromForm(_formId, params) {
  const check = validateExponentialParams(params);
  if (!check.valid) return { valid: false, error: check.error };
  return {
    valid: true,
    canonical: { a: check.a, b: check.b, h: check.h, k: check.k }
  };
}

export const exponentialDefinition = {
  functionType: "exponential",
  adapterId: "exponential",
  supportsConversion: false,

  initialByForm(formId) {
    const d = conversionDefaultParams[formId] || conversionDefaultParams[FORM_ID];
    const norm = normalizeFromForm(FORM_ID, d);
    if (!norm.valid) {
      return createRootFunction("exponential", { a: 1, b: 2, h: 0, k: 0 }, formId);
    }
    return createRootFunction("exponential", norm.canonical, formId);
  },

  normalizeFromForm(formId, params) {
    return normalizeFromForm(formId, params);
  },

  deriveFeatures(root, currentLang, i18n) {
    return deriveExponentialFeatures(root.canonicalParams, currentLang);
  },

  deriveRepresentations(root, currentLang, i18n) {
    return {
      algebraic: buildAlgebraicRepresentation(root, currentLang, i18n),
      features: this.deriveFeatures(root, currentLang, i18n)
    };
  },

  deriveForms(root, currentLang, i18n) {
    const features = this.deriveFeatures(root, currentLang, i18n);
    return { valid: features.valid, error: features.error, features };
  },

  validate(root) {
    return validateExponentialParams(root.canonicalParams).valid;
  },

  toGraphData(root) {
    return { ...root.canonicalParams };
  },

  paramsForForm(root) {
    return { ...root.canonicalParams };
  },

  updateFromFormInput(root, formId, params) {
    const norm = normalizeFromForm(formId, params);
    if (!norm.valid) return root;
    return createRootFunction("exponential", norm.canonical, formId);
  },

  fromGraphAdapterParams(adapterParams, activeFormId) {
    return createRootFunction("exponential", { ...adapterParams }, activeFormId);
  },

  equationForForm(root, formId, currentLang, i18n) {
    const rep = buildAlgebraicRepresentation(root, currentLang, i18n);
    return rep.forms[formId]?.equationText ?? rep.forms[FORM_ID]?.equationText ?? null;
  }
};
