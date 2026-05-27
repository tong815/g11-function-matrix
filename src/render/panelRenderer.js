export function buildInfoPanel({ matrixKey, formId, infoKey, i18n, currentLang, quadraticMatrix, linearMatrix, readableLevel, getDetail }) {
  const t = i18n[currentLang];
  const matrix = matrixKey === "quadratic" ? quadraticMatrix : linearMatrix;
  const level = matrix.cells[infoKey][formId];
  const detail = getDetail(matrixKey, formId, infoKey);
  const formLabels = matrixKey === "quadratic" ? t.qForms : t.lForms;
  const infoLabels = matrixKey === "quadratic" ? t.qInfo : t.lInfo;
  const formIndex = matrix.forms.findIndex(f => f.id === formId);
  const infoIndex = matrix.info.findIndex(i => i === infoKey);
  const lines = [
    t.matrixLabel + ": " + (matrixKey === "quadratic" ? t.graphQuadratic : t.graphLinear),
    t.formLabel + ": " + formLabels[formIndex],
    t.infoLabel + ": " + infoLabels[infoIndex],
    t.readLabel + ": " + readableLevel(level),
    "",
    t.whyLabel, detail.why, "", t.stepsLabel, detail.steps.map((s, i) => (i + 1) + ". " + s).join("\n"),
    "", t.exampleLabel, detail.example, "", t.mistakeLabel, detail.mistake
  ];
  return "<pre>" + lines.join("\n") + "</pre>";
}
