import {
  getLinearFeatures,
  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard
} from "../math/linear.js";
import { conversionDefaultParams } from "../conversion/conversionParamSchemas.js";
import { createRootFunction } from "../state/RootFunction.js";

function normalizeFromForm(formId, params) {
  switch (formId) {
    case "lSlope": {
      if (!Number.isFinite(params.m) || !Number.isFinite(params.b)) {
        return { valid: false, error: "invalid" };
      }
      return {
        valid: true,
        canonical: syncLinearFromNormal(params.m, params.b, [1, params.m + params.b])
      };
    }
    case "lPoint": {
      if (!Number.isFinite(params.m) || !Number.isFinite(params.x1) || !Number.isFinite(params.y1)) {
        return { valid: false, error: "invalid" };
      }
      const b = params.y1 - params.m * params.x1;
      return {
        valid: true,
        canonical: syncLinearFromNormal(params.m, b, [params.x1, params.y1])
      };
    }
    case "lStandard": {
      if (!Number.isFinite(params.A) || !Number.isFinite(params.B) || !Number.isFinite(params.C)) {
        return { valid: false, error: "invalid" };
      }
      const converted = linearFromStandard(params.A, params.B, params.C);
      if (!converted.valid) return { valid: false, error: converted.error };
      return { valid: true, canonical: converted.state };
    }
    default:
      return { valid: false, error: "invalid" };
  }
}

export const linearDefinition = {
  functionType: "linear",
  adapterId: "linear",
  supportsConversion: true,

  initialByForm(formId) {
    const d = conversionDefaultParams[formId];
    const norm = normalizeFromForm(formId, d);
    if (!norm.valid) {
      return createRootFunction("linear", syncLinearFromNormal(1, 0, [0, 0]), formId);
    }
    return createRootFunction("linear", norm.canonical, formId);
  },

  normalizeFromForm(formId, params) {
    return normalizeFromForm(formId, params);
  },

  deriveForms(root) {
    const features = getLinearFeatures(root.canonicalParams);
    return { valid: features.valid, error: features.error, features };
  },

  validate(root) {
    return getLinearFeatures(root.canonicalParams).valid;
  },

  toGraphData(root) {
    return { ...root.canonicalParams };
  },

  paramsForForm(root, formId) {
    const lin = root.canonicalParams;
    switch (formId) {
      case "lPoint": {
        const p = getPointSlopeParams(lin);
        return { m: p.m, x1: p.x1, y1: p.y1 };
      }
      case "lStandard": {
        const p = getLinearStandardParams(lin);
        return { A: p.A, B: p.B, C: p.C };
      }
      default: {
        const p = getSlopeInterceptParams(lin);
        return { m: p.m, b: p.b };
      }
    }
  },

  updateFromFormInput(root, formId, params) {
    const norm = normalizeFromForm(formId, params);
    if (!norm.valid) return root;
    return createRootFunction("linear", norm.canonical, formId);
  },

  fromGraphAdapterParams(adapterParams, activeFormId) {
    return createRootFunction("linear", { ...adapterParams }, activeFormId);
  },

  equationForForm(root, formId, currentLang, i18n) {
    const { features, valid } = this.deriveForms(root, currentLang, i18n);
    if (!valid || !features?.valid) return null;
    if (formId === "lPoint") return features.pointSlopeText;
    if (formId === "lStandard") return features.standardFormText;
    return features.slopeInterceptText;
  }
};
