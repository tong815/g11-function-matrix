import { validateExponentialParams, getExponentialFeatures } from "../math/exponential.js";
import { conversionDefaultParams } from "../conversion/conversionParamSchemas.js";
import { createRootFunction } from "../state/RootFunction.js";

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
    return createRootFunction("exponential", norm.canonical, formId);
  },

  normalizeFromForm(formId, params) {
    return normalizeFromForm(formId, params);
  },

  deriveForms(root, currentLang) {
    const features = getExponentialFeatures(root.canonicalParams, currentLang);
    return { valid: features.valid, error: features.error, features };
  },

  validate(root) {
    return validateExponentialParams(root.canonicalParams).valid;
  },

  toGraphData(root) {
    return { ...root.canonicalParams };
  },

  paramsForForm(root) {
    const { a, b, h, k } = root.canonicalParams;
    return { a, b, h, k };
  },

  updateFromFormInput(root, formId, params) {
    const norm = normalizeFromForm(formId, params);
    if (!norm.valid) return root;
    return createRootFunction("exponential", norm.canonical, formId);
  },

  fromGraphAdapterParams(adapterParams, activeFormId) {
    return createRootFunction("exponential", { ...adapterParams }, activeFormId);
  },

  equationForForm(root, formId, currentLang) {
    const { features, valid } = this.deriveForms(root, currentLang);
    if (!valid || !features?.valid) return null;
    if (formId === FORM_ID) return features.transformedFormText;
    return features.transformedFormText;
  }
};
