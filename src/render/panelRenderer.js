const topicLabelKeys = {
  quadratic: { object: "graphQuadratic", forms: "qForms", info: "qInfo" },
  linear: { object: "graphLinear", forms: "lForms", info: "lInfo" },
  exponential: { object: "graphExponential", forms: "eForms", info: "eInfo" }
};

export function buildInfoPanel({ matrixKey, formId, infoKey, i18n, currentLang, matrix, topicId, readableLevel, getDetail }) {
  const t = i18n[currentLang];
  const key = matrix?.key || matrixKey;
  const topicKey = topicId || key;
  const labels = topicLabelKeys[topicKey] || topicLabelKeys[key];
  const level = matrix.cells[infoKey][formId];
  const detail = getDetail(key, formId, infoKey);
  const formLabels = labels.forms ? t[labels.forms] : [];
  const infoLabels = labels.info ? t[labels.info] : [];
  const form = matrix.forms.find((f) => f.id === formId);
  const formIndex = matrix.forms.findIndex((f) => f.id === formId);
  const infoIndex = matrix.info.findIndex((i) => i === infoKey);
  const formLabel = form?.labelKey ? t[form.labelKey] : formLabels[formIndex];
  const infoLabel = infoLabels[infoIndex];
  const lines = [
    t.matrixLabel + ": " + t[labels.object],
    t.formLabel + ": " + formLabel,
    t.infoLabel + ": " + infoLabel,
    t.readLabel + ": " + readableLevel(level),
    "",
    t.whyLabel, detail.why, "", t.stepsLabel, detail.steps.map((s, i) => (i + 1) + ". " + s).join("\n"),
    "", t.exampleLabel, detail.example, "", t.mistakeLabel, detail.mistake
  ];
  return "<pre>" + lines.join("\n") + "</pre>";
}
