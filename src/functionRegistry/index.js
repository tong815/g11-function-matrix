import { quadraticDefinition } from "./quadratic.js";
import { linearDefinition } from "./linear.js";
import { exponentialDefinition } from "./exponential.js";
import { deriveFeatures } from "../features/index.js";
import { deriveRepresentations } from "../representations/index.js";

export const functionRegistry = {
  quadratic: quadraticDefinition,
  linear: linearDefinition,
  exponential: exponentialDefinition
};

export function getFunctionDefinition(functionType) {
  return functionRegistry[functionType] ?? null;
}

export function getDefinitionForTopic(topic) {
  return getFunctionDefinition(topic?.id ?? topic);
}

export function initialRootForForm(functionType, formId) {
  const def = getFunctionDefinition(functionType);
  if (!def) return null;
  return def.initialByForm(formId);
}

export function deriveForms(root, currentLang, i18n) {
  const def = getFunctionDefinition(root.functionType);
  return def ? def.deriveForms(root, currentLang, i18n) : { valid: false };
}

export function deriveFeaturesForRoot(root, currentLang, i18n) {
  return deriveFeatures(root, currentLang, i18n);
}

export function deriveRepresentationsForRoot(root, currentLang, i18n) {
  return deriveRepresentations(root, currentLang, i18n);
}

export function equationForForm(root, formId, currentLang, i18n) {
  const def = getFunctionDefinition(root.functionType);
  return def ? def.equationForForm(root, formId, currentLang, i18n) : null;
}

export function paramsForForm(root, formId) {
  const def = getFunctionDefinition(root.functionType);
  return def ? def.paramsForForm(root, formId) : {};
}

export function toGraphData(root) {
  const def = getFunctionDefinition(root.functionType);
  return def ? def.toGraphData(root) : {};
}

export function normalizeFromForm(functionType, formId, params) {
  const def = getFunctionDefinition(functionType);
  return def ? def.normalizeFromForm(formId, params) : { valid: false };
}

export function updateRootFromFormInput(root, formId, params) {
  const def = getFunctionDefinition(root.functionType);
  return def ? def.updateFromFormInput(root, formId, params) : root;
}

export function fromGraphAdapterParams(functionType, adapterParams, activeFormId) {
  const def = getFunctionDefinition(functionType);
  if (!def) return null;
  const root = def.fromGraphAdapterParams(adapterParams, activeFormId);
  if (!root || !def.validate(root)) return null;
  return root;
}

export function validateRoot(root) {
  const def = getFunctionDefinition(root.functionType);
  return def ? def.validate(root) : false;
}
