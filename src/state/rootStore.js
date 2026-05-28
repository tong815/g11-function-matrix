import { initialRootForForm } from "../functionRegistry/index.js";
import { createRootFunction } from "./RootFunction.js";

const FUNCTION_TYPES = ["quadratic", "linear", "exponential"];

function defaultRoots() {
  return {
    quadratic: initialRootForForm("quadratic", "qStandard"),
    linear: initialRootForForm("linear", "lSlope"),
    exponential: initialRootForForm("exponential", "eTransformed")
  };
}

/** Per-type RootFunction instances (one mathematical function per type). */
let rootsByType = defaultRoots();

let activeType = "quadratic";

export function getActiveFunctionType() {
  return activeType;
}

export function setActiveFunctionType(functionType) {
  if (FUNCTION_TYPES.includes(functionType)) activeType = functionType;
}

export function getRoot(functionType) {
  const t = functionType ?? activeType;
  return rootsByType[t] ?? null;
}

export function getActiveRoot() {
  return rootsByType[activeType];
}

export function setRoot(functionType, root) {
  if (!FUNCTION_TYPES.includes(functionType) || !root) return;
  rootsByType[functionType] = root;
}

export function replaceActiveRoot(root) {
  setRoot(activeType, root);
}

export function resetRootForForm(functionType, formId) {
  const root = initialRootForForm(functionType, formId);
  if (root) {
    root.activeForm = formId;
    setRoot(functionType, root);
  }
  return getRoot(functionType);
}

export function resetAllRoots() {
  rootsByType = defaultRoots();
}
