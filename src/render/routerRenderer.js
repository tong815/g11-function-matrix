export function renderRouterTable({ title, rows, i18n, currentLang }) {
  const t = i18n[currentLang];
  const isZH = currentLang === "zh";
  return `
    <div class="router-table-wrap">
      <div class="router-table-title">${title}</div>
      <table class="router-table">
        <thead><tr><th>${t.routerColProblem}</th><th>${t.routerColForm}</th></tr></thead>
        <tbody>
          ${rows.map(row => `
            <tr>
              <td>${isZH ? row.problemZH : row.problemEN}</td>
              <td>${isZH ? row.formZH : row.formEN}</td>
            </tr>
          `).join("")}
        </tbody>
      </table>
    </div>
  `;
}

export function renderProblemRouter({ mountId, i18n, currentLang, problemRouterData, topic }) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  const rows = problemRouterData[topic.routerKey] || [];
  const title = topic.id === "quadratic" ? t.formulaGroupQuadratic : t.formulaGroupLinear;
  mount.innerHTML = `<div class="router-tables">${renderRouterTable({ title, rows, i18n, currentLang })}</div>`;
}
