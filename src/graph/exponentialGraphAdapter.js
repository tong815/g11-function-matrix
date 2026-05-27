import { EPS, fmt } from "../math/format.js";
import {
  DEFAULT_EXPONENTIAL,
  evaluateExponential,
  getExponentialFeatures,
  validateExponentialParams,
  validateGrowthDecayParams
} from "../math/exponential.js";

export const exponentialGraphAdapter = {
  id: "exponential",
  parameterForms: ["eBasic", "eTransformed", "eGrowthDecay"],
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

  getViewport() {
    return { xMin: -6, xMax: 6, sampleStep: 0.03, pixelScale: 28 };
  },

  getExampleForms(features, t) {
    if (!features.valid) return null;
    return {
      cards: [
        { className: "card-standard", title: t.formExponentialBasicLabel, expr: features.basicFormText },
        { className: "card-vertex", title: t.formExponentialTransformedLabel, expr: features.transformedFormText },
        { className: "card-factored", title: t.formExponentialGrowthDecayLabel, expr: features.growthDecayFormText }
      ]
    };
  },

  getActiveFormId(graphState, lastSelected) {
    if (lastSelected?.matrixKey === "exponential") return lastSelected.formId;
    return graphState.activeFormByAdapter?.exponential || "eTransformed";
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

  renderParameterFields({ graphState, formId, mount, t, setNote, bindEnter }) {
    this.setActiveFormId(graphState, formId);
    document.getElementById("graphParamsSubtitle").textContent = t["paramSubtitle_" + formId] || "";
    const params = this.getCurrentParams(graphState) || this.getDefaultParams();
    const num = (label, id, val) =>
      `<label><span>${label}:</span> <input type="number" step="any" id="${id}" value="${val}" /></label>`;

    if (formId === "eBasic") {
      mount.innerHTML = num("b", "expInputB", fmt(params.b));
    } else if (formId === "eGrowthDecay") {
      mount.innerHTML =
        num(t.paramLabelA, "expInputBigA", fmt(params.a)) +
        num("r", "expInputR", fmt(params.b));
      setNote(t.paramGrowthDecayNote);
    } else {
      mount.innerHTML =
        num("a", "expInputA", fmt(params.a)) +
        num("b", "expInputB", fmt(params.b)) +
        num("h", "expInputH", fmt(params.h)) +
        num("k", "expInputK", fmt(params.k));
    }
    bindEnter(mount);
  },

  applyParameterInputs({ graphState, formId, t, setError }) {
    let next = null;
    if (formId === "eBasic") {
      const b = Number(document.getElementById("expInputB").value);
      const check = validateExponentialParams({ a: 1, b, h: 0, k: 0 });
      if (!check.valid) {
        setError(check.error === "bInvalid" ? t.expErrorBInvalid : t.expErrorInvalid);
        return { changed: false };
      }
      next = { a: 1, b, h: 0, k: 0 };
    } else if (formId === "eGrowthDecay") {
      const A = Number(document.getElementById("expInputBigA").value);
      const r = Number(document.getElementById("expInputR").value);
      const check = validateGrowthDecayParams({ A, r });
      if (!check.valid) {
        setError(check.error === "aZero" ? t.expErrorAZero : check.error === "bInvalid" ? t.expErrorBInvalid : t.expErrorInvalid);
        return { changed: false };
      }
      next = { a: A, b: r, h: 0, k: 0 };
    } else {
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
      next = { a, b, h, k };
    }
    this.setCurrentParams(graphState, next);
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
    if (key === "eBasic|base" || key === "eGrowthDecay|base") {
      return isZH
        ? "底数 b≈" + fmt(g.b) + "（或增长率 r≈" + fmt(g.b) + "）决定曲线形状。"
        : "Base b≈" + fmt(g.b) + " (or growth factor r≈" + fmt(g.b) + ") controls the curve shape.";
    }
    if (key === "eTransformed|asymptote" || key === "eBasic|asymptote") {
      return isZH
        ? "水平渐近线 y=" + fmt(g.asymptoteY) + "（参数 k）。"
        : "Horizontal asymptote y=" + fmt(g.asymptoteY) + " (parameter k).";
    }
    if (key === "eGrowthDecay|initialValue") {
      return isZH
        ? "x=0 时 y≈" + fmt(g.yIntercept) + "，即初始值 A≈" + fmt(g.a) + "。"
        : "At x=0, y≈" + fmt(g.yIntercept) + ", so initial value A≈" + fmt(g.a) + ".";
    }
    if (key === "eBasic|growthDecay" || key === "eGrowthDecay|growthDecay") {
      return isZH
        ? "当前为" + g.growthOrDecay + "：b≈" + fmt(g.b) + "。"
        : "This example shows " + g.growthOrDecay + " with b≈" + fmt(g.b) + ".";
    }
    return isZH
      ? g.domainText + "；" + g.rangeText + "。"
      : g.domainText + "; " + g.rangeText + ".";
  }
};
