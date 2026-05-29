const LABEL_HEIGHT = 13;
const PAD = 5;

function estimateTextWidth(ctx, text, font) {
  ctx.font = font;
  return ctx.measureText(text).width;
}

function reserveAxisLabelZones(mapper, w, h) {
  const zones = [];
  if (mapper.showsYAxis) {
    const x0 = mapper.toCanvasX(0);
    if (x0 >= 0 && x0 <= w) zones.push({ x: x0 - 2, y: 0, w: 34, h: 24 });
  }
  if (mapper.showsXAxis) {
    const y0 = mapper.toCanvasY(0);
    if (y0 >= 0 && y0 <= h) zones.push({ x: w - 30, y: y0 - 20, w: 30, h: 20 });
  }
  if (mapper.showsOrigin) {
    const { ox, oy } = mapper.originCanvas;
    zones.push({ x: ox - 2, y: oy - 22, w: 28, h: 22 });
  }
  return zones;
}

function rectsOverlap(a, b, gap = PAD) {
  return !(
    a.x + a.w + gap <= b.x ||
    b.x + b.w + gap <= a.x ||
    a.y + a.h + gap <= b.y ||
    b.y + b.h + gap <= a.y
  );
}

function fits(rect, placed, zones, w, h) {
  if (rect.x < 4 || rect.y < 4 || rect.x + rect.w > w - 4 || rect.y + rect.h > h - 4) return false;
  if (zones.some((z) => rectsOverlap(rect, z))) return false;
  return !placed.some((p) => rectsOverlap(rect, p));
}

/** @returns {{ x: number, y: number }} canvas baseline for fillText */
function placeLabel(initialX, initialY, width, placed, zones, w, h) {
  const candidates = [
    [0, 0],
    [0, -16],
    [0, 16],
    [10, 0],
    [-10, 0],
    [10, -16],
    [-10, -16],
    [10, 16],
    [-10, 16],
    [20, 0],
    [-20, 0],
    [0, -28],
    [0, 28],
    [24, -12],
    [-24, -12],
    [24, 12],
    [-24, 12]
  ];
  for (const [dx, dy] of candidates) {
    const x = initialX + dx;
    const y = initialY + dy;
    const rect = { x, y: y - LABEL_HEIGHT, w: width, h: LABEL_HEIGHT };
    if (fits(rect, placed, zones, w, h)) {
      placed.push(rect);
      return { x, y };
    }
  }
  const rect = { x: initialX, y: initialY - LABEL_HEIGHT, w: width, h: LABEL_HEIGHT };
  placed.push(rect);
  return { x: initialX, y: initialY };
}

function yAxisCanvasX(mapper) {
  return mapper.showsYAxis ? mapper.toCanvasX(0) : null;
}

function xAxisCanvasY(mapper) {
  return mapper.showsXAxis ? mapper.toCanvasY(0) : null;
}

function initialPointLabel(ann, px, py, mapper, w, h) {
  const yAxisX = yAxisCanvasX(mapper);
  const xAxisY = xAxisCanvasY(mapper);
  const nearYAxis = yAxisX != null && Math.abs(px - yAxisX) < 22;
  const onXAxis = xAxisY != null && Math.abs(py - xAxisY) < 10;

  if (ann.target === "yint" || (ann.x === 0 && ann.target !== "knownPoint")) {
    return { x: px + (nearYAxis ? 14 : 8), y: py + (py < h * 0.5 ? 16 : -8) };
  }
  if (ann.target === "xint" || onXAxis) {
    const above = xAxisY != null && py > xAxisY;
    const dx = ann.label?.includes("r₂") || ann.label?.includes("r2") ? 6 : ann.label?.includes("r₁") || ann.label?.includes("r1") ? -6 : 0;
    return { x: px + dx - 8, y: py + (above ? -10 : 18) };
  }
  if (ann.target === "vertex" || ann.target === "transform" || ann.target === "extreme") {
    const awayFromAxis = yAxisX != null && px <= yAxisX + 8 ? 16 : 8;
    return { x: px + awayFromAxis, y: py - 10 };
  }
  if (ann.target === "knownPoint") {
    return { x: px + 8, y: py - 10 };
  }
  return { x: px + 8, y: py - 8 };
}

function initialVerticalLineLabel(px, mapper, w) {
  const yAxisX = yAxisCanvasX(mapper);
  const nearYAxis = yAxisX != null && Math.abs(px - yAxisX) < 28;
  return { x: nearYAxis ? px + 14 : px + 6, y: 26 };
}

function initialHorizontalLineLabel(py, h) {
  return { x: 10, y: py < h * 0.45 ? py + 18 : py - 8 };
}

function initialSlopeTriangleLabels(px0, px1, pyBase, py1) {
  return {
    run: { x: (px0 + px1) / 2 - 10, y: pyBase + 18 },
    rise: { x: px1 + 8, y: (pyBase + py1) / 2 + 4 }
  };
}

/**
 * Assign non-overlapping canvas label positions for graph annotations.
 */
export function layoutGraphAnnotations(ctx, annotations, mapper, w, h, getAnnStyle) {
  const zones = reserveAxisLabelZones(mapper, w, h);
  const placed = [];

  return annotations.map((ann) => {
    const style = getAnnStyle(ann.strength);
    const font = style.font;

    if (ann.type === "point") {
      const px = mapper.toCanvasX(ann.x);
      const py = mapper.toCanvasY(ann.y);
      const init = initialPointLabel(ann, px, py, mapper, w, h);
      const width = estimateTextWidth(ctx, ann.label, font);
      const pos = placeLabel(init.x, init.y, width, placed, zones, w, h);
      return { ...ann, labelPos: pos, _font: font };
    }

    if (ann.type === "verticalLine") {
      const px = mapper.toCanvasX(ann.x);
      const init = initialVerticalLineLabel(px, mapper, w);
      const width = estimateTextWidth(ctx, ann.label, font);
      const pos = placeLabel(init.x, init.y, width, placed, zones, w, h);
      return { ...ann, labelPos: pos, _font: font };
    }

    if (ann.type === "horizontalLine") {
      const py = mapper.toCanvasY(ann.y);
      const init = initialHorizontalLineLabel(py, h);
      const width = estimateTextWidth(ctx, ann.label, font);
      const pos = placeLabel(init.x, init.y, width, placed, zones, w, h);
      return { ...ann, labelPos: pos, _font: font };
    }

    if (ann.type === "text") {
      const init = { x: mapper.toCanvasX(ann.x), y: mapper.toCanvasY(ann.y) };
      const width = estimateTextWidth(ctx, ann.label, font);
      const pos = placeLabel(init.x, init.y, width, placed, zones, w, h);
      return { ...ann, labelPos: pos, _font: font };
    }

    if (ann.type === "slopeTriangle") {
      const { x0, y0, m } = ann;
      const px0 = mapper.toCanvasX(x0);
      const py0 = mapper.toCanvasY(y0);
      const px1 = mapper.toCanvasX(x0 + 1);
      const py1 = mapper.toCanvasY(y0 + m);
      const pyBase = mapper.toCanvasY(y0);
      const init = initialSlopeTriangleLabels(px0, px1, pyBase, py1);
      const runWidth = estimateTextWidth(ctx, ann._runLabel ?? "run", font);
      const riseWidth = estimateTextWidth(ctx, ann._riseLabel ?? "rise", font);
      const runPos = placeLabel(init.run.x, init.run.y, runWidth, placed, zones, w, h);
      const risePos = placeLabel(init.rise.x, init.rise.y, riseWidth, placed, zones, w, h);
      return { ...ann, runLabelPos: runPos, riseLabelPos: risePos, _font: font };
    }

    if (ann.type === "noRoots") {
      const width = estimateTextWidth(ctx, ann._msg ?? "", font);
      const init = { x: w / 2 - width / 2, y: h - 20 };
      const pos = placeLabel(init.x, init.y, width, placed, zones, w, h);
      return { ...ann, labelPos: pos, _font: font };
    }

    return { ...ann, _font: font };
  });
}
