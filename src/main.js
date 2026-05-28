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
import { initialRootForForm, validateRoot, getDefinitionForTopic } from "./functionRegistry/index.js";
import {
  applyRootToGraphState,
  buildConversionParamsFromRoot,
  commitGraphAdapterToRoot,
  mergeConversionWithRoot
} from "./state/rootSync.js";
import {
  ensureValidTransformationState,
  getDefaultTransformationPair
} from "./data/transformationLookup.js";
import { renderCards } from "./render/formulaRenderer.js";
import { renderIntuition } from "./render/intuitionRenderer.js";

let currentLang = "en";
let lastSelected = null;
let currentTopicId = "quadratic";

/** Single source of truth for the active function (all topics). */
let rootFunction = initialRootForForm("quadratic", "qStandard");

let conversionState = {
  fromFormId: "qStandard",
  toFormId: "qFactored",
  params: buildConversionParamsFromRoot(rootFunction, "qStandard")
};

const graphState = {
  mode: "quadratic",
  paramsByAdapter: {
    quadratic: { a: 1, b: 0, c: 0 },
    linear: { mode: "normal", m: 1, b: 0, point: [0, 0], A: 1, B: -1, C: 0, xConst: null },
    exponential: { a: 1, b: 2, h: 0, k: 0 }
  },
  activeFormByAdapter: {
    quadratic: "qStandard",
    linear: "lSlope",
    exponential: "eTransformed"
  }
};

const getLang = () => currentLang;
const getLastSelected = () => lastSelected;
const getCurrentTopic = () => topicRegistry[currentTopicId];
const getRootFunction = () => rootFunction;
const matrixByKey = Object.fromEntries(
  topicOrder.map((topicId) => [topicRegistry[topicId].matrixKey, topicRegistry[topicId].matrix])
);

const graphHandlers = createGraphHandlers({
  graphState,
  getLang,
  i18n,
  matrixByKey,
  getLastSelected
});

function syncRootToGraph() {
  applyRootToGraphState(graphState, rootFunction);
}

function resetRootForTopic(topic, formId) {
  rootFunction = initialRootForForm(topic.id, formId);
  rootFunction.activeForm = formId;
  syncRootToGraph();
}

function onGraphRootCommit(adapterId) {
  const topic = getCurrentTopic();
  if (topic.graph.adapterId !== adapterId) return;
  const next = commitGraphAdapterToRoot(topic, graphState);
  if (!next) return;
  rootFunction = next;
  syncRootToGraph();
  conversionState = {
    ...conversionState,
    params: buildConversionParamsFromRoot(rootFunction, conversionState.fromFormId)
  };
  renderConversionUI();
}

function onGraphRootReset(adapterId) {
  const topic = getCurrentTopic();
  if (topic.graph.adapterId !== adapterId) return;
  const formId = graphState.activeFormByAdapter[adapterId];
  resetRootForTopic(topic, formId);
  conversionState = {
    ...conversionState,
    params: buildConversionParamsFromRoot(rootFunction, conversionState.fromFormId)
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
  const topic = getCurrentTopic();
  return buildInfoPanel({
    matrixKey,
    formId,
    infoKey,
    i18n,
    currentLang,
    matrix: topic.matrix,
    topicId: topic.id,
    readableLevel: (level) => readableLevel(level, i18n, currentLang),
    getDetail: (_mk, fid, ik) =>
      getDetail(topic.details.namespace, fid, ik, topic.details.library, currentLang)
  });
}

function syncGraphModeFromTopic(topic) {
  graphState.mode = topic.graph.adapterId;
}

function applyFormSelectionToGraphState(topic, formId) {
  const adapterId = topic.graph.adapterId;
  graphState.activeFormByAdapter[adapterId] = formId;
  rootFunction.activeForm = formId;
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

      const topic = getCurrentTopic();
      syncGraphModeFromTopic(topic);
      applyFormSelectionToGraphState(topic, formId);
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
      const topic = topicRegistry[topicId];
      const active = topicId === currentTopicId ? " active" : "";
      return `
      <button type="button" class="topic-btn${active}" data-topic="${topicId}">
        <div class="topic-btn-title">${t[topic.titleKey]}</div>
        <div class="topic-btn-subtitle">${t[topic.subtitleKey]}</div>
      </button>
    `;
    })
    .join("");
  mount.querySelectorAll(".topic-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const nextTopicId = btn.dataset.topic;
      if (nextTopicId === currentTopicId) return;
      currentTopicId = nextTopicId;
      const topic = getCurrentTopic();
      lastSelected = { ...topic.graph.defaultSelection };
      applyFormSelectionToGraphState(topic, lastSelected.formId);
      const pair = getDefaultTransformationPair(topic.matrix, topic.transformations.rules);
      resetRootForTopic(topic, pair.fromFormId);
      conversionState = getDefaultConversionState(topic, (fromFormId) =>
        buildConversionParamsFromRoot(rootFunction, fromFormId)
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
  const topic = getCurrentTopic();
  renderConversionWorkspace({
    mountId: "conversionWorkspaceMount",
    topic,
    conversionState,
    i18n,
    currentLang,
    onStateChange: handleConversionStateChange,
    rootFunction
  });
}

function handleConversionStateChange(partial) {
  const topic = getCurrentTopic();
  const fromFormId = partial.fromFormId ?? conversionState.fromFormId;
  const pair = ensureValidTransformationState(
    { fromFormId, toFormId: partial.toFormId ?? conversionState.toFormId },
    topic.matrix,
    topic.transformations.rules
  );

  const merged = mergeConversionWithRoot(topic, conversionState, partial, rootFunction);
  const def = getDefinitionForTopic(topic);

  if (def?.supportsConversion) {
    if (validateRoot(merged.root)) {
      rootFunction = merged.root;
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
  const topic = getCurrentTopic();
  const t = i18n[currentLang];
  localizeStaticText();
  renderTopicSelector();
  renderIntuition({ mountId: "intuitionMount", topic, i18n, currentLang });
  applyOptionalPanels(topic);
  document.getElementById("matrixTitle").textContent = t[topic.matrixTitleKey];
  document.getElementById("matrixNote").textContent = t[topic.matrixNoteKey];
  renderMatrix({
    targetId: "matrixMount",
    matrixData: topic.matrix,
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
    formulas: topic.formulaCards,
    title: t[topic.formulasTitleKey]
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
      topic.graph.defaultSelection.matrixKey,
      topic.graph.defaultSelection.formId
    );
  }
  syncGraphModeFromTopic(topic);
  controlsHandlers.renderParameterInputs();
  controlsHandlers.updateCurrentExampleForms();
  requestAnimationFrame(() => {
    onViewportResize();
    graphHandlers.drawMainGraph();
    graphHandlers.updateGraphAnnotationText(lastSelected);
  });
  if (topicHasOptionalPanel(topic, "discriminant")) {
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
  const topic = getCurrentTopic();
  syncGraphModeFromTopic(topic);
  lastSelected = { ...topic.graph.defaultSelection };
  applyFormSelectionToGraphState(topic, lastSelected.formId);
  const pair = getDefaultTransformationPair(topic.matrix, topic.transformations.rules);
  resetRootForTopic(topic, pair.fromFormId);
  conversionState = getDefaultConversionState(topic, (fromFormId) =>
    buildConversionParamsFromRoot(rootFunction, fromFormId)
  );
  switchLang("en");
}

init();
