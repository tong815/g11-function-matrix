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

export function renderProblemRouter({ mountId, i18n, currentLang, problemRouterData }) {
  const mount = document.getElementById(mountId);
  const t = i18n[currentLang];
  mount.innerHTML = `
    <div class="router-tables">
      ${renderRouterTable({ title: t.formulaGroupQuadratic, rows: problemRouterData.quadratic, i18n, currentLang })}
      ${renderRouterTable({ title: t.formulaGroupLinear, rows: problemRouterData.linear, i18n, currentLang })}
    </div>
  `;
}
