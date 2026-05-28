import { getGraphAdapter } from "../graph/graphAdapterRegistry.js";
import { getMatrixCellLevel } from "../data/matrixCells.js";
import { createCoordMapper } from "../graph/viewport.js";

/** Match CSS #graphCanvas height for correct bitmap resolution (layout.css / responsive.css). */
export function syncCanvasSize() {
  const canvas = document.getElementById("graphCanvas");
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const h = Math.round(rect.height) || 360;
  if (canvas.height !== h) canvas.height = h;
  if (canvas.width !== 560) canvas.width = 560;
}

export function onViewportResize() {
  syncCanvasSize();
}

function drawArrowLine(ctx, x1, y1, x2, y2) {
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.stroke();
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const head = 7;
  ctx.beginPath();
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2 - head * Math.cos(angle - 0.4), y2 - head * Math.sin(angle - 0.4));
  ctx.lineTo(x2 - head * Math.cos(angle + 0.4), y2 - head * Math.sin(angle + 0.4));
  ctx.closePath();
  ctx.fill();
}

function drawWorldAxes(ctx, w, h, mapper) {
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = "#d1d5db";
  ctx.fillStyle = "#6b7280";
  ctx.lineWidth = 1;
  ctx.font = "11px Segoe UI, sans-serif";

  if (mapper.showsXAxis) {
    const y0 = mapper.toCanvasY(0);
    if (y0 >= 0 && y0 <= h) {
      ctx.strokeStyle = "#d1d5db";
      ctx.fillStyle = "#6b7280";
      drawArrowLine(ctx, 8, y0, w - 8, y0);
      ctx.fillText("x", w - 16, y0 - 6);
    }
  }

  if (mapper.showsYAxis) {
    const x0 = mapper.toCanvasX(0);
    if (x0 >= 0 && x0 <= w) {
      ctx.strokeStyle = "#d1d5db";
      ctx.fillStyle = "#6b7280";
      drawArrowLine(ctx, x0, h - 8, x0, 8);
      ctx.fillText("y", x0 + 6, 14);
    }
  }

  if (mapper.showsOrigin) {
    const { ox, oy } = mapper.originCanvas;
    ctx.fillStyle = "#6b7280";
    ctx.fillText("O", ox + 5, oy - 5);
  }
}

export function createGraphHandlers(deps) {
  const { graphState, getLang, i18n, matrixByKey, getLastSelected } = deps;
  const currentLang = () => getLang();

  function getActiveAdapter() {
    return getGraphAdapter(graphState.mode);
  }

  function getActiveQuadraticFormId() {
    const adapter = getGraphAdapter("quadratic");
    return adapter?.getActiveFormId(graphState) || "qStandard";
  }

  function getActiveLinearFormId() {
    const adapter = getGraphAdapter("linear");
    return adapter?.getActiveFormId(graphState) || "lSlope";
  }

  function updateGraphLabel(matrixKey, formId) {
    const matrix = matrixByKey[matrixKey];
    const t = i18n[currentLang()];
    if (!matrix) return;
    const form = matrix.forms.find((f) => f.id === formId);
    const objectLabel = matrix.objectLabelKey ? t[matrix.objectLabelKey] : matrixKey;
    const formLabel = form?.labelKey ? t[form.labelKey] : form?.id;
    const label = formLabel ? objectLabel + " / " + formLabel : objectLabel;
    document.getElementById("graphLabel").textContent = label;
  }

  function getCellLevel(matrixKey, formId, infoKey) {
    const matrix = matrixByKey[matrixKey];
    if (!matrix) return null;
    return getMatrixCellLevel(matrix, infoKey, formId);
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

  function drawPointAnnotation(ctx, mapper, ann) {
    const style = getAnnStyle(ann.strength);
    const px = mapper.toCanvasX(ann.x);
    const py = mapper.toCanvasY(ann.y);
    ctx.fillStyle = style.color;
    ctx.beginPath();
    ctx.arc(px, py, style.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.font = style.font;
    ctx.fillText(ann.label, px + 7, py - 7);
  }

  function drawHorizontalLineAnnotation(ctx, w, h, mapper, ann) {
    const style = getAnnStyle(ann.strength);
    const py = mapper.toCanvasY(ann.y);
    if (py < 0 || py > h) return;
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(0, py);
    ctx.lineTo(w, py);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(ann.label, 8, py - 6);
  }

  function drawVerticalLineAnnotation(ctx, w, h, mapper, ann) {
    const style = getAnnStyle(ann.strength);
    const px = mapper.toCanvasX(ann.x);
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

  function drawTextAnnotation(ctx, mapper, ann) {
    const style = getAnnStyle(ann.strength);
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(ann.label, mapper.toCanvasX(ann.x), mapper.toCanvasY(ann.y));
  }

  function drawSlopeTriangle(ctx, mapper, ann) {
    const style = getAnnStyle(ann.strength);
    const t = i18n[currentLang()];
    const { x0, y0, m } = ann;
    const x1 = x0 + 1;
    const y1 = y0 + m;
    const px0 = mapper.toCanvasX(x0);
    const py0 = mapper.toCanvasY(y0);
    const px1 = mapper.toCanvasX(x1);
    const py1 = mapper.toCanvasY(y1);
    const pyBase = mapper.toCanvasY(y0);

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

  function drawNoRootsAnnotation(ctx, w, h, ann, mapper) {
    const style = getAnnStyle(ann.strength);
    const msg = currentLang() === "zh" ? "无实数 x 截距（Δ < 0）" : "No real x-intercepts (Δ < 0)";
    const y =
      mapper.showsXAxis && mapper.mode === "bounds"
        ? mapper.toCanvasY(0) + 20
        : mapper.mode === "legacy"
          ? h / 2 + 20
          : h - 28;
    ctx.fillStyle = style.color;
    ctx.font = style.font;
    ctx.fillText(msg, w / 2 - 95, y);
  }

  function drawInterceptLineAnnotation(ctx, mapper, ann) {
    const style = getAnnStyle(ann.strength);
    ctx.strokeStyle = style.color;
    ctx.lineWidth = style.lineWidth;
    ctx.setLineDash(style.dash);
    ctx.beginPath();
    ctx.moveTo(mapper.toCanvasX(ann.xInt), mapper.toCanvasY(0));
    ctx.lineTo(mapper.toCanvasX(0), mapper.toCanvasY(ann.yInt));
    ctx.stroke();
    ctx.setLineDash([]);
  }

  function renderAnnotations(ctx, w, h, annotations, mapper) {
    annotations.forEach((ann) => {
      if (ann.type === "point") drawPointAnnotation(ctx, mapper, ann);
      else if (ann.type === "verticalLine") drawVerticalLineAnnotation(ctx, w, h, mapper, ann);
      else if (ann.type === "horizontalLine") drawHorizontalLineAnnotation(ctx, w, h, mapper, ann);
      else if (ann.type === "text") drawTextAnnotation(ctx, mapper, ann);
      else if (ann.type === "slopeTriangle") drawSlopeTriangle(ctx, mapper, ann);
      else if (ann.type === "noRoots") drawNoRootsAnnotation(ctx, w, h, ann, mapper);
      else if (ann.type === "interceptLine") drawInterceptLineAnnotation(ctx, mapper, ann);
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

  function yInView(y, mapper) {
    if (mapper.mode !== "bounds") return Number.isFinite(y);
    const margin = (mapper.yMax - mapper.yMin) * 0.35;
    return y >= mapper.yMin - margin && y <= mapper.yMax + margin;
  }

  function drawSampledCurve(ctx, adapter, params, viewport, mapper) {
    const { xMin, xMax, sampleStep } = viewport;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    let first = true;
    for (let x = xMin; x <= xMax; x += sampleStep) {
      const y = adapter.evaluate(x, params);
      if (y === null || !Number.isFinite(y) || !yInView(y, mapper)) {
        first = true;
        continue;
      }
      const px = mapper.toCanvasX(x);
      const py = mapper.toCanvasY(y);
      if (first) {
        ctx.moveTo(px, py);
        first = false;
      } else {
        ctx.lineTo(px, py);
      }
    }
    ctx.stroke();
  }

  function drawVerticalGraph(ctx, w, h, viewport, mapper) {
    const xConst = viewport.xConst;
    const px = mapper.toCanvasX(xConst);
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px, h);
    ctx.stroke();
  }

  function drawLinearSegment(ctx, adapter, params, viewport, mapper) {
    const lf = adapter.getFeatures(params);
    const x1 = viewport.xMin;
    const y1 = lf.m * x1 + lf.b;
    const x2 = viewport.xMax;
    const y2 = lf.m * x2 + lf.b;
    ctx.strokeStyle = "#111827";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(mapper.toCanvasX(x1), mapper.toCanvasY(y1));
    ctx.lineTo(mapper.toCanvasX(x2), mapper.toCanvasY(y2));
    ctx.stroke();
  }

  function drawMainGraph() {
    const canvas = document.getElementById("graphCanvas");
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;

    const adapter = getActiveAdapter();
    if (!adapter) {
      drawWorldAxes(ctx, w, h, createCoordMapper({ pixelScale: 22 }, w, h));
      return;
    }

    const t = i18n[currentLang()];
    const params = graphState.paramsByAdapter?.[adapter.id];
    if (!params) {
      drawWorldAxes(ctx, w, h, createCoordMapper({ pixelScale: 22 }, w, h));
      return;
    }
    const features = adapter.getFeatures(params, currentLang(), i18n);

    if (!adapter.isValidParams(features)) {
      drawWorldAxes(ctx, w, h, createCoordMapper({ pixelScale: 22 }, w, h));
      ctx.fillStyle = "#6b7280";
      ctx.font = "13px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(adapter.getCanvasError(features, t), w / 2, h / 2);
      ctx.textAlign = "left";
      return;
    }

    const viewport = adapter.getViewport(params, features, { auto: true });
    const mapper = createCoordMapper(viewport, w, h);
    drawWorldAxes(ctx, w, h, mapper);

    if (viewport.kind === "vertical" && features.isVertical) {
      drawVerticalGraph(ctx, w, h, viewport, mapper);
    } else if (viewport.kind === "segment" && !features.isVertical) {
      drawLinearSegment(ctx, adapter, params, viewport, mapper);
    } else {
      drawSampledCurve(ctx, adapter, params, viewport, mapper);
    }

    const annotations = getDirectGraphAnnotations(getLastSelected());
    renderAnnotations(ctx, w, h, annotations, mapper);
  }

  return {
    updateGraphLabel,
    drawMainGraph,
    updateGraphAnnotationText,
    getActiveQuadraticFormId,
    getActiveLinearFormId
  };
}
