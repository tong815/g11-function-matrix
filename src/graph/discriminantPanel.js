/** Quadratic-only discriminant mini-graph canvases (Δ > 0 / = 0 / < 0). */

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

export function drawDiscCanvas(id, mode) {
  const canvas = document.getElementById(id);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  drawAxes(ctx, w, h);
  ctx.strokeStyle = "#111827";
  ctx.lineWidth = 2;
  ctx.beginPath();
  let first = true;
  for (let x = -4; x <= 4; x += 0.03) {
    let y;
    if (mode === "pos") y = (x - 1) * (x + 1) - 1;
    else if (mode === "zero") y = (x - 0) * (x - 0);
    else y = (x - 0) * (x - 0) + 1;
    const px = w / 2 + x * 18;
    const py = h / 2 - y * 18;
    if (first) {
      ctx.moveTo(px, py);
      first = false;
    } else {
      ctx.lineTo(px, py);
    }
  }
  ctx.stroke();
}

export function renderDiscriminantPanels() {
  drawDiscCanvas("discPos", "pos");
  drawDiscCanvas("discZero", "zero");
  drawDiscCanvas("discNeg", "neg");
}
