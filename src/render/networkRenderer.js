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

export function renderNetwork({ mountId, i18n, currentLang, onRuleClick }) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  const isZH = currentLang === "zh";
  const html = `
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
  mount.innerHTML = html;
  mount.querySelectorAll(".edge-tag, .edge-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      onRuleClick(btn.dataset.edge);
    });
  });
}
