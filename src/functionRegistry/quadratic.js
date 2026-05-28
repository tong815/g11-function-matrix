import { EPS } from "../math/format.js";
import { abcFromFactored, abcFromVertex } from "../math/quadratic.js";
import { conversionDefaultParams } from "../conversion/conversionParamSchemas.js";
import { createRootFunction } from "../state/RootFunction.js";
import { deriveQuadraticFeatures } from "../features/quadraticFeatures.js";
import { buildAlgebraicRepresentation } from "../representations/algebraic.js";

function recomputeCanonical(canonical) {
  const a = Number(canonical.a);
  const b = Number(canonical.b);
  const c = Number(canonical.c);
  if (![a, b, c].every(Number.isFinite)) {
    return { a, b, c, valid: false, error: "invalid" };
  }
  if (Math.abs(a) < EPS) {
    return { a, b, c, valid: false, error: "aZero" };
  }
  return { a, b, c, valid: true, error: null };
}

function rootFromCanonical(canonical, activeForm) {
  const checked = recomputeCanonical(canonical);
  return createRootFunction(
    "quadratic",
    { a: checked.a, b: checked.b, c: checked.c },
    activeForm
  );
}

function normalizeFromForm(formId, params) {
  switch (formId) {
    case "qStandard": {
      const checked = recomputeCanonical({ a: params.a, b: params.b, c: params.c });
      return {
        valid: checked.valid,
        error: checked.error,
        canonical: { a: checked.a, b: checked.b, c: checked.c }
      };
    }
    case "qVertex": {
      if (![params.a, params.h, params.k].every(Number.isFinite)) {
        return { valid: false, error: "invalid" };
      }
      if (Math.abs(params.a) < EPS) return { valid: false, error: "aZero" };
      const { b, c } = abcFromVertex(params.a, params.h, params.k);
      return { valid: true, canonical: { a: params.a, b, c } };
    }
    case "qFactored": {
      if (!Number.isFinite(params.a)) return { valid: false, error: "invalid" };
      if (Math.abs(params.a) < EPS) return { valid: false, error: "aZero" };
      if (!Number.isFinite(params.r1) || !Number.isFinite(params.r2)) {
        return { valid: false, error: "invalid" };
      }
      const { b, c } = abcFromFactored(params.a, params.r1, params.r2);
      return { valid: true, canonical: { a: params.a, b, c } };
    }
    default:
      return { valid: false, error: "invalid" };
  }
}

export const quadraticDefinition = {
  functionType: "quadratic",
  adapterId: "quadratic",
  supportsConversion: true,

  initialByForm(formId) {
    const d = conversionDefaultParams[formId];
    const norm = normalizeFromForm(formId, d);
    if (!norm.valid) return rootFromCanonical({ a: 1, b: 0, c: 0 }, formId);
    return rootFromCanonical(norm.canonical, formId);
  },

  normalizeFromForm(formId, params) {
    return normalizeFromForm(formId, params);
  },

  deriveFeatures(root, currentLang, i18n) {
    return deriveQuadraticFeatures(root.canonicalParams, currentLang, i18n);
  },

  deriveRepresentations(root, currentLang, i18n) {
    return {
      algebraic: buildAlgebraicRepresentation(root, currentLang, i18n),
      features: this.deriveFeatures(root, currentLang, i18n)
    };
  },

  deriveForms(root, currentLang, i18n) {
    const features = this.deriveFeatures(root, currentLang, i18n);
    const checked = recomputeCanonical(root.canonicalParams);
    return {
      valid: checked.valid && features.valid,
      error: checked.error || features.error,
      features
    };
  },

  validate(root) {
    return recomputeCanonical(root.canonicalParams).valid;
  },

  toGraphData(root) {
    return { ...root.canonicalParams };
  },

  paramsForForm(root, formId) {
    const features = deriveQuadraticFeatures(root.canonicalParams, "en", {
      en: { noRealFactored: "" },
      zh: { noRealFactored: "" }
    });
    if (!features.valid) return { ...root.canonicalParams };
    switch (formId) {
      case "qVertex":
        return { a: features.a, h: features.h, k: features.k };
      case "qFactored": {
        if (!features.hasRealRoots) return { a: features.a, r1: null, r2: null };
        const isDouble =
          features.r1 != null && features.r2 != null && Math.abs(features.r1 - features.r2) < EPS;
        return { a: features.a, r1: features.r1, r2: isDouble ? features.r1 : features.r2 };
      }
      default:
        return { a: features.a, b: features.b, c: features.c };
    }
  },

  updateFromFormInput(root, formId, params) {
    const norm = normalizeFromForm(formId, params);
    if (!norm.valid) return root;
    return rootFromCanonical(norm.canonical, formId);
  },

  fromGraphAdapterParams(adapterParams, activeFormId) {
    return rootFromCanonical(adapterParams, activeFormId);
  },

  equationForForm(root, formId, currentLang, i18n) {
    const rep = buildAlgebraicRepresentation(root, currentLang, i18n);
    return rep.forms[formId]?.equationText ?? null;
  }
};
