import { EPS } from "../math/format.js";
import { abcFromFactored, abcFromVertex, getQuadraticFeatures } from "../math/quadratic.js";
import { conversionDefaultParams } from "../conversion/conversionParamSchemas.js";
import { createRootFunction } from "../state/RootFunction.js";

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
  const h = -b / (2 * a);
  const k = a * h * h + b * h + c;
  const delta = b * b - 4 * a * c;
  let r1 = null;
  let r2 = null;
  let hasRealRoots = delta >= -EPS;
  if (delta > EPS) {
    const sqrtD = Math.sqrt(delta);
    r1 = (-b - sqrtD) / (2 * a);
    r2 = (-b + sqrtD) / (2 * a);
    if (r1 > r2) [r1, r2] = [r2, r1];
  } else if (Math.abs(delta) <= EPS) {
    r1 = r2 = -b / (2 * a);
  } else {
    hasRealRoots = false;
  }
  return {
    a,
    b,
    c,
    valid: true,
    error: null,
    derived: { h, k, r1, r2, delta, hasRealRoots }
  };
}

function rootFromCanonical(canonical, activeForm) {
  const checked = recomputeCanonical(canonical);
  return createRootFunction("quadratic", { a: checked.a, b: checked.b, c: checked.c }, activeForm);
}

function normalizeFromForm(formId, params) {
  switch (formId) {
    case "qStandard": {
      const checked = recomputeCanonical({ a: params.a, b: params.b, c: params.c });
      return { valid: checked.valid, error: checked.error, canonical: { a: checked.a, b: checked.b, c: checked.c } };
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

  deriveForms(root, currentLang, i18n) {
    const checked = recomputeCanonical(root.canonicalParams);
    const features = getQuadraticFeatures(
      { a: checked.a, b: checked.b, c: checked.c },
      currentLang,
      i18n
    );
    return {
      valid: checked.valid && features.valid,
      error: checked.error || features.error,
      features,
      derived: checked.derived
    };
  },

  validate(root) {
    return recomputeCanonical(root.canonicalParams).valid;
  },

  toGraphData(root) {
    const { a, b, c } = root.canonicalParams;
    return { a, b, c };
  },

  paramsForForm(root, formId) {
    const checked = recomputeCanonical(root.canonicalParams);
    if (!checked.valid) return { a: checked.a, b: checked.b, c: checked.c };
    const { derived } = checked;
    switch (formId) {
      case "qVertex":
        return { a: checked.a, h: derived.h, k: derived.k };
      case "qFactored": {
        if (!derived.hasRealRoots) {
          return { a: checked.a, r1: null, r2: null };
        }
        const isDouble = Math.abs(derived.r1 - derived.r2) < EPS;
        return { a: checked.a, r1: derived.r1, r2: isDouble ? derived.r1 : derived.r2 };
      }
      default:
        return { a: checked.a, b: checked.b, c: checked.c };
    }
  },

  updateFromFormInput(root, formId, params) {
    const norm = normalizeFromForm(formId, params);
    if (!norm.valid && formId === "qFactored") {
      return rootFromCanonical(
        { a: params.a ?? root.canonicalParams.a, b: root.canonicalParams.b, c: root.canonicalParams.c },
        formId
      );
    }
    if (!norm.valid) return root;
    return rootFromCanonical(norm.canonical, formId);
  },

  fromGraphAdapterParams(adapterParams, activeFormId) {
    return rootFromCanonical(adapterParams, activeFormId);
  },

  equationForForm(root, formId, currentLang, i18n) {
    const { features, valid } = this.deriveForms(root, currentLang, i18n);
    if (!valid || !features?.valid) return null;
    if (formId === "qVertex") return features.vertexFormText;
    if (formId === "qFactored") return features.factoredFormText;
    return features.standardFormText;
  }
};
