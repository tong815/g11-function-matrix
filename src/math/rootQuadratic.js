/**
 * @deprecated Import from ../functionRegistry/quadratic.js or ../functionRegistry/index.js
 * Kept for tests and gradual migration.
 */
import { quadraticDefinition } from "../functionRegistry/quadratic.js";
import { createRootFunction } from "../state/RootFunction.js";
import { EPS } from "./format.js";
import { getQuadraticFeatures } from "./quadratic.js";

function wrapLegacyRoot(root) {
  const checked = quadraticDefinition.deriveForms(root, "en", { en: {}, zh: {} });
  const d = checked.derived || {};
  return {
    a: root.canonicalParams.a,
    b: root.canonicalParams.b,
    c: root.canonicalParams.c,
    h: d.h ?? 0,
    k: d.k ?? 0,
    r1: d.r1 ?? null,
    r2: d.r2 ?? null,
    form: root.activeForm,
    valid: checked.valid,
    error: checked.error,
    hasRealRoots: d.hasRealRoots ?? true,
    delta: d.delta ?? 0
  };
}

function unwrapToRoot(legacy) {
  return createRootFunction(
    "quadratic",
    { a: legacy.a, b: legacy.b, c: legacy.c },
    legacy.form
  );
}

export function createRootQuadratic(partial = {}) {
  return wrapLegacyRoot(
    createRootFunction("quadratic", { a: partial.a ?? 0, b: partial.b ?? 0, c: partial.c ?? 0 }, partial.form)
  );
}

export const fromStandard = (params, form) =>
  wrapLegacyRoot(quadraticDefinition.updateFromFormInput(
    createRootFunction("quadratic", { a: 0, b: 0, c: 0 }),
    form || "qStandard",
    params
  ));

export const fromVertex = (params, form) =>
  wrapLegacyRoot(quadraticDefinition.updateFromFormInput(
    createRootFunction("quadratic", { a: 0, b: 0, c: 0 }),
    form || "qVertex",
    params
  ));

export const fromFactored = (params, form) =>
  wrapLegacyRoot(quadraticDefinition.updateFromFormInput(
    createRootFunction("quadratic", { a: 0, b: 0, c: 0 }),
    form || "qFactored",
    params
  ));

export const initialRootForForm = (formId) => wrapLegacyRoot(quadraticDefinition.initialByForm(formId));
export const updateRootFromFormInput = (prev, formId, params) =>
  wrapLegacyRoot(quadraticDefinition.updateFromFormInput(unwrapToRoot(prev), formId, params));
export const fromGraphAbc = (abc, form) => wrapLegacyRoot(quadraticDefinition.fromGraphAdapterParams(abc, form));
export const toStandard = (root) => ({ a: root.a, b: root.b, c: root.c });
export const toVertex = (root) => ({ a: root.a, h: root.h, k: root.k });
export const toFactored = (root) => {
  if (!root.hasRealRoots) return { a: root.a, r1: null, r2: null, hasRealRoots: false, isDouble: false };
  const isDouble = root.r1 != null && root.r2 != null && Math.abs(root.r1 - root.r2) < EPS;
  return { a: root.a, r1: root.r1, r2: root.r2, hasRealRoots: true, isDouble };
};
export const paramsForForm = (root, formId) => quadraticDefinition.paramsForForm(unwrapToRoot(root), formId);
export const toGraphData = (root) => toStandard(root);
export const getFeatures = (root, lang, i18n) => getQuadraticFeatures(toStandard(root), lang, i18n);
export const equationForForm = (root, formId, lang, i18n) =>
  quadraticDefinition.equationForForm(unwrapToRoot(root), formId, lang, i18n);

export function recomputeDerived(root) {
  return wrapLegacyRoot(unwrapToRoot(root));
}
