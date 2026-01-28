"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseColor = exports.isValidColor = exports.convertToRGBA = void 0;
const tinycolor2_1 = __importDefault(require("tinycolor2"));
function convertToRGBA(colorString, opacity) {
    try {
        const color = new tinycolor2_1.default(colorString);
        if (!color.isValid()) {
            return null;
        }
        const rgba = color.toRgb();
        const finalOpacity = Math.max(0, Math.min(1, rgba.a * opacity));
        return `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${finalOpacity})`;
    }
    catch (error) {
        return null;
    }
}
exports.convertToRGBA = convertToRGBA;
function isValidColor(colorString) {
    try {
        return new tinycolor2_1.default(colorString).isValid();
    }
    catch (error) {
        return false;
    }
}
exports.isValidColor = isValidColor;
function parseColor(colorString) {
    try {
        const color = new tinycolor2_1.default(colorString);
        if (!color.isValid()) {
            return null;
        }
        return color.toRgb();
    }
    catch (error) {
        return null;
    }
}
exports.parseColor = parseColor;
//# sourceMappingURL=colorConverter.js.map