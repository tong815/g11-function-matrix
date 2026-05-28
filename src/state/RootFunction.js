/**
 * Single mathematical function — canonicalParams are the only stored coefficients.
 * All forms, graph data, and equations are derived via FunctionRegistry.
 */
export function createRootFunction(functionType, canonicalParams, activeForm = null) {
  return {
    functionType,
    canonicalParams: { ...canonicalParams },
    activeForm
  };
}

export function isRootValid(root) {
  if (!root?.functionType) return false;
  const def = root._definition;
  if (def?.validate) return def.validate(root);
  return true;
}
