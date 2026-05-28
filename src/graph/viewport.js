const MAX_ABS = 1e4;

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function finitePoint(p) {
  return (
    p &&
    Number.isFinite(p.x) &&
    Number.isFinite(p.y) &&
    Math.abs(p.x) <= MAX_ABS &&
    Math.abs(p.y) <= MAX_ABS
  );
}

/**
 * Build world bounds from focus points with optional origin inclusion.
 */
export function buildAutoViewport({
  focusPoints = [],
  preferredOrigin = { x: 0, y: 0 },
  minXSpan = 8,
  minYSpan = 8,
  paddingRatio = 0.15,
  originNearFactor = 1.35
}) {
  const points = focusPoints.filter(finitePoint);

  if (!points.length) {
    const hx = minXSpan / 2;
    const hy = minYSpan / 2;
    return { xMin: -hx, xMax: hx, yMin: -hy, yMax: hy };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    xMin = Math.min(xMin, p.x);
    xMax = Math.max(xMax, p.x);
    yMin = Math.min(yMin, p.y);
    yMax = Math.max(yMax, p.y);
  }

  let xSpan = Math.max(xMax - xMin, minXSpan * 0.25);
  let ySpan = Math.max(yMax - yMin, minYSpan * 0.25);
  xSpan = Math.max(xSpan, minXSpan);
  ySpan = Math.max(ySpan, minYSpan);

  const padX = xSpan * paddingRatio;
  const padY = ySpan * paddingRatio;
  xMin -= padX;
  xMax += padX;
  yMin -= padY;
  yMax += padY;

  const ox = preferredOrigin.x ?? 0;
  const oy = preferredOrigin.y ?? 0;
  const cx = (xMin + xMax) / 2;
  const cy = (yMin + yMax) / 2;
  const focusRadius = Math.max(xSpan, ySpan) / 2;
  const distOrigin = Math.hypot(cx - ox, cy - oy);
  const includeOrigin = distOrigin <= focusRadius * originNearFactor;

  if (includeOrigin) {
    xMin = Math.min(xMin, ox);
    xMax = Math.max(xMax, ox);
    yMin = Math.min(yMin, oy);
    yMax = Math.max(yMax, oy);
  } else {
    const axisMargin = focusRadius * 0.45;
    if (ox >= xMin - axisMargin && ox <= xMax + axisMargin) {
      xMin = Math.min(xMin, ox);
      xMax = Math.max(xMax, ox);
    }
    if (oy >= yMin - axisMargin && oy <= yMax + axisMargin) {
      yMin = Math.min(yMin, oy);
      yMax = Math.max(yMax, oy);
    }
  }

  const expandToMinSpan = (min, max, minSpan) => {
    const span = max - min;
    if (span >= minSpan) return [min, max];
    const mid = (min + max) / 2;
    return [mid - minSpan / 2, mid + minSpan / 2];
  };

  [xMin, xMax] = expandToMinSpan(xMin, xMax, minXSpan);
  [yMin, yMax] = expandToMinSpan(yMin, yMax, minYSpan);

  xMin = clamp(xMin, -MAX_ABS, MAX_ABS);
  xMax = clamp(xMax, -MAX_ABS, MAX_ABS);
  yMin = clamp(yMin, -MAX_ABS, MAX_ABS);
  yMax = clamp(yMax, -MAX_ABS, MAX_ABS);

  if (xMax <= xMin) {
    xMin -= minXSpan / 2;
    xMax += minXSpan / 2;
  }
  if (yMax <= yMin) {
    yMin -= minYSpan / 2;
    yMax += minYSpan / 2;
  }

  return { xMin, xMax, yMin, yMax };
}

export function isBoundsViewport(viewport) {
  return (
    viewport &&
    viewport.yMin !== undefined &&
    viewport.yMax !== undefined &&
    !viewport.pixelScale &&
    viewport.kind !== "legacy"
  );
}

export function adaptiveSampleStep(xMin, xMax, fallback = 0.05) {
  const span = xMax - xMin;
  if (!Number.isFinite(span) || span <= 0) return fallback;
  return clamp(span / 400, 0.02, 0.25);
}

/**
 * @param {object} viewport - adapter viewport (bounds or legacy pixelScale)
 * @param {number} w canvas width
 * @param {number} h canvas height
 */
export function createCoordMapper(viewport, w, h) {
  if (isBoundsViewport(viewport)) {
    const { xMin, xMax, yMin, yMax } = viewport;
    const xSpan = xMax - xMin;
    const ySpan = yMax - yMin;
    const toCanvasX = (x) => ((x - xMin) / xSpan) * w;
    const toCanvasY = (y) => (1 - (y - yMin) / ySpan) * h;
    const showsYAxis = xMin <= 0 && 0 <= xMax;
    const showsXAxis = yMin <= 0 && 0 <= yMax;
    const ox = toCanvasX(0);
    const oy = toCanvasY(0);
    const showsOrigin =
      showsXAxis &&
      showsYAxis &&
      ox >= 10 &&
      ox <= w - 10 &&
      oy >= 10 &&
      oy <= h - 10;
    return {
      mode: "bounds",
      xMin,
      xMax,
      yMin,
      yMax,
      toCanvasX,
      toCanvasY,
      showsXAxis,
      showsYAxis,
      showsOrigin,
      originCanvas: { ox, oy }
    };
  }

  const scale = viewport?.pixelScale ?? 22;
  const toCanvasX = (x) => w / 2 + x * scale;
  const toCanvasY = (y) => h / 2 - y * scale;
  return {
    mode: "legacy",
    scale,
    xMin: viewport?.xMin ?? -10,
    xMax: viewport?.xMax ?? 10,
    toCanvasX,
    toCanvasY,
    showsXAxis: true,
    showsYAxis: true,
    showsOrigin: true,
    originCanvas: { ox: w / 2, oy: h / 2 }
  };
}

export function buildViewportFromFocus(focusPoints, options = {}) {
  const bounds = buildAutoViewport({
    focusPoints,
    preferredOrigin: { x: 0, y: 0 },
    minXSpan: options.minXSpan ?? 8,
    minYSpan: options.minYSpan ?? 8,
    paddingRatio: options.paddingRatio ?? 0.15,
    originNearFactor: options.originNearFactor ?? 1.35
  });
  return {
    ...bounds,
    sampleStep: adaptiveSampleStep(bounds.xMin, bounds.xMax, options.sampleStep ?? 0.05)
  };
}
