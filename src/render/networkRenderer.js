export function renderFlowHtml({ ruleId, flowContent, currentLang }) {
  const data = flowContent[ruleId][currentLang];
  const suffix = currentLang === "zh" ? "：" : ":";
  let html = `<div class="flow-route">${data.route}</div>`;
  data.sections.forEach(section => {
    html += `<div class="flow-section"><span class="flow-heading">${section.heading}${suffix}</span>`;
    section.lines.forEach((line, index) => {
      const prefix = section.numbered ? `${index + 1}) ` : "";
      const monoClass = section.mono ? " mono" : "";
      html += `<span class="flow-line${monoClass}">${prefix}${line}</span>`;
    });
    html += "</div>";
  });
  return html;
}

function renderQuadraticNetwork({ t, isZH }) {
  return `
    <div class="transform-diagram">
      <div class="transform-path">
        <div class="node node-standard">${t.nodeStandard}</div>
        <button type="button" class="edge-tag" data-edge="std_to_fact">${isZH ? "因式分解" : "factoring"} →</button>
        <div class="node node-factored">${t.nodeFactored}</div>
        <button type="button" class="edge-tag" data-edge="fact_to_vertex">${isZH ? "中点法" : "midpoint"} →</button>
        <div class="node node-vertex">${t.nodeVertex}</div>
      </div>
      <div class="transform-path">
        <div class="node node-standard">${t.nodeStandard}</div>
        <button type="button" class="edge-tag" data-edge="std_to_vertex">${isZH ? "配方" : "complete sq."} →</button>
        <div class="node node-vertex">${t.nodeVertex}</div>
      </div>
      <div class="transform-path transform-path-reverse">
        <div class="node node-factored">${t.nodeFactored}</div>
        <button type="button" class="edge-tag" data-edge="fact_to_std">${isZH ? "展开" : "expand"} →</button>
        <div class="node node-standard">${t.nodeStandard}</div>
        <button type="button" class="edge-tag" data-edge="vertex_to_std">${isZH ? "展开" : "expand"} →</button>
        <div class="node node-vertex">${t.nodeVertex}</div>
        <button type="button" class="edge-tag" data-edge="vertex_to_fact">${isZH ? "解根" : "roots"} →</button>
        <div class="node node-factored">${t.nodeFactored}</div>
      </div>
    </div>
  `;
}

function renderLinearNetwork({ isZH }) {
  return `
    <div class="transform-diagram">
      <div class="transform-path">
        <div class="node node-standard">${isZH ? "斜截式" : "Slope-Intercept"}</div>
        <button type="button" class="edge-tag" data-edge="lin_slope_to_point">${isZH ? "已知点重写" : "point form"} →</button>
        <div class="node node-factored">${isZH ? "点斜式" : "Point-Slope"}</div>
      </div>
      <div class="transform-path">
        <div class="node node-factored">${isZH ? "点斜式" : "Point-Slope"}</div>
        <button type="button" class="edge-tag" data-edge="lin_point_to_standard">${isZH ? "移项整理" : "rearrange"} →</button>
        <div class="node node-vertex">${isZH ? "标准式" : "Standard"}</div>
      </div>
      <div class="transform-path transform-path-reverse">
        <div class="node node-vertex">${isZH ? "标准式" : "Standard"}</div>
        <button type="button" class="edge-tag" data-edge="lin_standard_to_slope">${isZH ? "化成 y=mx+b" : "solve for y"} →</button>
        <div class="node node-standard">${isZH ? "斜截式" : "Slope-Intercept"}</div>
      </div>
    </div>
  `;
}

export function renderNetwork({ mountId, i18n, currentLang, onRuleClick, topic }) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  const isZH = currentLang === "zh";
  const html = topic.id === "quadratic"
    ? renderQuadraticNetwork({ t, isZH })
    : renderLinearNetwork({ isZH });
  mount.innerHTML = html;
  mount.querySelectorAll(".edge-tag, .edge-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      onRuleClick(btn.dataset.edge);
    });
  });
}
