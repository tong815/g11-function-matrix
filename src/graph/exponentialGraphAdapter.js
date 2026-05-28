import { fmt } from "../math/format.js";
import {
  DEFAULT_EXPONENTIAL,
  evaluateExponential,
  getExponentialFeatures,
  validateExponentialParams
} from "../math/exponential.js";
import { buildViewportFromFocus } from "./viewport.js";

export const exponentialGraphAdapter = {
  id: "exponential",
  parameterForms: ["eTransformed"],
  defaultFormId: "eTransformed",

  getDefaultParams() {
    return { ...DEFAULT_EXPONENTIAL };
  },

  getFeatures(params, lang) {
    return getExponentialFeatures(params, lang);
  },

  evaluate(x, params) {
    const check = validateExponentialParams(params);
    if (!check.valid) return null;
    return evaluateExponential(x, check);
  },

  getFocusPoints(params, features) {
    const g = features?.valid === true ? features : getExponentialFeatures(params, "en");
    if (!g.valid) return [];
    const { a, b, h, k } = g;
    const evalAt = (x) => evaluateExponential(x, { a, b, h, k });
    const pts = [
      { x: 0, y: g.yIntercept },
      { x: h, y: evalAt(h) },
      { x: h - 2, y: evalAt(h - 2) },
      { x: h + 2, y: evalAt(h + 2) },
      { x: h, y: k },
      { x: h + 3, y: k }
    ];
    return pts.filter((p) => Number.isFinite(p.y));
  },

  getViewport(params, features, options = {}) {
    if (options.auto === false) {
      return { xMin: -6, xMax: 6, sampleStep: 0.03, pixelScale: 28, kind: "legacy" };
    }
    const focusPoints = this.getFocusPoints(params, features);
    return {
      ...buildViewportFromFocus(focusPoints, { minXSpan: 10, minYSpan: 8, paddingRatio: 0.2 }),
      kind: "bounds"
    };
  },

  getExampleForms(features, t) {
    if (!features.valid) return null;
    return {
      cards: [
        {
          className: "card-vertex",
          title: t.formExponentialTransformedLabel,
          expr: features.transformedFormText
        }
      ]
    };
  },

  getActiveFormId(graphState) {
    return graphState.activeFormByAdapter?.exponential ?? this.defaultFormId;
  },

  getCurrentParams(graphState) {
    return graphState.paramsByAdapter?.exponential;
  },

  setCurrentParams(graphState, next) {
    if (!graphState.paramsByAdapter) graphState.paramsByAdapter = {};
    graphState.paramsByAdapter.exponential = next;
  },

  setActiveFormId(graphState, formId) {
    if (!graphState.activeFormByAdapter) graphState.activeFormByAdapter = {};
    graphState.activeFormByAdapter.exponential = formId;
  },

  renderParameterFields({ graphState, formId, mount, t, bindEnter }) {
    document.getElementById("graphParamsSubtitle").textContent = t.paramSubtitle_eTransformed || "";
    const params = this.getCurrentParams(graphState) || this.getDefaultParams();
    const num = (label, id, val) =>
      `<label><span>${label}:</span> <input type="number" step="any" id="${id}" value="${val}" /></label>`;

    mount.innerHTML =
      num("a", "expInputA", fmt(params.a)) +
      num("b", "expInputB", fmt(params.b)) +
      num("h", "expInputH", fmt(params.h)) +
      num("k", "expInputK", fmt(params.k));
    bindEnter(mount);
  },

  applyParameterInputs({ graphState, formId, t, setError }) {
    const a = Number(document.getElementById("expInputA").value);
    const b = Number(document.getElementById("expInputB").value);
    const h = Number(document.getElementById("expInputH").value);
    const k = Number(document.getElementById("expInputK").value);
    const check = validateExponentialParams({ a, b, h, k });
    if (!check.valid) {
      setError(
        check.error === "aZero"
          ? t.expErrorAZero
          : check.error === "bInvalid"
            ? t.expErrorBInvalid
            : t.expErrorInvalid
      );
      return { changed: false };
    }
    this.setCurrentParams(graphState, { a, b, h, k });
    setError("");
    return { changed: true };
  },

  isValidParams(features) {
    return features?.valid === true;
  },

  getCanvasError(features, t) {
    if (features.error === "aZero") return t.expErrorAZero;
    if (features.error === "bInvalid") return t.expErrorBInvalid;
    return t.expErrorInvalid;
  },

  getAnnotationNote({ graphState, selection, currentLang, i18n }) {
    const t = i18n[currentLang];
    const isZH = currentLang === "zh";
    const params = this.getCurrentParams(graphState);
    const g = getExponentialFeatures(params, currentLang);
    if (!g.valid) {
      return g.error === "aZero" ? t.expErrorAZero : g.error === "bInvalid" ? t.expErrorBInvalid : t.expErrorInvalid;
    }
    const key = selection.formId + "|" + selection.infoKey;
    if (key === "eTransformed|base") {
      return isZH
        ? "底数 b≈" + fmt(g.b) + " 决定曲线形状。"
        : "Base b≈" + fmt(g.b) + " controls the curve shape.";
    }
    if (key === "eTransformed|asymptote") {
      return isZH
        ? "水平渐近线 y=" + fmt(g.asymptoteY) + "（参数 k）。"
        : "Horizontal asymptote y=" + fmt(g.asymptoteY) + " (parameter k).";
    }
    if (key === "eTransformed|initialValue") {
      return isZH
        ? "x=0 时 y≈" + fmt(g.yIntercept) + "（代入变换式可得）。"
        : "At x=0, y≈" + fmt(g.yIntercept) + " (substitute into transformed form).";
    }
    if (key === "eTransformed|growthDecay") {
      return isZH
        ? "当前为" + g.growthOrDecay + "：比较 b 与 1，b≈" + fmt(g.b) + "。"
        : "This example shows " + g.growthOrDecay + ": compare b to 1, b≈" + fmt(g.b) + ".";
    }
    return isZH
      ? g.domainText + "；" + g.rangeText + "。"
      : g.domainText + "; " + g.rangeText + ".";
  }
};
