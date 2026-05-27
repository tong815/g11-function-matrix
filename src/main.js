// Run locally with a static server, e.g.:
// py -m http.server 8000  then open http://localhost:8000
import { i18n } from "./data/i18n.js";
import { LevelClass } from "./data/matrices.js";
import { topicRegistry, topicOrder } from "./data/topicRegistry.js";
import { applyOptionalPanels, topicHasOptionalPanel } from "./data/optionalPanels.js";
import { renderDiscriminantPanels } from "./graph/discriminantPanel.js";
import { detectDeviceMode, createGraphHandlers } from "./render/graphRenderer.js";
import { createControlsHandlers } from "./render/controlsRenderer.js";
import { renderMatrix, statusPill, getDetail, readableLevel } from "./render/matrixRenderer.js";
import { buildInfoPanel } from "./render/panelRenderer.js";
import { renderNetwork, renderFlowHtml } from "./render/networkRenderer.js";
import { renderCards } from "./render/formulaRenderer.js";
import { renderProblemRouter } from "./render/routerRenderer.js";

let currentLang = "en";
let lastSelected = null;
let lastFlowRuleId = "std_to_fact";
let currentTopicId = "quadratic";

const graphState = {
  mode: "quadratic",
  paramsByAdapter: {
    quadratic: { a: 1, b: 0, c: -4 },
    linear: { mode: "normal", m: 2, b: -1, point: [1, 1], A: 2, B: -1, C: -1, xConst: null },
    exponential: { a: 1, b: 2, h: 0, k: 0 }
  },
  activeFormByAdapter: {
    quadratic: "qVertex",
    linear: "lSlope",
    exponential: "eTransformed"
  },
  // Backward compatibility for existing topic-specific modules.
  quadratic: { a: 1, b: 0, c: -4 },
  quadraticForm: "qVertex",
  linear: { mode: "normal", m: 2, b: -1, point: [1, 1], A: 2, B: -1, C: -1, xConst: null },
  linearForm: "lSlope"
};

const getLang = () => currentLang;
const getLastSelected = () => lastSelected;
const getCurrentTopic = () => topicRegistry[currentTopicId];
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

const controlsHandlers = createControlsHandlers({
  graphState,
  getLang,
  i18n,
  getLastSelected,
  getActiveQuadraticFormId: () => graphHandlers.getActiveQuadraticFormId(),
  getActiveLinearFormId: () => graphHandlers.getActiveLinearFormId(),
  drawMainGraph: () => graphHandlers.drawMainGraph(),
  updateGraphAnnotationText: (sel) => graphHandlers.updateGraphAnnotationText(sel)
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
  if (adapterId === "quadratic") graphState.quadraticForm = formId;
  if (adapterId === "linear") graphState.linearForm = formId;
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
  const t = i18n[currentLang];
  const mount = document.getElementById("topicSelectorMount");
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
      lastFlowRuleId = topic.transformations.defaultFlowRuleId;
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
  const subtitleEl = document.getElementById("pageSubtitle");
  if (document.documentElement.classList.contains("device-desktop")) {
    subtitleEl.textContent = i18n.en.pageSubtitle + " " + i18n.zh.pageSubtitle;
  } else {
    subtitleEl.textContent = t.pageSubtitle;
  }
  document.getElementById("transRulesTitle").textContent = t.transRulesTitle;
  document.getElementById("transRulesNote").textContent = t.transRulesNote;
  document.getElementById("formulaCardsTitle").textContent = t.formulaCardsTitle;
  document.getElementById("problemRouterTitle").textContent = t.problemRouterTitle;
  document.getElementById("infoPanelTitle").textContent = t.infoPanelTitle;
  document.getElementById("graphPreviewTitle").textContent = t.graphPreviewTitle;
  document.getElementById("graphPreviewNote").textContent = t.graphPreviewNote;
  document.getElementById("currentObjectLabel").textContent = t.currentObjectLabel;
  document.getElementById("flowTitle").textContent = t.flowTitle;
  document.getElementById("sameGeoTitle").textContent = t.sameGeoTitle;
  localizeQuadraticOptionalPanels(t);
  localizeDiscriminantPanel(t);
  document.getElementById("btnEN").classList.toggle("active", currentLang === "en");
  document.getElementById("btnZH").classList.toggle("active", currentLang === "zh");
  controlsHandlers.renderParameterInputs();
  controlsHandlers.updateCurrentExampleForms();
}

function onFlowRuleClick(ruleId) {
  lastFlowRuleId = ruleId;
  const topic = getCurrentTopic();
  const topicFlowContent = topic.transformations.flowContent;
  const flowEl = document.getElementById("flowText");
  if (topicFlowContent[ruleId]) {
    flowEl.innerHTML = renderFlowHtml({ ruleId, flowContent: topicFlowContent, currentLang });
  } else {
    flowEl.textContent = i18n[currentLang].flowDefault;
  }
}

function switchLang(lang) {
  currentLang = lang;
  const topic = getCurrentTopic();
  const t = i18n[currentLang];
  const topicFlowContent = topic.transformations.flowContent;
  localizeStaticText();
  renderTopicSelector();
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
  renderNetwork({
    mountId: "networkMount",
    i18n,
    currentLang,
    onRuleClick: onFlowRuleClick,
    transformations: topic.transformations
  });
  renderCards({
    mountId: "cardsMount",
    i18n,
    currentLang,
    formulas: topic.formulaCards,
    title: t[topic.formulasTitleKey]
  });
  renderProblemRouter({
    mountId: "problemRouterMount",
    i18n,
    currentLang,
    router: topic.problemRouter,
    title: t[topic.routerTitleKey]
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
  if (topicFlowContent[lastFlowRuleId]) {
    document.getElementById("flowText").innerHTML = renderFlowHtml({
      ruleId: lastFlowRuleId,
      flowContent: topicFlowContent,
      currentLang
    });
  } else {
    const flowDefaults = {
      linear: i18n[currentLang].linearFlowDefault,
      exponential: i18n[currentLang].exponentialFlowDefault
    };
    document.getElementById("flowText").textContent = flowDefaults[currentTopicId] || i18n[currentLang].flowDefault;
  }
  syncGraphModeFromTopic(topic);
  graphHandlers.drawMainGraph();
  graphHandlers.updateGraphAnnotationText(lastSelected);
  if (topicHasOptionalPanel(topic, "discriminant")) {
    renderDiscriminantPanels();
  }
}

function init() {
  detectDeviceMode();
  window.addEventListener("resize", () => {
    detectDeviceMode();
    graphHandlers.drawMainGraph();
  });
  controlsHandlers.bindGraphParamControls();
  document.getElementById("btnEN").addEventListener("click", () => switchLang("en"));
  document.getElementById("btnZH").addEventListener("click", () => switchLang("zh"));
  const topic = getCurrentTopic();
  syncGraphModeFromTopic(topic);
  lastSelected = { ...topic.graph.defaultSelection };
  lastFlowRuleId = topic.transformations.defaultFlowRuleId;
  switchLang("en");
}

init();
