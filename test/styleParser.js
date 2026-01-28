"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyleProperties = exports.isColorProperty = exports.extractColorProperties = exports.parseStyleString = void 0;
function parseStyleString(styleString) {
    const styles = {};
    if (!styleString || styleString.trim() === "") {
        return styles;
    }
    const declarations = styleString.split(";");
    for (const declaration of declarations) {
        const colonIndex = declaration.indexOf(":");
        if (colonIndex === -1) {
            continue;
        }
        const property = declaration.substring(0, colonIndex).trim();
        const value = declaration.substring(colonIndex + 1).trim();
        if (property && value) {
            styles[property] = value;
        }
    }
    return styles;
}
exports.parseStyleString = parseStyleString;
function extractColorProperties(styles) {
    const result = {};
    if (styles.color) {
        result.color = styles.color;
    }
    if (styles["background-color"]) {
        result.backgroundColor = styles["background-color"];
    }
    if (styles.backgroundColor) {
        result.backgroundColor = styles.backgroundColor;
    }
    return result;
}
exports.extractColorProperties = extractColorProperties;
function isColorProperty(property) {
    return ["color", "background-color", "backgroundColor"].includes(property);
}
exports.isColorProperty = isColorProperty;
function getStyleProperties(styleString) {
    const styles = parseStyleString(styleString);
    const properties = [];
    for (const property in styles) {
        properties.push({
            property,
            value: styles[property],
        });
    }
    return properties;
}
exports.getStyleProperties = getStyleProperties;
//# sourceMappingURL=styleParser.js.map