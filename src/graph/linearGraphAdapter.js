import {
  DEFAULT_LINEAR,
  getLinearFeatures,
  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard
} from "../math/linear.js";
import { fmt } from "../math/format.js";
import { buildPannedViewport, viewportWithSampleStep } from "./viewport.js";
import { buildLinearAnnotations, getLinearAnnotationNote } from "./linearGraphAnnotations.js";

export const linearGraphAdapter = {
  id: "linear",
  parameterForms: ["lSlope", "lPoint", "lStandard"],
  defaultFormId: "lSlope",

  getDefaultParams() {
    return { ...DEFAULT_LINEAR };
  },

  getFeatures(params) {
    return getLinearFeatures(params);
  },

  evaluate(x, params) {
    const lf = getLinearFeatures(params);
    if (!lf.valid || lf.isVertical) return null;
    return lf.m * x + lf.b;
  },

  getRequiredPoints(params, features) {
    const lf = features?.valid === true ? features : getLinearFeatures(params);
    if (!lf.valid) return [];
    if (lf.isVertical) {
      const x = lf.xConst;
      if (lf.point) return [{ x, y: lf.point[1] }];
      return [{ x, y: 0 }];
    }
    if (Number.isFinite(lf.b)) return [{ x: 0, y: lf.b }];
    if (lf.xInt !== null && Number.isFinite(lf.xInt)) return [{ x: lf.xInt, y: 0 }];
    if (lf.point) return [{ x: lf.point[0], y: lf.point[1] }];
    return [];
  },

  getViewport(params, features, options = {}) {
    const lf = features?.valid === true ? features : getLinearFeatures(params);
    if (options.auto === false) {
      if (lf.valid && lf.isVertical) {
        return { kind: "vertical", xConst: lf.xConst, pixelScale: 22 };
      }
      return { kind: "segment", xMin: -12, xMax: 12, pixelScale: 22 };
    }
    const requiredPoints = this.getRequiredPoints(params, features);
    const bounds = buildPannedViewport({
      requiredPoints,
      baseXSpan: 20,
      baseYSpan: 20,
      preferredOriginCentered: true
    });
    const vp = { ...viewportWithSampleStep(bounds), kind: "bounds" };
    if (lf.valid && lf.isVertical) {
      return { ...vp, kind: "vertical", xConst: lf.xConst };
    }
    return { ...vp, kind: "segment" };
  },

  getExampleForms(features, t) {
    if (!features.valid) return null;
    return {
      cards: [
        {
          className: "card-standard",
          title: t.formLinearSlopeLabel,
          expr: features.isVertical ? t.noSlopeInterceptNote : features.slopeInterceptText
        },
        {
          className: "card-vertex",
          title: t.formLinearPointLabel,
          expr: features.isVertical ? t.noPointSlopeNote : features.pointSlopeText
        },
        {
          className: "card-factored",
          title: t.formLinearStandardLabel,
          expr: features.standardFormText
        }
      ]
    };
  },

  getSlopeInterceptParams,
  getPointSlopeParams,
  getLinearStandardParams,
  syncLinearFromNormal,
  linearFromStandard,

  getActiveFormId(graphState) {
    return graphState.activeFormByAdapter?.linear ?? this.defaultFormId;
  },

  getCurrentParams(graphState) {
    return graphState.paramsByAdapter?.linear;
  },

  setCurrentParams(graphState, next) {
    if (!graphState.paramsByAdapter) graphState.paramsByAdapter = {};
    graphState.paramsByAdapter.linear = next;
  },

  setActiveFormId(graphState, formId) {
    if (!graphState.activeFormByAdapter) graphState.activeFormByAdapter = {};
    graphState.activeFormByAdapter.linear = formId;
  },

  renderParameterFields({ graphState, formId, mount, t, setNote, bindEnter }) {
    document.getElementById("graphParamsSubtitle").textContent = t["paramSubtitle_" + formId] || "";
    const params = this.getCurrentParams(graphState);
    const numInput = (label, id, val) =>
      `<label><span>${label}:</span> <input type="number" step="any" id="${id}" value="${val}" /></label>`;
    const disabledInput = (label, id, val) =>
      `<label><span>${label}:</span> <input type="text" id="${id}" value="${val}" disabled /></label>`;

    if (formId === "lSlope") {
      const p = this.getSlopeInterceptParams(params);
      if (p.isVertical) {
        mount.innerHTML =
          disabledInput(t.paramLabelM, "linInputM", t.naLabel) +
          disabledInput(t.paramLabelB, "linInputB", t.naLabel);
        setNote(t.noSlopeInterceptNote);
      } else {
        mount.innerHTML =
          numInput(t.paramLabelM, "linInputM", fmt(p.m)) +
          numInput(t.paramLabelB, "linInputB", fmt(p.b));
      }
    } else if (formId === "lPoint") {
      const p = this.getPointSlopeParams(params);
      if (p.isVertical) {
        mount.innerHTML =
          disabledInput(t.paramLabelM, "linInputM", t.naLabel) +
          disabledInput(t.paramLabelX1, "linInputX1", t.naLabel) +
          disabledInput(t.paramLabelY1, "linInputY1", t.naLabel);
        setNote(t.noPointSlopeNote);
      } else {
        mount.innerHTML =
          numInput(t.paramLabelM, "linInputM", fmt(p.m)) +
          numInput(t.paramLabelX1, "linInputX1", fmt(p.x1)) +
          numInput(t.paramLabelY1, "linInputY1", fmt(p.y1));
      }
    } else {
      const p = this.getLinearStandardParams(params);
      mount.innerHTML =
        numInput(t.paramLabelA, "linInputA", fmt(p.A)) +
        numInput(t.paramLabelBigB, "linInputBigB", fmt(p.B)) +
        numInput(t.paramLabelC, "linInputC", fmt(p.C));
    }
    bindEnter(mount);
  },

  applyParameterInputs({ graphState, formId, t, setError }) {
    let next = null;
    const current = this.getCurrentParams(graphState);
    if (formId === "lSlope") {
      const p = this.getSlopeInterceptParams(current);
      if (p.isVertical) {
        setError("");
        return { changed: false };
      }
      const m = Number(document.getElementById("linInputM").value);
      const b = Number(document.getElementById("linInputB").value);
      if (!Number.isFinite(m) || !Number.isFinite(b)) {
        setError(t.linearErrorInvalid);
        return { changed: false };
      }
      next = this.syncLinearFromNormal(m, b, [1, m + b]);
    } else if (formId === "lPoint") {
      const p = this.getPointSlopeParams(current);
      if (p.isVertical) {
        setError("");
        return { changed: false };
      }
      const m = Number(document.getElementById("linInputM").value);
      const x1 = Number(document.getElementById("linInputX1").value);
      const y1 = Number(document.getElementById("linInputY1").value);
      if (!Number.isFinite(m) || !Number.isFinite(x1) || !Number.isFinite(y1)) {
        setError(t.linearErrorInvalid);
        return { changed: false };
      }
      const b = y1 - m * x1;
      next = this.syncLinearFromNormal(m, b, [x1, y1]);
    } else {
      const A = Number(document.getElementById("linInputA").value);
      const B = Number(document.getElementById("linInputBigB").value);
      const C = Number(document.getElementById("linInputC").value);
      if (!Number.isFinite(A) || !Number.isFinite(B) || !Number.isFinite(C)) {
        setError(t.linearErrorInvalid);
        return { changed: false };
      }
      const converted = this.linearFromStandard(A, B, C);
      if (!converted.valid) {
        setError(converted.error === "abZero" ? t.linearErrorABZero : t.linearErrorInvalid);
        return { changed: false };
      }
      next = converted.state;
    }
    this.setCurrentParams(graphState, next);
    setError("");
    return { changed: true };
  },

  isValidParams(features) {
    return features?.valid === true;
  },

  getCanvasError(_features, t) {
    return t.canvasErrorLinearInvalid;
  },

  getAnnotations(ctx) {
    return buildLinearAnnotations({ ...ctx, getLinearFeatures });
  },

  getAnnotationNote(ctx) {
    return getLinearAnnotationNote({ ...ctx, getLinearFeatures });
  }
};
