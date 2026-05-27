import { fmt } from "../math/format.js";
import { getGraphAdapter } from "../graph/graphAdapterRegistry.js";

export function syncCanvasSize() {
  const canvas = document.getElementById("graphCanvas");
  if (!canvas) return;
  const isDesktop = document.documentElement.classList.contains("device-desktop");
  canvas.height = isDesktop ? 360 : 280;
  canvas.width = 560;
}

export function detectDeviceMode() {
  const ua = navigator.userAgent || "";
  const isPhone = /iPhone|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(ua);
  const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  const isCoarse = window.matchMedia("(pointer: coarse)").matches;
  const isNarrow = window.innerWidth <= 1100;
  const isMobile = isPhone || (isNarrow && isTouch && isCoarse) || window.innerWidth <= 768;
  document.documentElement.classList.remove("device-mobile", "device-desktop");
  document.documentElement.classList.add(isMobile ? "device-mobile" : "device-desktop");
  syncCanvasSize();
  return isMobile ? "mobile" : "desktop";
}

export function createGraphHandlers(deps) {
  const { graphState, getLang, i18n, matrixByKey, getLastSelected } = deps;
  const currentLang = () => getLang();

  function drawAxes(ctx, w, h) {
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#d1d5db";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();
  }

  function toCanvasX(x, w, scale = 22) {
    return w / 2 + x * scale;
  }

  function toCanvasY(y, h, scale = 22) {
    return h / 2 - y * scale;
  }

  function getActiveAdapter() {
    return getGraphAdapter(graphState.mode);
  }

  function getActiveQuadraticFormId() {
    const adapter = getGraphAdapter("quadratic");
    return adapter.getActiveFormId(graphState, getLastSelected());
  }

  function getActiveLinearFormId() {
    const adapter = getGraphAdapter("linear");
    return adapter.getActiveFormId(graphState, getLastSelected());
  }

  function updateGraphLabel(matrixKey, formId) {
    const matrix = matrixByKey[matrixKey];
    const t = i18n[currentLang()];
    const formIndex = matrix.forms.findIndex((f) => f.id === formId);
    const formLabels = matrixKey === "quadratic" ? t.qForms : t.lForms;
    const objectLabel = matrixKey === "quadratic" ? t.graphQuadratic : t.graphLinear;
    const label = formIndex >= 0 ? objectLabel + " / " + formLabels[formIndex] : objectLabel;
    document.getElementById("graphLabel").textContent = label;
  }

  function getCellLevel(matrixKey, formId, infoKey) {
    return matrixByKey[matrixKey].cells[infoKey][formId];
  }

  function getAnnotationStrength(matrixKey, formId, targetInfo, clickedInfo) {
    const level = getCellLevel(matrixKey, formId, targetInfo);
    if (targetInfo === clickedInfo) return "focus";
    if (level === "weak") return null;
    if (level === "direct") return "direct";
    if (level === "derivable") return "derivable";
    return null;
  }

  const strengthRank = { focus: 3, direct: 2, derivable: 1 };

  function mergeAnnotations(rawList) {
    const annotations = [];
    rawList.forEach((ann) => {
      if (ann.type === "point") {
        const key = "p:" + ann.x.toFixed(3) + "," + ann.y.toFixed(3);
        const existing = annotations.find((a) => a.type === "point" && a.key === key);
        if (existing) {
          if (strengthRank[ann.strength] >= strengthRank[existing.strength]) {
            existing.strength = ann.strength;
            existing.label = ann.label;
            existing.target = ann.target;
          }
        } else {
          annotations.push({ ...ann, key });
        }
      } else {
        annotations.push(ann);
      }
    });
    return annotations;
  }

  function getAnnotationContext(selection) {
    return {
      graphState,
      selection,
      currentLang: currentLang(),
      i18n,
      getCellLevel,
      getAnnotationStrength
    };
  }

  function getDirectGraphAnnotations(selection) {
    if (!selection) return [];
    const adapter = getGraphAdapter(selection.matrixKey);
    if (!adapter?.getAnnotations) return [];
    return mergeAnnotations(adapter.getAnnotations(getAnnotationContext(selection)));
  }

  function getAnnStyle(strength) {
    if (strength === "focus") {
      return { color: "#dc2626", lineWidth: 2.5, radius: 6, dash: [], font: "bold 11px Segoe UI" };
    }
    if (strength === "direct") {
      return { color: "#2563eb", lineWidth: 2, radius: 5, dash: [], font: "600 11px Segoe UI" };
    }
    return { color: "#9ca3af", lineWidth: 1.5, radius: 4, dash: [5, 4], font: "11px Segoe UI" };
  }

  function drawPointAnnotation(ctx, w, h, ann, scale) {
    const style = getAnnStyle(ann.strength);
    const px = toCanvasX(ann.x, w, scale);
    const py = toCanvasY(ann.y, h, scale);
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.arc(px, py, style.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = style.font;
    ctx.fillText(ann.label, px + 7, py - 7);
  }

  function drawVerticalLineAnnotation(ctx, w, h, ann, scale) {
    const style = getAnnStyle(ann.strength);
    const px = toCanvasX(ann.x, w, scale);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, h);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(ann.label, px + 4, 14);
  }

  function drawTextAnnotation(ctx, w, h, ann, scale) {
    const style = getAnnStyle(ann.strength);
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(ann.label, toCanvasX(ann.x, w, scale), toCanvasY(ann.y, h, scale));
  }

  function drawSlopeTriangle(ctx, w, h, ann, scale) {
    const style = getAnnStyle(ann.strength);
    const t = i18n[currentLang()];
    const { x0, y0, m } = ann;
    const x1 = x0 + 1;
    const y1 = y0 + m;
    const px0 = toCanvasX(x0, w, scale);
    const py0 = toCanvasY(y0, h, scale);
    const px1 = toCanvasX(x1, w, scale);
    const py1 = toCanvasY(y1, h, scale);
    const pyBase = toCanvasY(y0, h, scale);

    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(px0, py0);
    ctx.lineTo(px1, py1);
    ctx.moveTo(px0, pyBase);
    ctx.lineTo(px1, pyBase);
    ctx.moveTo(px1, pyBase);
    ctx.lineTo(px1, py1);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(t.markerRun, (px0 + px1) / 2 - 12, pyBase + 12);
    ctx.fillText(t.markerRise + "=" + m, px1 + 4, (pyBase + py1) / 2);
  }

  function drawNoRootsAnnotation(ctx, w, h, ann) {
    const style = getAnnStyle(ann.strength);
    const msg = currentLang() === "zh" ? "无实数 x 截距（Δ < 0）" : "No real x-intercepts (Δ < 0)";
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(msg, w / 2 - 95, toCanvasY(0, h) + 20);
  }

  function drawInterceptLineAnnotation(ctx, w, h, ann, scale) {
    const style = getAnnStyle(ann.strength);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(toCanvasX(ann.xInt, w, scale), toCanvasY(0, h, scale));
    ctx.lineTo(toCanvasX(0, w, scale), toCanvasY(ann.yInt, h, scale));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function renderAnnotations(ctx, w, h, annotations, scale) {
    annotations.forEach((ann) => {
      if (ann.type === "point") drawPointAnnotation(ctx, w, h, ann, scale);
      else if (ann.type === "verticalLine") drawVerticalLineAnnotation(ctx, w, h, ann, scale);
      else if (ann.type === "text") drawTextAnnotation(ctx, w, h, ann, scale);
      else if (ann.type === "slopeTriangle") drawSlopeTriangle(ctx, w, h, ann, scale);
      else if (ann.type === "noRoots") drawNoRootsAnnotation(ctx, w, h, ann);
      else if (ann.type === "interceptLine") drawInterceptLineAnnotation(ctx, w, h, ann, scale);
    });
  }

  function getGraphAnnotationNote(selection) {
    if (!selection) return i18n[currentLang()].graphAnnotationDefault;
    const adapter = getGraphAdapter(selection.matrixKey);
    if (adapter?.getAnnotationNote) {
      return adapter.getAnnotationNote({
        graphState,
        selection,
        currentLang: currentLang(),
        i18n,
        getCellLevel
      });
    }
    return i18n[currentLang()].graphAnnotationDefault;
  }

  function updateGraphAnnotationText(selection) {
    const el = document.getElementById("graphAnnotationText");
    if (el) el.textContent = getGraphAnnotationNote(selection);
  }

  function drawSampledCurve(ctx, w, h, adapter, params, viewport) {
    const scale = viewport.pixelScale ?? 22;
    const { xMin, xMax, sampleStep } = viewport;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let x = xMin; x <= xMax; x += sampleStep) {
      const y = adapter.evaluate(x, params);
      if (y === null || !Number.isFinite(y)) continue;
      const px = toCanvasX(x, w, scale);
      const py = toCanvasY(y, h, scale);
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
    return scale;
  }

  function drawMainGraph() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    drawAxes(ctx, w, h);

    const adapter = getActiveAdapter();
    if (!adapter) return;

    const t = i18n[currentLang()];
    const params = graphState.mode === "quadratic" ? graphState.quadratic : graphState.linear;
    const features = adapter.getFeatures(params, currentLang(), i18n);

    if (!adapter.isValidParams(features)) {
      ctx.fillStyle = "#6b7280";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(adapter.getCanvasError(features, t), w / 2, h / 2);
      ctx.textAlign = "left";
      return;
    }

    const viewport = adapter.getViewport(params, features);
    let scale = viewport.pixelScale ?? 22;

    if (viewport.kind === "vertical") {
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const px = toCanvasX(viewport.xConst, w, scale);
      ctx.moveTo(px, 0);
      ctx.lineTo(px, h);
      ctx.stroke();
    } else if (viewport.kind === "segment") {
      const lf = features;
      ctx.strokeStyle = "#111827";
      ctx.lineWidth = 2;
      ctx.beginPath();
      const x1 = viewport.xMin;
      const y1 = lf.m * x1 + lf.b;
      const x2 = viewport.xMax;
      const y2 = lf.m * x2 + lf.b;
      ctx.moveTo(toCanvasX(x1, w, scale), toCanvasY(y1, h, scale));
      ctx.lineTo(toCanvasX(x2, w, scale), toCanvasY(y2, h, scale));
      ctx.stroke();
    } else {
      scale = drawSampledCurve(ctx, w, h, adapter, params, viewport);
    }

    const annotations = getDirectGraphAnnotations(getLastSelected());
    renderAnnotations(ctx, w, h, annotations, scale);
  }

  return {
    updateGraphLabel,
    drawMainGraph,
    updateGraphAnnotationText,
    getActiveQuadraticFormId,
    getActiveLinearFormId
  };
}
