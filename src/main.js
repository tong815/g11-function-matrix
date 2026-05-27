// Run locally with a static server, e.g.:
// py -m http.server 8000  then open http://localhost:8000
import { i18n } from "./data/i18n.js";
import { LevelClass, quadraticMatrix, linearMatrix } from "./data/matrices.js";
import { detailLibrary } from "./data/details.js";
import { formulaCards, problemRouterData } from "./data/formulas.js";
import { flowContent } from "./data/transformationRules.js";
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

const graphState = {
  mode: "quadratic",
  quadratic: { a: 1, b: 0, c: -4 },
  quadraticForm: "qVertex",
  linear: { mode: "normal", m: 2, b: -1, point: [1, 1], A: 2, B: -1, C: -1, xConst: null },
  linearForm: "lSlope"
};

const getLang = () => currentLang;
const getLastSelected = () => lastSelected;

const graphHandlers = createGraphHandlers({
  graphState,
  getLang,
  i18n,
  quadraticMatrix,
  linearMatrix,
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
  return buildInfoPanel({
    matrixKey,
    formId,
    infoKey,
    i18n,
    currentLang,
    quadraticMatrix,
    linearMatrix,
    readableLevel: (level) => readableLevel(level, i18n, currentLang),
    getDetail: (mk, fid, ik) => getDetail(mk, fid, ik, detailLibrary, currentLang)
  });
}

function bindMatrixClicks() {
  document.querySelectorAll("td.clickable").forEach(cell => {
    cell.addEventListener("click", () => {
      document.querySelectorAll("td.clickable").forEach(c => c.classList.remove("active-cell"));
      cell.classList.add("active-cell");

      const matrixKey = cell.dataset.matrix;
      const formId = cell.dataset.form;
      const infoKey = cell.dataset.info;
      lastSelected = { matrixKey, formId, infoKey };
      document.getElementById("infoPanelText").innerHTML = panel(matrixKey, formId, infoKey);

      graphState.mode = matrixKey;
      if (matrixKey === "quadratic") {
        graphState.quadraticForm = formId;
      } else {
        graphState.linearForm = formId;
      }
      graphHandlers.updateGraphLabel(matrixKey, formId);
      controlsHandlers.renderParameterInputs();
      controlsHandlers.updateCurrentExampleForms();
      graphHandlers.drawMainGraph();
      graphHandlers.updateGraphAnnotationText(lastSelected);
    });
  });
}

function onFlowRuleClick(ruleId) {
  lastFlowRuleId = ruleId;
  document.getElementById("flowText").innerHTML = renderFlowHtml({ ruleId, flowContent, currentLang });
}

function localizeStaticText() {
  const t = i18n[currentLang];
  document.documentElement.lang = currentLang === "zh" ? "zh-CN" : "en";
  document.getElementById("pageTitle").textContent = t.pageTitle;
  const subtitleEl = document.getElementById("pageSubtitle");
  if (document.documentElement.classList.contains("device-desktop")) {
    subtitleEl.textContent = i18n.en.pageSubtitle + " " + i18n.zh.pageSubtitle;
  } else {
    subtitleEl.textContent = t.pageSubtitle;
  }
  document.getElementById("qMatrixTitle").textContent = t.qMatrixTitle;
  document.getElementById("qMatrixNote").textContent = t.qMatrixNote;
  document.getElementById("lMatrixTitle").textContent = t.lMatrixTitle;
  document.getElementById("lMatrixNote").textContent = t.lMatrixNote;
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
  document.getElementById("axisStandardLabel").textContent = t.axisStandardLabel;
  document.getElementById("axisFactoredLabel").textContent = t.axisFactoredLabel;
  document.getElementById("axisVertexLabel").textContent = t.axisVertexLabel;
  document.getElementById("axisFootText").textContent = t.axisFootText;
  document.getElementById("discPanelTitle").textContent = t.discPanelTitle;
  document.getElementById("discFormulaText").textContent = t.discFormulaText;
  document.getElementById("discPosText").innerHTML = t.discPosText + '<canvas id="discPos" class="disc-canvas" width="190" height="90"></canvas>';
  document.getElementById("discZeroText").innerHTML = t.discZeroText + '<canvas id="discZero" class="disc-canvas" width="190" height="90"></canvas>';
  document.getElementById("discNegText").innerHTML = t.discNegText + '<canvas id="discNeg" class="disc-canvas" width="190" height="90"></canvas>';
  document.getElementById("btnEN").classList.toggle("active", currentLang === "en");
  document.getElementById("btnZH").classList.toggle("active", currentLang === "zh");
  controlsHandlers.renderParameterInputs();
  controlsHandlers.updateCurrentExampleForms();
}

function switchLang(lang) {
  currentLang = lang;
  localizeStaticText();
  renderMatrix({ targetId: "quadraticMatrixMount", matrixData: quadraticMatrix, i18n, currentLang, LevelClass, statusPill: pill });
  renderMatrix({ targetId: "linearMatrixMount", matrixData: linearMatrix, i18n, currentLang, LevelClass, statusPill: pill });
  bindMatrixClicks();
  renderNetwork({ mountId: "networkMount", i18n, currentLang, onRuleClick: onFlowRuleClick });
  renderCards({ mountId: "cardsMount", i18n, currentLang, formulaCards });
  renderProblemRouter({ mountId: "problemRouterMount", i18n, currentLang, problemRouterData });
  if (lastSelected) {
    document.getElementById("infoPanelText").innerHTML = panel(lastSelected.matrixKey, lastSelected.formId, lastSelected.infoKey);
    graphHandlers.updateGraphLabel(lastSelected.matrixKey, lastSelected.formId);
  } else {
    document.getElementById("infoPanelText").textContent = i18n[currentLang].infoPanelDefault;
    graphHandlers.updateGraphLabel("quadratic", "qVertex");
  }
  document.getElementById("flowText").innerHTML = renderFlowHtml({ ruleId: lastFlowRuleId, flowContent, currentLang });
  graphHandlers.drawMainGraph();
  graphHandlers.updateGraphAnnotationText(lastSelected);
  graphHandlers.drawDiscCanvas("discPos", "pos");
  graphHandlers.drawDiscCanvas("discZero", "zero");
  graphHandlers.drawDiscCanvas("discNeg", "neg");
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
  switchLang("en");
}

init();
