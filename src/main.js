// Run locally with a static server, e.g.:
// py -m http.server 8000  then open http://localhost:8000
import { i18n } from "./data/i18n.js";
import { LevelClass } from "./data/matrices.js";
import { topicRegistry, topicOrder } from "./data/topicRegistry.js";
import { applyOptionalPanels, topicHasOptionalPanel } from "./data/optionalPanels.js";
import { renderDiscriminantPanels } from "./graph/discriminantPanel.js";
import { onViewportResize, createGraphHandlers } from "./render/graphRenderer.js";
import { createControlsHandlers } from "./render/controlsRenderer.js";
import { renderMatrix, statusPill, getDetail, readableLevel } from "./render/matrixRenderer.js";
import { buildInfoPanel } from "./render/panelRenderer.js";
import {
  renderConversionWorkspace,
  getDefaultConversionState
} from "./conversion/conversionWorkspaceRenderer.js";
import { validateRoot, getDefinitionForTopic } from "./functionRegistry/index.js";
import {
  applyRootToGraphState,
  buildConversionParamsFromRoot,
  commitGraphFormParams,
  mergeConversionWithRoot,
  persistActiveRootFromGraph,
  syncActiveRootToGraph
} from "./state/rootSync.js";
import {
  ensureValidTransformationState,
  getDefaultTransformationPair
} from "./data/transformationLookup.js";
import {
  getActiveRoot,
  getRoot,
  replaceActiveRoot,
  resetRootForForm,
  setActiveFunctionType,
  setRoot
} from "./state/rootStore.js";
import { renderCards } from "./render/formulaRenderer.js";
import { renderIntuition } from "./render/intuitionRenderer.js";

let currentLang = "en";
let lastSelected = null;
let currentTopicId = "quadratic";

const getCurrentTopic = () => topicRegistry[currentTopicId];
const getRootFunction = () => getActiveRoot();

let conversionState = {
  fromFormId: "qStandard",
  toFormId: "qFactored",
  params: buildConversionParamsFromRoot(getActiveRoot(), "qStandard")
};

const graphState = {
  mode: "quadratic",
  paramsByAdapter: {},
  activeFormByAdapter: {
    quadratic: "qStandard",
    linear: "lSlope",
    exponential: "eTransformed"
  },
  view: {}
};

const getLang = () => currentLang;
const getLastSelected = () => lastSelected;
const matrixByKey = Object.fromEntries(
  topicOrder.map((topicId) => [topicRegistry[topicId].matrixKey, topicRegistry[topicId].matrix])
);

const graphHandlers = createGraphHandlers({
  graphState,
  getLang,
  i18n,
  matrixByKey,
  getLastSelected,
  getRootFunction
});

function syncRootToGraph() {
  syncActiveRootToGraph(graphState);
}

function onGraphRootCommit(adapterId, { formId, formParams } = {}) {
  const t = getCurrentTopic();
  if (t.graph.adapterId !== adapterId) return;
  if (formParams && formId) {
    const next = commitGraphFormParams(t, graphState, formId, formParams);
    if (!next) return;
  } else {
    const next = persistActiveRootFromGraph(t, graphState);
    if (!next) return;
  }
  conversionState = {
    ...conversionState,
    params: buildConversionParamsFromRoot(getActiveRoot(), conversionState.fromFormId)
  };
  renderConversionUI();
}

function onGraphRootReset(adapterId) {
  const t = getCurrentTopic();
  if (t.graph.adapterId !== adapterId) return;
  const formId = graphState.activeFormByAdapter[adapterId];
  resetRootForForm(t.id, formId);
  syncRootToGraph();
  conversionState = {
    ...conversionState,
    params: buildConversionParamsFromRoot(getActiveRoot(), conversionState.fromFormId)
  };
  renderConversionUI();
}

const controlsHandlers = createControlsHandlers({
  graphState,
  getLang,
  i18n,
  getLastSelected,
  getRootFunction,
  drawMainGraph: () => graphHandlers.drawMainGraph(),
  updateGraphAnnotationText: (sel) => graphHandlers.updateGraphAnnotationText(sel),
  onGraphRootCommit,
  onGraphRootReset
});

function pill(level) {
  return statusPill(level, i18n, currentLang);
}

function panel(matrixKey, formId, infoKey) {
  const t = getCurrentTopic();
  return buildInfoPanel({
    matrixKey,
    formId,
    infoKey,
    i18n,
    currentLang,
    matrix: t.matrix,
    topicId: t.id,
    readableLevel: (level) => readableLevel(level, i18n, currentLang),
    getDetail: (_mk, fid, ik) =>
      getDetail(t.details.namespace, fid, ik, t.details.library, currentLang)
  });
}

function syncGraphModeFromTopic(t) {
  graphState.mode = t.graph.adapterId;
}

function applyFormSelectionToGraphState(t, formId) {
  const adapterId = t.graph.adapterId;
  graphState.activeFormByAdapter[adapterId] = formId;
  const root = getRoot(t.id);
  if (root) {
    root.activeForm = formId;
    setRoot(t.id, root);
  }
}

function bindMatrixClicks() {
  document.querySelectorAll("td.clickable").forEach((cell) => {
    cell.addEventListener("click", () => {
      document.querySelectorAll("td.clickable").forEach((c) => c.classList.remove("active-cell"));
      cell.classList.add("active-cell");

      const matrixKey = cell.dataset.matrix;
      const formId = cell.dataset.form;
      const infoKey = cell.dataset.info;
      lastSelected = { matrixKey, formId, infoKey };
      document.getElementById("infoPanelText").innerHTML = panel(matrixKey, formId, infoKey);

      const t = getCurrentTopic();
      syncGraphModeFromTopic(t);
      applyFormSelectionToGraphState(t, formId);
      const def = getDefinitionForTopic(t);
      if (def?.supportsConversion) {
        conversionState = {
          ...conversionState,
          params: buildConversionParamsFromRoot(getActiveRoot(), conversionState.fromFormId)
        };
        renderConversionUI();
      }
      graphHandlers.updateGraphLabel(matrixKey, formId);
      controlsHandlers.renderParameterInputs();
      controlsHandlers.updateCurrentExampleForms();
      graphHandlers.drawMainGraph();
      graphHandlers.updateGraphAnnotationText(lastSelected);
    });
  });
}

function renderTopicSelector() {
  const mount = document.getElementById("topicSelectorMount");
  const t = i18n[currentLang];
  mount.innerHTML = topicOrder
    .map((topicId) => {
      const top = topicRegistry[topicId];
      const active = topicId === currentTopicId ? " active" : "";
      return `
      <button type="button" class="topic-btn${active}" data-topic="${topicId}">
        <div class="topic-btn-title">${t[top.titleKey]}</div>
        <div class="topic-btn-subtitle">${t[top.subtitleKey]}</div>
      </button>
    `;
    })
    .join("");
  mount.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextTopicId = btn.dataset.topic;
      if (nextTopicId === currentTopicId) return;

      persistActiveRootFromGraph(getCurrentTopic(), graphState);

      currentTopicId = nextTopicId;
      const nextTopic = getCurrentTopic();
      setActiveFunctionType(nextTopicId);
      lastSelected = { ...nextTopic.graph.defaultSelection };
      applyFormSelectionToGraphState(nextTopic, lastSelected.formId);
      syncGraphModeFromTopic(nextTopic);
      syncRootToGraph();

      const pair = getDefaultTransformationPair(nextTopic.matrix, nextTopic.transformations.rules);
      const fromFormId = pair.fromFormId;
      conversionState = getDefaultConversionState(nextTopic, (fid) =>
        buildConversionParamsFromRoot(getActiveRoot(), fid ?? fromFormId)
      );
      switchLang(currentLang);
    });
  });
}

function localizeQuadraticOptionalPanels(t) {
  if (!topicHasOptionalPanel(getCurrentTopic(), "sameGeometry")) return;
  document.getElementById("axisStandardLabel").textContent = t.axisStandardLabel;
  document.getElementById("axisFactoredLabel").textContent = t.axisFactoredLabel;
  document.getElementById("axisVertexLabel").textContent = t.axisVertexLabel;
  document.getElementById("axisFootText").textContent = t.axisFootText;
}

function localizeDiscriminantPanel(t) {
  if (!topicHasOptionalPanel(getCurrentTopic(), "discriminant")) return;
  document.getElementById("discPanelTitle").textContent = t.discPanelTitle;
  document.getElementById("discFormulaText").textContent = t.discFormulaText;
  document.getElementById("discPosText").innerHTML =
    t.discPosText + '<canvas id="discPos" class="disc-canvas" width="190" height="90"></canvas>';
  document.getElementById("discZeroText").innerHTML =
    t.discZeroText + '<canvas id="discZero" class="disc-canvas" width="190" height="90"></canvas>';
  document.getElementById("discNegText").innerHTML =
    t.discNegText + '<canvas id="discNeg" class="disc-canvas" width="190" height="90"></canvas>';
}

function localizeStaticText() {
  const t = i18n[currentLang];
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.getElementById("pageTitle").textContent = t.pageTitle;
  document.getElementById("topicSelectorTitle").textContent = t.topicSelectorTitle;
  document.getElementById("coreIntuitionTitle").textContent = t.coreIntuitionTitle;
  document.getElementById("pageSubtitle").textContent = t.pageSubtitle;
  document.getElementById("conversionWorkspaceTitle").textContent = t.conversionWorkspaceTitle;
  document.getElementById("conversionWorkspaceNote").textContent = t.conversionWorkspaceNote;
  document.getElementById("formulaCardsTitle").textContent = t.formulaCardsTitle;
  document.getElementById("infoPanelTitle").textContent = t.infoPanelTitle;
  document.getElementById("graphPreviewTitle").textContent = t.graphPreviewTitle;
  document.getElementById("graphPreviewNote").textContent = t.graphPreviewNote;
  document.getElementById("currentObjectLabel").textContent = t.currentObjectLabel;
  document.getElementById("sameGeoTitle").textContent = t.sameGeoTitle;
  localizeQuadraticOptionalPanels(t);
  localizeDiscriminantPanel(t);
  document.getElementById("btnEN").classList.toggle("active", currentLang === "en");
  document.getElementById("btnZH").classList.toggle("active", currentLang === "zh");
  controlsHandlers.renderParameterInputs();
  controlsHandlers.updateCurrentExampleForms();
}

function renderConversionUI() {
  const t = getCurrentTopic();
  renderConversionWorkspace({
    mountId: "conversionWorkspaceMount",
    topic: t,
    conversionState,
    i18n,
    currentLang,
    onStateChange: handleConversionStateChange,
    rootFunction: getActiveRoot()
  });
}

function handleConversionStateChange(partial) {
  const t = getCurrentTopic();
  const fromFormId = partial.fromFormId ?? conversionState.fromFormId;
  const pair = ensureValidTransformationState(
    { fromFormId, toFormId: partial.toFormId ?? conversionState.toFormId },
    t.matrix,
    t.transformations.rules
  );

  const merged = mergeConversionWithRoot(t, conversionState, partial, getActiveRoot());
  const def = getDefinitionForTopic(t);

  if (def?.supportsConversion) {
    if (validateRoot(merged.root)) {
      setRoot(t.id, merged.root);
      replaceActiveRoot(merged.root);
      syncRootToGraph();
      conversionState = {
        fromFormId: pair.fromFormId,
        toFormId: pair.toFormId,
        params: merged.params
      };
      controlsHandlers.renderParameterInputs();
      controlsHandlers.updateCurrentExampleForms();
      graphHandlers.drawMainGraph();
    }
  } else {
    conversionState = {
      fromFormId: pair.fromFormId,
      toFormId: pair.toFormId,
      params: merged.params
    };
  }
  renderConversionUI();
}

function switchLang(lang) {
  currentLang = lang;
  const t = getCurrentTopic();
  const tr = i18n[currentLang];
  localizeStaticText();
  renderTopicSelector();
  renderIntuition({ mountId: "intuitionMount", topic: t, i18n, currentLang });
  applyOptionalPanels(t);
  document.getElementById("matrixTitle").textContent = tr[t.matrixTitleKey];
  document.getElementById("matrixNote").textContent = tr[t.matrixNoteKey];
  renderMatrix({
    targetId: "matrixMount",
    matrixData: t.matrix,
    i18n,
    currentLang,
    LevelClass,
    statusPill: pill
  });
  bindMatrixClicks();
  renderConversionUI();
  renderCards({
    mountId: "cardsMount",
    i18n,
    currentLang,
    formulas: t.formulaCards,
    title: tr[t.formulasTitleKey]
  });
  if (lastSelected) {
    document.getElementById("infoPanelText").innerHTML = panel(
      lastSelected.matrixKey,
      lastSelected.formId,
      lastSelected.infoKey
    );
    graphHandlers.updateGraphLabel(lastSelected.matrixKey, lastSelected.formId);
  } else {
    document.getElementById("infoPanelText").textContent = i18n[currentLang].infoPanelDefault;
    graphHandlers.updateGraphLabel(
      t.graph.defaultSelection.matrixKey,
      t.graph.defaultSelection.formId
    );
  }
  syncGraphModeFromTopic(t);
  controlsHandlers.renderParameterInputs();
  controlsHandlers.updateCurrentExampleForms();
  requestAnimationFrame(() => {
    onViewportResize();
    graphHandlers.drawMainGraph();
    graphHandlers.updateGraphAnnotationText(lastSelected);
  });
  if (topicHasOptionalPanel(t, "discriminant")) {
    renderDiscriminantPanels();
  }
}

function init() {
  onViewportResize();
  window.addEventListener("resize", () => {
    onViewportResize();
    graphHandlers.drawMainGraph();
  });
  controlsHandlers.bindGraphParamControls();
  document.getElementById("btnEN").addEventListener("click", () => switchLang("en"));
  document.getElementById("btnZH").addEventListener("click", () => switchLang("zh"));

  const t = getCurrentTopic();
  setActiveFunctionType(t.id);
  syncGraphModeFromTopic(t);
  lastSelected = { ...t.graph.defaultSelection };
  applyFormSelectionToGraphState(t, lastSelected.formId);
  syncRootToGraph();

  const pair = getDefaultTransformationPair(t.matrix, t.transformations.rules);
  conversionState = getDefaultConversionState(t, (fromFormId) =>
    buildConversionParamsFromRoot(getActiveRoot(), fromFormId)
  );
  switchLang("en");
}

init();
