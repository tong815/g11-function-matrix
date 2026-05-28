import { buildFactoredExpression, formatFactor } from "../src/math/format.js";
import { buildFactoredText } from "../src/conversion/conversionMath.js";

function assertEqual(actual, expected, name) {
  if (actual !== expected) {
    throw new Error(`${name}\n  expected: ${expected}\n  actual:   ${actual}`);
  }
  console.log(`✓ ${name}`);
}

assertEqual(formatFactor(2), "(x - 2)", "formatFactor positive");
assertEqual(formatFactor(-2), "(x + 2)", "formatFactor negative");
assertEqual(formatFactor(0), "(x)", "formatFactor zero");

assertEqual(buildFactoredExpression(1, 2, 3), "(x - 2)(x - 3)", "roots 2, 3");
assertEqual(buildFactoredText(1, 2, 3), "y = (x - 2)(x - 3)", "buildFactoredText roots 2, 3");
assertEqual(buildFactoredText(1, 2, 3), "y = (x - 2)(x - 3)", "conversion buildFactoredText");

assertEqual(buildFactoredExpression(1, -2, 3), "(x + 2)(x - 3)", "roots -2, 3");
assertEqual(buildFactoredText(1, -2, 3), "y = (x + 2)(x - 3)", "buildFactoredText roots -2, 3");

assertEqual(buildFactoredExpression(-1, 1, -4), "-(x - 1)(x + 4)", "a=-1 roots 1, -4");
assertEqual(buildFactoredText(-1, 1, -4), "y = -(x - 1)(x + 4)", "buildFactoredText a=-1");

assertEqual(buildFactoredExpression(2, 5, 5), "2(x - 5)²", "double root with a=2");

console.log("\nAll factored-format tests passed.");
