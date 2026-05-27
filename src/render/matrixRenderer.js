export function readableLevel(level, i18n, currentLang) {
  const t = i18n[currentLang];
  if (level === "direct") return t.levelDirect;
  if (level === "derivable") return t.levelDerive;
  return t.levelWeak;
}

export function statusPill(level, i18n, currentLang) {
  const label = readableLevel(level, i18n, currentLang);
  const cls = level === "direct" ? "status-direct" : level === "derivable" ? "status-derive" : "status-weak";
  return "<span class=\"status-pill " + cls + "\"><span class=\"status-dot\"></span>" + label + "</span>";
}

export function getDetail(matrixKey, formId, infoKey, detailLibrary, currentLang) {
  const key = matrixKey + "|" + formId + "|" + infoKey;
  const detail = detailLibrary[key];
  if (detail) return detail[currentLang];
  return currentLang === "zh"
    ? { why: "未找到对应细节。", steps: ["请检查 detailLibrary key"], example: "N/A", mistake: "N/A" }
    : { why: "Detail not found.", steps: ["Check detailLibrary key"], example: "N/A", mistake: "N/A" };
}

export function renderMatrix({ targetId, matrixData, i18n, currentLang, LevelClass, statusPill }) {
  const mount = document.getElementById(targetId);
  const t = i18n[currentLang];
  const legacyFormLabels =
    matrixData.key === "quadratic" ? t.qForms : matrixData.key === "linear" ? t.lForms : t.eForms || [];
  const legacyInfoLabels =
    matrixData.key === "quadratic" ? t.qInfo : matrixData.key === "linear" ? t.lInfo : t.eInfo || [];
  let html = "<table><thead><tr><th>" + t.tableInfo + "</th>";
  matrixData.forms.forEach((f, idx) => {
    const formTitle = f.labelKey ? t[f.labelKey] : legacyFormLabels[idx];
    html += "<th>" + formTitle + "<br><span style='color:#6b7280;font-weight:400'>" + f.equation + "</span></th>";
  });
  html += "</tr></thead><tbody>";
  matrixData.info.forEach((infoKey, idx) => {
    html += "<tr><td class='label'>" + legacyInfoLabels[idx] + "</td>";
    matrixData.forms.forEach(f => {
      const level = matrixData.cells[infoKey][f.id];
      html += "<td class='clickable " + LevelClass[level] + "' " +
        "data-matrix='" + matrixData.key + "' data-form='" + f.id + "' data-info='" + infoKey + "'>" +
        statusPill(level) + "</td>";
    });
    html += "</tr>";
  });
  html += "</tbody></table>";
  html += "<div class='legend'>" +
    "<span><i class='dot' style='background:var(--good)'></i>" + t.legendDirect + "</span>" +
    "<span><i class='dot' style='background:var(--derive)'></i>" + t.legendDerive + "</span>" +
    "<span><i class='dot' style='background:var(--weak)'></i>" + t.legendWeak + "</span>" +
    "</div>";
  mount.innerHTML = "<div class='matrix-scroll'>" + html + "</div>";
}
