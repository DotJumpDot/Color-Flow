"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecorationManager = void 0;
const vscode = __importStar(require("vscode"));
const colorConverter_1 = require("./colorConverter");
const htmlParser_1 = require("./htmlParser");
class DecorationManager {
    constructor() {
        this.decorationCache = new Map();
        this.disposables = [];
    }
    applyDecorations(editor, elements, settings) {
        if (!settings.enabled) {
            this.clearDecorations(editor);
            return;
        }
        const decorationsByColor = new Map();
        for (const element of elements) {
            if (!element.hasInlineStyle) {
                continue;
            }
            const colorValue = element.colors.color || element.colors.backgroundColor;
            if (!colorValue) {
                continue;
            }
            const backgroundColor = (0, colorConverter_1.convertToRGBA)(colorValue, settings.opacity);
            if (!backgroundColor) {
                continue;
            }
            const range = this.getRangeForElement(element, settings.highlightMode);
            if (!range) {
                continue;
            }
            if (!decorationsByColor.has(backgroundColor)) {
                decorationsByColor.set(backgroundColor, []);
            }
            decorationsByColor.get(backgroundColor).push(range);
        }
        this.clearDecorations(editor);
        for (const [backgroundColor, ranges] of decorationsByColor) {
            const decoration = this.getOrCreateDecoration(backgroundColor, settings);
            editor.setDecorations(decoration, ranges);
        }
    }
    getRangeForElement(element, mode) {
        switch (mode) {
            case "full-line":
                return new vscode.Range(new vscode.Position(element.startPosition.line, 0), new vscode.Position(element.endPosition.line, 0));
            case "word-only":
                const textRange = (0, htmlParser_1.getElementTextRange)(element);
                if (!textRange) {
                    return null;
                }
                return this.trimWhitespaceRange(textRange, element.textContent || "");
            case "char-range":
            default:
                return (0, htmlParser_1.getElementTextRange)(element);
        }
    }
    trimWhitespaceRange(range, text) {
        const trimmedText = text.trimLeft();
        const leadingWhitespace = text.length - trimmedText.length;
        const trailingWhitespace = trimmedText.trimRight().length - trimmedText.length;
        const startOffset = leadingWhitespace;
        const endOffset = text.length - trailingWhitespace;
        const startPosition = new vscode.Position(range.start.line, range.start.character + startOffset);
        const endPosition = new vscode.Position(range.end.line, range.start.character + endOffset);
        return new vscode.Range(startPosition, endPosition);
    }
    getOrCreateDecoration(backgroundColor, settings) {
        if (this.decorationCache.has(backgroundColor)) {
            return this.decorationCache.get(backgroundColor);
        }
        const decorationOptions = {
            backgroundColor: backgroundColor,
        };
        if (settings.enableBorder) {
            const borderColor = settings.borderColor === "currentColor" ? backgroundColor : settings.borderColor;
            decorationOptions.borderColor = borderColor;
            decorationOptions.borderWidth = "1px";
            decorationOptions.borderStyle = "solid";
        }
        if (settings.borderRadius && settings.borderRadius !== "0px") {
            decorationOptions.borderRadius = settings.borderRadius;
        }
        const decoration = vscode.window.createTextEditorDecorationType(decorationOptions);
        this.decorationCache.set(backgroundColor, decoration);
        return decoration;
    }
    clearDecorations(editor) {
        for (const decoration of this.decorationCache.values()) {
            editor.setDecorations(decoration, []);
        }
    }
    clearCache() {
        for (const decoration of this.decorationCache.values()) {
            decoration.dispose();
        }
        this.decorationCache.clear();
    }
    dispose() {
        this.clearCache();
        this.disposables.forEach((disposable) => disposable.dispose());
    }
}
exports.DecorationManager = DecorationManager;
//# sourceMappingURL=decorationManager.js.map