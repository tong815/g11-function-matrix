import {
  DEFAULT_QUADRATIC,
  getStandardParams,
  getFactoredParams,
  getVertexParams,
  abcFromFactored,
  abcFromVertex
} from "../math/quadratic.js";
import { EPS, fmt } from "../math/format.js";
import { buildPannedViewport, viewportWithSampleStep } from "./viewport.js";
import { buildQuadraticAnnotations, getQuadraticAnnotationNote } from "./quadraticGraphAnnotations.js";
import { featuresForAdapterParams } from "./graphFeatureBridge.js";

export const quadraticGraphAdapter = {
  id: "quadratic",
  parameterForms: ["qStandard", "qFactored", "qVertex"],
  defaultFormId: "qStandard",

  getDefaultParams() {
    return { ...DEFAULT_QUADRATIC };
  },

  /** @deprecated Prefer featuresForRoot from graphFeatureBridge */
  getFeatures(params, lang, i18n, formId = "qStandard") {
    return featuresForAdapterParams("quadratic", params, formId, lang, i18n);
  },

  evaluate(x, params) {
    const { a, b, c } = params;
    return a * x * x + b * x + c;
  },

  getRequiredPoints(_params, features) {
    if (!features?.valid) return [];
    return [{ x: features.h, y: features.k }];
  },

  getViewport(params, features, options = {}) {
    if (options.auto === false) {
      return { xMin: -10, xMax: 10, sampleStep: 0.05, pixelScale: 22, kind: "legacy" };
    }
    const requiredPoints = this.getRequiredPoints(params, features);
    const bounds = buildPannedViewport({
      requiredPoints,
      baseXSpan: 20,
      baseYSpan: 20,
      preferredOriginCentered: true
    });
    return { ...viewportWithSampleStep(bounds), kind: "bounds" };
  },

  getExampleForms(features, t) {
    if (!features.valid) return null;
    return {
      cards: [
        { className: "card-standard", title: t.formStandardLabel, expr: features.standardFormText },
        { className: "card-vertex", title: t.formVertexLabel, expr: features.vertexFormText },
        { className: "card-factored", title: t.formFactoredLabel, expr: features.factoredFormText }
      ]
    };
  },

  getStandardParams,
  getFactoredParams,
  getVertexParams,
  abcFromFactored,
  abcFromVertex,

  getActiveFormId(graphState) {
    return graphState.activeFormByAdapter?.quadratic ?? this.defaultFormId;
  },

  getCurrentParams(graphState) {
    return graphState.paramsByAdapter?.quadratic;
  },

  setCurrentParams(graphState, next) {
    if (!graphState.paramsByAdapter) graphState.paramsByAdapter = {};
    graphState.paramsByAdapter.quadratic = next;
  },

  setActiveFormId(graphState, formId) {
    if (!graphState.activeFormByAdapter) graphState.activeFormByAdapter = {};
    graphState.activeFormByAdapter.quadratic = formId;
  },

  renderParameterFields({ graphState, formId, mount, t, currentLang, i18n, setNote, bindEnter }) {
    document.getElementById("graphParamsSubtitle").textContent = t["paramSubtitle_" + formId] || "";
    const params = this.getCurrentParams(graphState);
    const aInput = (val) =>
      `<label><span>a:</span> <input type="number" step="any" id="quadInputA" value="${val}" /></label>`;
    if (formId === "qStandard") {
      const p = this.getStandardParams(params);
      mount.innerHTML =
        aInput(fmt(p.a)) +
        `<label><span>b:</span> <input type="number" step="any" id="quadInputB" value="${fmt(p.b)}" /></label>` +
        `<label><span>c:</span> <input type="number" step="any" id="quadInputC" value="${fmt(p.c)}" /></label>`;
    } else if (formId === "qFactored") {
      const p = this.getFactoredParams(params);
      if (!p.hasRealRoots) {
        mount.innerHTML =
          aInput(fmt(p.a)) +
          `<label><span>${t.paramLabelR1}:</span> <input type="text" id="quadInputR1" value="${t.noRealRootLabel}" disabled /></label>` +
          `<label><span>${t.paramLabelR2}:</span> <input type="text" id="quadInputR2" value="${t.noRealRootLabel}" disabled /></label>`;
        setNote(t.noRealFactoredParamNote);
      } else {
        mount.innerHTML =
          aInput(fmt(p.a)) +
          `<label><span>${t.paramLabelR1}:</span> <input type="number" step="any" id="quadInputR1" value="${fmt(p.r1)}" /></label>` +
          `<label><span>${t.paramLabelR2}:</span> <input type="number" step="any" id="quadInputR2" value="${fmt(p.isDouble ? p.r1 : p.r2)}" /></label>`;
      }
    } else {
      const p = this.getVertexParams(params, currentLang, i18n);
      mount.innerHTML =
        aInput(fmt(p.a)) +
        `<label><span>${t.paramLabelH}:</span> <input type="number" step="any" id="quadInputH" value="${fmt(p.h)}" /></label>` +
        `<label><span>${t.paramLabelK}:</span> <input type="number" step="any" id="quadInputK" value="${fmt(p.k)}" /></label>`;
    }
    bindEnter(mount);
  },

  applyParameterInputs({ graphState, formId, t, setError, getRootFunction }) {
    const aEl = document.getElementById("quadInputA");
    if (!aEl) return { changed: false };
    const a = Number(aEl.value);
    const current = this.getCurrentParams(graphState);
    const rootCanon = getRootFunction?.()?.canonicalParams ?? current;

    if (!Number.isFinite(a)) {
      setError(t.quadErrorInvalid);
      return { changed: false };
    }
    let formParams = null;

    if (formId === "qStandard") {
      const b = Number(document.getElementById("quadInputB").value);
      const c = Number(document.getElementById("quadInputC").value);
      if (!Number.isFinite(b) || !Number.isFinite(c)) {
        setError(t.quadErrorInvalid);
        return { changed: false };
      }
      formParams = { a, b, c };
    } else if (formId === "qFactored") {
      const fp = this.getFactoredParams(current);
      if (!fp.hasRealRoots) {
        formParams = { a, b: rootCanon.b, c: rootCanon.c };
        setError("");
        return { changed: true, formId: "qStandard", formParams };
      }
      const r1 = Number(document.getElementById("quadInputR1").value);
      const r2 = Number(document.getElementById("quadInputR2").value);
      if (!Number.isFinite(r1) || !Number.isFinite(r2)) {
        setError(t.quadErrorInvalid);
        return { changed: false };
      }
      formParams = { a, r1, r2 };
    } else {
      const h = Number(document.getElementById("quadInputH").value);
      const k = Number(document.getElementById("quadInputK").value);
      if (!Number.isFinite(h) || !Number.isFinite(k)) {
        setError(t.quadErrorInvalid);
        return { changed: false };
      }
      formParams = { a, h, k };
    }

    if (Math.abs(formParams.a) < EPS) {
      setError(t.quadErrorAZero);
      return { changed: false };
    }
    setError("");
    return { changed: true, formId, formParams };
  },

  isValidParams(features) {
    return features?.valid === true;
  },

  getCanvasError(features, t) {
    if (features.error === "aZero") return t.canvasErrorAZero;
    return t.quadErrorInvalid;
  },

  getAnnotations(ctx) {
    if (!ctx.features) return [];
    return buildQuadraticAnnotations(ctx);
  },

  getAnnotationNote(ctx) {
    return getQuadraticAnnotationNote(ctx);
  }
};
