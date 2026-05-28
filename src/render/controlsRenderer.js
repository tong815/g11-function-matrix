import { getGraphAdapter } from "../graph/graphAdapterRegistry.js";
import { deriveRepresentationsForRoot } from "../functionRegistry/index.js";
function bindParamEnterKeysLocal(mount, applyGraphParams) {
  mount.querySelectorAll("input:not([disabled])").forEach(input => {
    input.addEventListener("keydown", e => {
      if (e.key === "Enter") applyGraphParams();
    });
  });
}

export function createControlsHandlers(deps) {
  const {
    graphState,
    getLang,
    i18n,
    getLastSelected,
    getRootFunction,
    drawMainGraph,
    updateGraphAnnotationText,
    onGraphRootCommit,
    onGraphRootReset
  } = deps;
  const currentLang = () => getLang();

  function getActiveAdapter() {
    return getGraphAdapter(graphState.mode);
  }

  function getActiveFormId(adapter) {
    return graphState.activeFormByAdapter?.[adapter.id] ?? adapter?.defaultFormId;
  }

  function getAdapterParams(adapter) {
    return graphState.paramsByAdapter?.[adapter.id];
  }

  function renderParameterInputs() {
  const t = i18n[currentLang()];
  const adapter = getActiveAdapter();
  const showParams = !!(adapter && getAdapterParams(adapter));
  document.getElementById("graphParamsBlock").style.display = showParams ? "block" : "none";
  document.getElementById("currentExampleForms").style.display = showParams ? "block" : "none";
  if (!showParams) return;

  document.getElementById("graphParamsTitle").textContent = t.graphParamsTitle;
  document.getElementById("btnUpdateGraph").textContent = t.btnUpdateGraph;
  document.getElementById("btnResetGraph").textContent = t.btnResetGraph;
  document.getElementById("graphParamsFactoredNote").textContent = "";

  const mount = document.getElementById("graphParamsFieldsMount");
  const formId = getActiveFormId(adapter);
  adapter.renderParameterFields({
    graphState,
    formId,
    mount,
    t,
    currentLang: currentLang(),
    i18n,
    setNote: (text) => { document.getElementById("graphParamsFactoredNote").textContent = text || ""; },
    bindEnter: (fieldsMount) => bindParamEnterKeysLocal(fieldsMount, applyGraphParams)
  });
}

function updateCurrentExampleForms() {
  const mount = document.getElementById("currentExampleForms");
  const t = i18n[currentLang()];
  const adapter = getActiveAdapter();
  const root = getRootFunction?.();
  const params = adapter ? getAdapterParams(adapter) : null;
  if (!adapter || !params) {
    mount.innerHTML = "";
    return;
  }
  const features =
    root?.functionType === adapter.id
      ? deriveRepresentationsForRoot(root, currentLang(), i18n).algebraic.features
      : adapter.getFeatures(params, currentLang(), i18n);
  if (!adapter.isValidParams(features)) {
    const errText = adapter.getCanvasError(features, t);
    mount.innerHTML = `<div class="example-form-cards"><div class="example-form-card card-standard"><div class="efc-title">${t.formStandardLabel}</div><div class="efc-expr">${errText}</div></div></div>`;
    return;
  }
  const examples = adapter.getExampleForms(features, t);
  if (!examples?.cards?.length) {
    mount.innerHTML = "";
    return;
  }
  mount.innerHTML = `
    <div class="example-form-cards">
      ${examples.cards.map((card) => `
      <div class="example-form-card ${card.className}">
        <div class="efc-title">${card.title}</div>
        <div class="efc-expr">${card.expr}</div>
      </div>
      `).join("")}
    </div>
  `;
}

function applyGraphParams() {
  const t = i18n[currentLang()];
  const errEl = document.getElementById("graphParamError");
  const adapter = getActiveAdapter();
  if (!adapter) return;
  const formId = getActiveFormId(adapter);
  const result = adapter.applyParameterInputs({
    graphState,
    formId,
    t,
    setError: (text) => { errEl.textContent = text || ""; },
    getRootFunction
  });
  if (!result?.changed) return;
  if (onGraphRootCommit) {
    onGraphRootCommit(adapter.id, { formId: result.formId ?? formId, formParams: result.formParams });
  }
  updateCurrentExampleForms();
  renderParameterInputs();
  drawMainGraph();
  updateGraphAnnotationText(getLastSelected());
}

function resetGraphParams() {
  document.getElementById("graphParamError").textContent = "";
  document.getElementById("graphParamsFactoredNote").textContent = "";
  const adapter = getActiveAdapter();
  if (!adapter) return;
  if (onGraphRootReset) {
    onGraphRootReset(adapter.id);
  } else {
    adapter.setCurrentParams(graphState, adapter.getDefaultParams());
  }
  updateCurrentExampleForms();
  renderParameterInputs();
  drawMainGraph();
  updateGraphAnnotationText(getLastSelected());
}

function bindGraphParamControls() {
  document.getElementById("btnUpdateGraph").addEventListener("click", applyGraphParams);
  document.getElementById("btnResetGraph").addEventListener("click", resetGraphParams);
}
  return {
    renderParameterInputs,
    updateCurrentExampleForms,
    applyGraphParams,
    resetGraphParams,
    bindGraphParamControls
  };
}
