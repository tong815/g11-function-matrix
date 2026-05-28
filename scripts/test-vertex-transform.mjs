import { describeVertexTransformations, formatVertexTransformExample } from "../src/math/vertexTransformations.js";

function assertDeepEqual(actual, expected, name) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(`${name}\n  expected: ${e}\n  actual:   ${a}`);
  }
  console.log(`✓ ${name}`);
}

assertDeepEqual(
  describeVertexTransformations(-2, -3, 4, "en"),
  ["left 3", "reflect over x-axis", "vertical stretch 2", "up 4"],
  "a=-2, h=-3, k=4 EN order"
);

assertDeepEqual(
  describeVertexTransformations(-2, -3, 4, "zh"),
  ["左移3", "关于x轴翻折", "纵向拉伸2倍", "上移4"],
  "a=-2, h=-3, k=4 ZH order"
);

const exampleEN = formatVertexTransformExample(-2, -3, 4, "en");
if (!exampleEN.includes("left 3, reflect over x-axis, vertical stretch 2, up 4")) {
  throw new Error(`example EN mismatch: ${exampleEN}`);
}
console.log("✓ formatVertexTransformExample EN");

assertDeepEqual(
  describeVertexTransformations(1, 3, -4, "en"),
  ["right 3", "down 4"],
  "a=1: horizontal then vertical only"
);

assertDeepEqual(
  describeVertexTransformations(0.5, 2, -1, "en"),
  ["right 2", "vertical compression 0.5", "down 1"],
  "a=0.5: compression before vertical shift"
);

console.log("\nAll vertex-transform tests passed.");
