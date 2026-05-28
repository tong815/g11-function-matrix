import {
  getDefinitionForTopic,
  initialRootForForm,
  paramsForForm,
  toGraphData,
  updateRootFromFormInput,
  validateRoot
} from "../functionRegistry/index.js";
import { getGraphAdapter } from "../graph/graphAdapterRegistry.js";

/**
 * Derived graph cache only — not a second mathematical source.
 * paramsByAdapter is written exclusively from RootFunction.
 */
export function applyRootToGraphState(graphState, root) {
  const def = getDefinitionForTopic(root.functionType);
  if (!def) return;
  const data = toGraphData(root);
  if (!graphState.paramsByAdapter) graphState.paramsByAdapter = {};
  graphState.paramsByAdapter[def.adapterId] = { ...data };
}

export function buildConversionParamsFromRoot(root, fromFormId) {
  return { ...paramsForForm(root, fromFormId) };
}

export function mergeConversionWithRoot(topic, conversionState, partial, rootFunction) {
  const def = getDefinitionForTopic(topic);
  if (!def?.supportsConversion) {
    return { root: rootFunction, params: partial.params ?? conversionState.params };
  }

  const fromFormId = partial.fromFormId ?? conversionState.fromFormId;
  let root = rootFunction;
  let params = partial.params;

  if (fromFormId !== conversionState.fromFormId && params === undefined) {
    root = initialRootForForm(topic.id, fromFormId);
    root.activeForm = fromFormId;
    params = buildConversionParamsFromRoot(root, fromFormId);
  } else if (params) {
    root = updateRootFromFormInput(root, fromFormId, params);
    root.activeForm = fromFormId;
    params = buildConversionParamsFromRoot(root, fromFormId);
  } else {
    params = buildConversionParamsFromRoot(root, fromFormId);
  }

  return { root, params };
}

export function commitGraphAdapterToRoot(topic, graphState) {
  const def = getDefinitionForTopic(topic);
  if (!def) return null;
  const adapter = getGraphAdapter(def.adapterId);
  const adapterParams = graphState.paramsByAdapter?.[def.adapterId];
  const formId = adapter?.getActiveFormId(graphState) ?? graphState.activeFormByAdapter?.[def.adapterId];
  if (!adapterParams) return null;
  const root = def.fromGraphAdapterParams(adapterParams, formId);
  root.activeForm = formId;
  return validateRoot(root) ? root : null;
}
