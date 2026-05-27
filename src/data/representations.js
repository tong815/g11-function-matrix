/**
 * Build representation list from a matrix definition (forms + info keys).
 * @param {{ forms: Array<{ id: string, equation: string, representationType: string }>, info: string[] }} matrix
 */
export function buildRepresentations(matrix) {
  return matrix.forms.map((form) => ({
    id: form.id,
    formula: form.equation,
    type: form.representationType,
    readableInfo: matrix.info
  }));
}
