import { EPS, fmt } from "../math/format.js";
import { DEFAULT_QUADRATIC, getQuadraticFeatures, getStandardParams, getFactoredParams, getVertexParams, abcFromFactored, abcFromVertex } from "../math/quadratic.js";
import {
  DEFAULT_LINEAR,
  getLinearFeatures,
  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard
} from "../math/linear.js";
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
    getActiveQuadraticFormId,
    getActiveLinearFormId,
    drawMainGraph,
    updateGraphAnnotationText
  } = deps;
  const currentLang = () => getLang();
  function renderParameterInputs() {
  const t = i18n[currentLang()];
  const showParams = graphState.mode === "quadratic" || graphState.mode === "linear";
  document.getElementById("graphParamsBlock").style.display = showParams ? "block" : "none";
  document.getElementById("currentExampleForms").style.display = showParams ? "block" : "none";
  if (!showParams) return;

  document.getElementById("graphParamsTitle").textContent = t.graphParamsTitle;
  document.getElementById("btnUpdateGraph").textContent = t.btnUpdateGraph;
  document.getElementById("btnResetGraph").textContent = t.btnResetGraph;
  document.getElementById("graphParamsFactoredNote").textContent = "";

  const mount = document.getElementById("graphParamsFieldsMount");
  if (graphState.mode === "quadratic") {
    renderQuadraticParamFields(mount, t);
  } else {
    renderLinearParamFields(mount, t);
  }
}

function renderQuadraticParamFields(mount, t) {
  const formId = getActiveQuadraticFormId();
  graphState.quadraticForm = formId;
  document.getElementById("graphParamsSubtitle").textContent = t["paramSubtitle_" + formId] || "";
  const aInput = (val) => `<label><span>a:</span> <input type="number" step="any" id="quadInputA" value="${val}" /></label>`;

  if (formId === "qStandard") {
    const p = getStandardParams(graphState.quadratic);
    mount.innerHTML =
      aInput(fmt(p.a)) +
      `<label><span>b:</span> <input type="number" step="any" id="quadInputB" value="${fmt(p.b)}" /></label>` +
      `<label><span>c:</span> <input type="number" step="any" id="quadInputC" value="${fmt(p.c)}" /></label>`;
  } else if (formId === "qFactored") {
    const p = getFactoredParams(graphState.quadratic);
    if (!p.hasRealRoots) {
      mount.innerHTML =
        aInput(fmt(p.a)) +
        `<label><span>${t.paramLabelR1}:</span> <input type="text" id="quadInputR1" value="${t.noRealRootLabel}" disabled /></label>` +
        `<label><span>${t.paramLabelR2}:</span> <input type="text" id="quadInputR2" value="${t.noRealRootLabel}" disabled /></label>`;
      document.getElementById("graphParamsFactoredNote").textContent = t.noRealFactoredParamNote;
    } else {
      mount.innerHTML =
        aInput(fmt(p.a)) +
        `<label><span>${t.paramLabelR1}:</span> <input type="number" step="any" id="quadInputR1" value="${fmt(p.r1)}" /></label>` +
        `<label><span>${t.paramLabelR2}:</span> <input type="number" step="any" id="quadInputR2" value="${fmt(p.isDouble ? p.r1 : p.r2)}" /></label>`;
    }
  } else {
    const p = getVertexParams(graphState.quadratic, currentLang(), i18n);
    mount.innerHTML =
      aInput(fmt(p.a)) +
      `<label><span>${t.paramLabelH}:</span> <input type="number" step="any" id="quadInputH" value="${fmt(p.h)}" /></label>` +
      `<label><span>${t.paramLabelK}:</span> <input type="number" step="any" id="quadInputK" value="${fmt(p.k)}" /></label>`;
  }
  bindParamEnterKeysLocal(mount);
}

function renderLinearParamFields(mount, t) {
  const formId = getActiveLinearFormId();
  graphState.linearForm = formId;
  document.getElementById("graphParamsSubtitle").textContent = t["paramSubtitle_" + formId] || "";
  const numInput = (label, id, val) =>
    `<label><span>${label}:</span> <input type="number" step="any" id="${id}" value="${val}" /></label>`;
  const disabledInput = (label, id, val) =>
    `<label><span>${label}:</span> <input type="text" id="${id}" value="${val}" disabled /></label>`;

  if (formId === "lSlope") {
    const p = getSlopeInterceptParams(graphState.linear);
    if (p.isVertical) {
      mount.innerHTML =
        disabledInput(t.paramLabelM, "linInputM", t.naLabel) +
        disabledInput(t.paramLabelB, "linInputB", t.naLabel);
      document.getElementById("graphParamsFactoredNote").textContent = t.noSlopeInterceptNote;
    } else {
      mount.innerHTML =
        numInput(t.paramLabelM, "linInputM", fmt(p.m)) +
        numInput(t.paramLabelB, "linInputB", fmt(p.b));
    }
  } else if (formId === "lPoint") {
    const p = getPointSlopeParams(graphState.linear);
    if (p.isVertical) {
      mount.innerHTML =
        disabledInput(t.paramLabelM, "linInputM", t.naLabel) +
        disabledInput(t.paramLabelX1, "linInputX1", t.naLabel) +
        disabledInput(t.paramLabelY1, "linInputY1", t.naLabel);
      document.getElementById("graphParamsFactoredNote").textContent = t.noPointSlopeNote;
    } else {
      mount.innerHTML =
        numInput(t.paramLabelM, "linInputM", fmt(p.m)) +
        numInput(t.paramLabelX1, "linInputX1", fmt(p.x1)) +
        numInput(t.paramLabelY1, "linInputY1", fmt(p.y1));
    }
  } else {
    const p = getLinearStandardParams(graphState.linear);
    mount.innerHTML =
      numInput(t.paramLabelA, "linInputA", fmt(p.A)) +
      numInput(t.paramLabelBigB, "linInputBigB", fmt(p.B)) +
      numInput(t.paramLabelC, "linInputC", fmt(p.C));
  }
  bindParamEnterKeysLocal(mount);
}

function updateCurrentExampleForms() {
  const mount = document.getElementById("currentExampleForms");
  const t = i18n[currentLang()];
  if (graphState.mode === "quadratic") {
    const g = getQuadraticFeatures(graphState.quadratic, currentLang(), i18n);
    if (!g.valid) {
      mount.innerHTML = "<div class=\"example-form-cards\"><div class=\"example-form-card card-standard\"><div class=\"efc-title\">" + t.formStandardLabel + "</div><div class=\"efc-expr\">" + (g.error === "aZero" ? t.quadErrorAZero : t.quadErrorInvalid) + "</div></div></div>";
      return;
    }
    mount.innerHTML = `
      <div class="example-form-cards">
        <div class="example-form-card card-standard">
          <div class="efc-title">${t.formStandardLabel}</div>
          <div class="efc-expr">${g.standardFormText}</div>
        </div>
        <div class="example-form-card card-vertex">
          <div class="efc-title">${t.formVertexLabel}</div>
          <div class="efc-expr">${g.vertexFormText}</div>
        </div>
        <div class="example-form-card card-factored">
          <div class="efc-title">${t.formFactoredLabel}</div>
          <div class="efc-expr">${g.factoredFormText}</div>
        </div>
      </div>
    `;
    return;
  }
  if (graphState.mode === "linear") {
    const lf = getLinearFeatures(graphState.linear);
    if (!lf.valid) {
      mount.innerHTML = "<div class=\"example-form-cards\"><div class=\"example-form-card card-standard\"><div class=\"efc-title\">" + t.formLinearStandardLabel + "</div><div class=\"efc-expr\">" + t.linearErrorInvalid + "</div></div></div>";
      return;
    }
    const slopeText = lf.isVertical ? t.noSlopeInterceptNote : lf.slopeInterceptText;
    const pointText = lf.isVertical ? t.noPointSlopeNote : lf.pointSlopeText;
    mount.innerHTML = `
      <div class="example-form-cards">
        <div class="example-form-card card-standard">
          <div class="efc-title">${t.formLinearSlopeLabel}</div>
          <div class="efc-expr">${slopeText}</div>
        </div>
        <div class="example-form-card card-vertex">
          <div class="efc-title">${t.formLinearPointLabel}</div>
          <div class="efc-expr">${pointText}</div>
        </div>
        <div class="example-form-card card-factored">
          <div class="efc-title">${t.formLinearStandardLabel}</div>
          <div class="efc-expr">${lf.standardFormText}</div>
        </div>
      </div>
    `;
    return;
  }
  mount.innerHTML = "";
}

function applyQuadraticParams() {
  const t = i18n[currentLang()];
  const errEl = document.getElementById("graphParamError");
  const formId = getActiveQuadraticFormId();
  const aEl = document.getElementById("quadInputA");
  if (!aEl) return;
  const a = Number(aEl.value);
  let next = null;

  if (!Number.isFinite(a)) {
    errEl.textContent = t.quadErrorInvalid;
    return;
  }

  if (formId === "qStandard") {
    const b = Number(document.getElementById("quadInputB").value);
    const c = Number(document.getElementById("quadInputC").value);
    if (!Number.isFinite(b) || !Number.isFinite(c)) {
      errEl.textContent = t.quadErrorInvalid;
      return;
    }
    next = { a, b, c };
  } else if (formId === "qFactored") {
    const fp = getFactoredParams(graphState.quadratic);
    if (!fp.hasRealRoots) {
      next = { a, b: graphState.quadratic.b, c: graphState.quadratic.c };
    } else {
      const r1 = Number(document.getElementById("quadInputR1").value);
      const r2 = Number(document.getElementById("quadInputR2").value);
      if (!Number.isFinite(r1) || !Number.isFinite(r2)) {
        errEl.textContent = t.quadErrorInvalid;
        return;
      }
      next = abcFromFactored(a, r1, r2);
    }
  } else {
    const h = Number(document.getElementById("quadInputH").value);
    const k = Number(document.getElementById("quadInputK").value);
    if (!Number.isFinite(h) || !Number.isFinite(k)) {
      errEl.textContent = t.quadErrorInvalid;
      return;
    }
    next = abcFromVertex(a, h, k);
  }

  if (Math.abs(next.a) < EPS) {
    errEl.textContent = t.quadErrorAZero;
    graphState.quadratic = next;
    updateCurrentExampleForms();
    renderParameterInputs();
    drawMainGraph();
    updateGraphAnnotationText(getLastSelected());
    return;
  }

  errEl.textContent = "";
  graphState.quadratic = next;
  updateCurrentExampleForms();
  renderParameterInputs();
  drawMainGraph();
  updateGraphAnnotationText(getLastSelected());
}

function applyLinearParams() {
  const t = i18n[currentLang()];
  const errEl = document.getElementById("graphParamError");
  const formId = getActiveLinearFormId();
  let next = null;

  if (formId === "lSlope") {
    const p = getSlopeInterceptParams(graphState.linear);
    if (p.isVertical) {
      errEl.textContent = "";
      return;
    }
    const m = Number(document.getElementById("linInputM").value);
    const b = Number(document.getElementById("linInputB").value);
    if (!Number.isFinite(m) || !Number.isFinite(b)) {
      errEl.textContent = t.linearErrorInvalid;
      return;
    }
    next = syncLinearFromNormal(m, b, [1, m + b]);
  } else if (formId === "lPoint") {
    const p = getPointSlopeParams(graphState.linear);
    if (p.isVertical) {
      errEl.textContent = "";
      return;
    }
    const m = Number(document.getElementById("linInputM").value);
    const x1 = Number(document.getElementById("linInputX1").value);
    const y1 = Number(document.getElementById("linInputY1").value);
    if (!Number.isFinite(m) || !Number.isFinite(x1) || !Number.isFinite(y1)) {
      errEl.textContent = t.linearErrorInvalid;
      return;
    }
    const b = y1 - m * x1;
    next = syncLinearFromNormal(m, b, [x1, y1]);
  } else {
    const A = Number(document.getElementById("linInputA").value);
    const B = Number(document.getElementById("linInputBigB").value);
    const C = Number(document.getElementById("linInputC").value);
    if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(C)) {
      errEl.textContent = t.linearErrorInvalid;
      return;
    }
    const converted = linearFromStandard(A, B, C);
    if (!converted.valid) {
      errEl.textContent = converted.error === "abZero" ? t.linearErrorABZero : t.linearErrorInvalid;
      return;
    }
    next = converted.state;
  }

  errEl.textContent = "";
  graphState.linear = next;
  updateCurrentExampleForms();
  renderParameterInputs();
  drawMainGraph();
  updateGraphAnnotationText(getLastSelected());
}

function applyGraphParams() {
  if (graphState.mode === "quadratic") applyQuadraticParams();
  else if (graphState.mode === "linear") applyLinearParams();
}

function resetGraphParams() {
  const t = i18n[currentLang()];
  document.getElementById("graphParamError").textContent = "";
  document.getElementById("graphParamsFactoredNote").textContent = "";
  if (graphState.mode === "quadratic") {
    graphState.quadratic = { ...DEFAULT_QUADRATIC };
  } else if (graphState.mode === "linear") {
    graphState.linear = { ...DEFAULT_LINEAR };
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
