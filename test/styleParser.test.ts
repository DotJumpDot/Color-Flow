import * as assert from "assert";
import {
  parseStyleString,
  extractColorProperties,
  isColorProperty,
  getStyleProperties,
} from "../src/styleParser";

suite("StyleParser Tests", () => {
  test("parseStyleString should parse simple style", () => {
    const result = parseStyleString("color: red; background-color: blue;");
    assert.deepStrictEqual(result, { color: "red", "background-color": "blue" });
  });

  test("parseStyleString should handle empty style", () => {
    const result = parseStyleString("");
    assert.deepStrictEqual(result, {});
  });

  test("parseStyleString should handle whitespace", () => {
    const result = parseStyleString("  color  :  red  ;  ");
    assert.deepStrictEqual(result, { color: "red" });
  });

  test("parseStyleString should handle camelCase properties", () => {
    const result = parseStyleString("backgroundColor: blue; fontSize: 16px;");
    assert.deepStrictEqual(result, { backgroundColor: "blue", fontSize: "16px" });
  });

  test("parseStyleString should handle multiple declarations", () => {
    const result = parseStyleString("color: red; background: blue; margin: 10px; padding: 5px;");
    assert.deepStrictEqual(result, {
      color: "red",
      background: "blue",
      margin: "10px",
      padding: "5px",
    });
  });

  test("parseStyleString should ignore empty declarations", () => {
    const result = parseStyleString("color: red;; background: blue;");
    assert.deepStrictEqual(result, { color: "red", background: "blue" });
  });

  test("extractColorProperties should extract color", () => {
    const styles = { color: "red", fontSize: "16px" };
    const result = extractColorProperties(styles);
    assert.deepStrictEqual(result, { color: "red" });
  });

  test("extractColorProperties should extract background-color", () => {
    const styles = { "background-color": "blue", fontSize: "16px" };
    const result = extractColorProperties(styles);
    assert.deepStrictEqual(result, { backgroundColor: "blue" });
  });

  test("extractColorProperties should extract backgroundColor", () => {
    const styles = { backgroundColor: "green", fontSize: "16px" };
    const result = extractColorProperties(styles);
    assert.deepStrictEqual(result, { backgroundColor: "green" });
  });

  test("extractColorProperties should extract both colors", () => {
    const styles = { color: "red", "background-color": "blue" };
    const result = extractColorProperties(styles);
    assert.deepStrictEqual(result, { color: "red", backgroundColor: "blue" });
  });

  test("extractColorProperties should return empty object for no colors", () => {
    const styles = { fontSize: "16px", margin: "10px" };
    const result = extractColorProperties(styles);
    assert.deepStrictEqual(result, {});
  });

  test("isColorProperty should identify color properties", () => {
    assert.strictEqual(isColorProperty("color"), true);
    assert.strictEqual(isColorProperty("background-color"), true);
    assert.strictEqual(isColorProperty("backgroundColor"), true);
    assert.strictEqual(isColorProperty("fontSize"), false);
    assert.strictEqual(isColorProperty("margin"), false);
  });

  test("getStyleProperties should return array of properties", () => {
    const styles = "color: red; background: blue;";
    const result = getStyleProperties(styles);
    assert.strictEqual(result.length, 2);
    assert.deepStrictEqual(result[0], { property: "color", value: "red" });
    assert.deepStrictEqual(result[1], { property: "background", value: "blue" });
  });
});
