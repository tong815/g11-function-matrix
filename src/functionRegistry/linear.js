import { EPS } from "../math/format.js";
import { linearFromStandard } from "../math/linear.js";
import { conversionDefaultParams } from "../conversion/conversionParamSchemas.js";
import { createRootFunction } from "../state/RootFunction.js";
import { deriveLinearFeatures, linearCanonicalToAdapterParams } from "../features/linearFeatures.js";
import { deriveFeatures } from "../features/index.js";
import { buildAlgebraicRepresentation } from "../representations/algebraic.js";

function normalizeFromForm(formId, params) {
  switch (formId) {
    case "lSlope": {
      if (!Number.isFinite(params.m) || !Number.isFinite(params.b)) {
        return { valid: false, error: "invalid" };
      }
      return { valid: true, canonical: { m: params.m, b: params.b } };
    }
    case "lPoint": {
      if (!Number.isFinite(params.m) || !Number.isFinite(params.x1) || !Number.isFinite(params.y1)) {
        return { valid: false, error: "invalid" };
      }
      const b = params.y1 - params.m * params.x1;
      return { valid: true, canonical: { m: params.m, b } };
    }
    case "lStandard": {
      if (!Number.isFinite(params.A) || !Number.isFinite(params.B) || !Number.isFinite(params.C)) {
        return { valid: false, error: "invalid" };
      }
      if (Math.abs(params.B) <= EPS) {
        return { valid: false, error: "verticalNotFunction" };
      }
      const m = -params.A / params.B;
      const b = -params.C / params.B;
      if (!Number.isFinite(m) || !Number.isFinite(b)) {
        return { valid: false, error: "invalid" };
      }
      return { valid: true, canonical: { m, b } };
    }
    default:
      return { valid: false, error: "invalid" };
  }
}

function canonicalFromAdapter(adapterParams) {
  if (!adapterParams || adapterParams.mode === "vertical") {
    return { valid: false, error: "verticalNotFunction" };
  }
  const m = Number(adapterParams.m);
  const b = Number(adapterParams.b);
  if (!Number.isFinite(m) || !Number.isFinite(b)) {
    return { valid: false, error: "invalid" };
  }
  return { valid: true, canonical: { m, b } };
}

export const linearDefinition = {
  functionType: "linear",
  adapterId: "linear",
  supportsConversion: true,

  initialByForm(formId) {
    const d = conversionDefaultParams[formId];
    const norm = normalizeFromForm(formId, d);
    if (!norm.valid) {
      return createRootFunction("linear", { m: 1, b: 0 }, formId);
    }
    return createRootFunction("linear", norm.canonical, formId);
  },

  normalizeFromForm(formId, params) {
    return normalizeFromForm(formId, params);
  },

  deriveFeatures(root, currentLang, i18n) {
    return deriveFeatures(root, currentLang, i18n);
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
    return deriveLinearFeatures(root.canonicalParams).valid;
  },

  toGraphData(root) {
    return linearCanonicalToAdapterParams(root.canonicalParams);
  },

  paramsForForm(root, formId) {
    const { m, b } = root.canonicalParams;
    const adapter = linearCanonicalToAdapterParams({ m, b });
    switch (formId) {
      case "lPoint":
        return { m, x1: adapter.point[0], y1: adapter.point[1] };
      case "lStandard":
        return { A: adapter.A, B: adapter.B, C: adapter.C };
      default:
        return { m, b };
    }
  },

  updateFromFormInput(root, formId, params) {
    const norm = normalizeFromForm(formId, params);
    if (!norm.valid) return root;
    return createRootFunction("linear", norm.canonical, formId);
  },

  fromGraphAdapterParams(adapterParams, activeFormId) {
    const norm = canonicalFromAdapter(adapterParams);
    if (!norm.valid) return null;
    return createRootFunction("linear", norm.canonical, activeFormId);
  },

  equationForForm(root, formId, currentLang, i18n) {
    const rep = buildAlgebraicRepresentation(root, currentLang, i18n);
    return rep.forms[formId]?.equationText ?? null;
  }
};
