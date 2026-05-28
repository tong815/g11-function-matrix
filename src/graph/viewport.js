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

function allPointsInBounds(bounds, points) {
  return points.every(
    (p) =>
      p.x >= bounds.xMin &&
      p.x <= bounds.xMax &&
      p.y >= bounds.yMin &&
      p.y <= bounds.yMax
  );
}

function boundsForCenter(cx, cy, halfX, halfY) {
  return {
    xMin: cx - halfX,
    xMax: cx + halfX,
    yMin: cy - halfY,
    yMax: cy + halfY
  };
}

/** Nudge fixed-span viewport toward axes without losing required points. */
function tryIncludeAxes(bounds, requiredPoints, halfX, halfY) {
  if (!requiredPoints.length) return bounds;

  const tryCenter = (ncx, ncy) => {
    const b = boundsForCenter(ncx, ncy, halfX, halfY);
    return allPointsInBounds(b, requiredPoints) ? b : null;
  };

  let cx = (bounds.xMin + bounds.xMax) / 2;
  let cy = (bounds.yMin + bounds.yMax) / 2;
  let next = bounds;

  if (bounds.xMin > 0) {
    const b = tryCenter(Math.min(cx, halfX), cy);
    if (b) next = b;
  } else if (bounds.xMax < 0) {
    const b = tryCenter(Math.max(cx, -halfX), cy);
    if (b) next = b;
  }

  cx = (next.xMin + next.xMax) / 2;
  cy = (next.yMin + next.yMax) / 2;

  if (next.yMin > 0) {
    const b = tryCenter(cx, Math.min(cy, halfY));
    if (b) next = b;
  } else if (next.yMax < 0) {
    const b = tryCenter(cx, Math.max(cy, -halfY));
    if (b) next = b;
  }

  return next;
}

/**
 * Fixed-scale viewport: pan only (no zoom). Prefer origin-centered when possible.
 */
export function buildPannedViewport({
  centerCandidate = { x: 0, y: 0 },
  requiredPoints = [],
  baseXSpan = 20,
  baseYSpan = 20,
  preferredOriginCentered = true
}) {
  const points = requiredPoints.filter(finitePoint);
  const halfX = baseXSpan / 2;
  const halfY = baseYSpan / 2;

  if (preferredOriginCentered) {
    const originBounds = boundsForCenter(0, 0, halfX, halfY);
    if (!points.length || allPointsInBounds(originBounds, points)) {
      return { ...originBounds, originCentered: true, panOnly: true };
    }
  }

  let cx = centerCandidate.x ?? 0;
  let cy = centerCandidate.y ?? 0;
  if (points.length) {
    cx = points.reduce((s, p) => s + p.x, 0) / points.length;
    cy = points.reduce((s, p) => s + p.y, 0) / points.length;
  }

  let bounds = boundsForCenter(cx, cy, halfX, halfY);

  if (points.length && !allPointsInBounds(bounds, points)) {
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
    cx = (xMin + xMax) / 2;
    cy = (yMin + yMax) / 2;
    bounds = boundsForCenter(cx, cy, halfX, halfY);
  }

  bounds = tryIncludeAxes(bounds, points, halfX, halfY);

  return { ...bounds, originCentered: false, panOnly: true };
}

/**
 * Exponential: try pan-only first; scale only if required points do not fit.
 */
export function buildExponentialViewport({
  requiredPoints = [],
  baseXSpan = 20,
  baseYSpan = 20,
  paddingRatio = 0.18,
  maxXSpan = 48,
  maxYSpan = 120,
  minXSpan = 12,
  minYSpan = 12
}) {
  const points = requiredPoints.filter(finitePoint);
  const panned = buildPannedViewport({
    requiredPoints: points,
    baseXSpan,
    baseYSpan,
    preferredOriginCentered: true
  });
  if (!points.length || allPointsInBounds(panned, points)) {
    return { ...panned, panOnly: true };
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

  let xSpan = Math.max(xMax - xMin, minXSpan);
  let ySpan = Math.max(yMax - yMin, minYSpan);
  xSpan = Math.min(Math.max(xSpan * (1 + paddingRatio * 2), minXSpan), maxXSpan);
  ySpan = Math.min(Math.max(ySpan * (1 + paddingRatio * 2), minYSpan), maxYSpan);

  let cx = (xMin + xMax) / 2;
  let cy = (yMin + yMax) / 2;
  const halfX = xSpan / 2;
  const halfY = ySpan / 2;

  const originBounds = boundsForCenter(0, 0, halfX, halfY);
  if (allPointsInBounds(originBounds, points)) {
    return { ...originBounds, originCentered: true, panOnly: false };
  }

  let bounds = boundsForCenter(cx, cy, halfX, halfY);
  bounds = tryIncludeAxes(bounds, points, halfX, halfY);

  return { ...bounds, originCentered: false, panOnly: false };
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

export function viewportWithSampleStep(bounds, fallbackStep = 0.05) {
  return {
    ...bounds,
    sampleStep: adaptiveSampleStep(bounds.xMin, bounds.xMax, fallbackStep)
  };
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
