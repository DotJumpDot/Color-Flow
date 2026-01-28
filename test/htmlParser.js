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
exports.getElementFullRange = exports.getElementTextRange = exports.findElementsByColor = exports.parseHTMLDocument = void 0;
const vscode = __importStar(require("vscode"));
const htmlparser2_1 = require("htmlparser2");
const styleParser_1 = require("./styleParser");
function parseHTMLDocument(document) {
    const text = document.getText();
    const elements = [];
    const elementStack = [];
    let root = null;
    let currentLine = 0;
    let currentColumn = 0;
    const updatePosition = (data) => {
        for (let i = 0; i < data.length; i++) {
            if (data[i] === "\n") {
                currentLine++;
                currentColumn = 0;
            }
            else {
                currentColumn++;
            }
        }
    };
    const handler = {
        onopentag(name, attribs) {
            const position = new vscode.Position(currentLine, currentColumn);
            const styles = attribs.style ? parseStyle(attribs.style) : {};
            const colors = (0, styleParser_1.extractColorProperties)(styles);
            const element = {
                tagName: name,
                attributes: attribs,
                styles,
                colors,
                startPosition: position,
                endPosition: position,
                textStartPosition: undefined,
                textEndPosition: undefined,
                textContent: undefined,
                parent: elementStack.length > 0 ? elementStack[elementStack.length - 1] : undefined,
                children: [],
                hasInlineStyle: !!attribs.style,
            };
            if (element.parent) {
                element.parent.children.push(element);
            }
            else {
                root = element;
            }
            elementStack.push(element);
            elements.push(element);
        },
        ontext(data) {
            const textStartPosition = new vscode.Position(currentLine, currentColumn);
            updatePosition(data);
            const textEndPosition = new vscode.Position(currentLine, currentColumn);
            if (elementStack.length > 0) {
                const currentElement = elementStack[elementStack.length - 1];
                if (currentElement.textContent === undefined) {
                    currentElement.textContent = data;
                    currentElement.textStartPosition = textStartPosition;
                    currentElement.textEndPosition = textEndPosition;
                }
                else {
                    currentElement.textContent += data;
                    if (currentElement.textEndPosition) {
                        currentElement.textEndPosition = textEndPosition;
                    }
                }
            }
        },
        onclosetag(name) {
            if (elementStack.length > 0) {
                const element = elementStack.pop();
                if (element) {
                    element.endPosition = new vscode.Position(currentLine, currentColumn);
                }
            }
        },
    };
    const parser = new htmlparser2_1.Parser(handler);
    parser.write(text);
    parser.end();
    return { elements, root };
}
exports.parseHTMLDocument = parseHTMLDocument;
function parseStyle(styleString) {
    const styles = {};
    const declarations = styleString.split(";");
    for (const declaration of declarations) {
        const colonIndex = declaration.indexOf(":");
        if (colonIndex === -1)
            continue;
        const property = declaration.substring(0, colonIndex).trim();
        const value = declaration.substring(colonIndex + 1).trim();
        if (property && value) {
            styles[property] = value;
        }
    }
    return styles;
}
function findElementsByColor(elements, colorType) {
    return elements.filter((element) => element.colors[colorType] !== undefined);
}
exports.findElementsByColor = findElementsByColor;
function getElementTextRange(element) {
    if (!element.textStartPosition || !element.textEndPosition) {
        return null;
    }
    return new vscode.Range(element.textStartPosition, element.textEndPosition);
}
exports.getElementTextRange = getElementTextRange;
function getElementFullRange(element) {
    return new vscode.Range(element.startPosition, element.endPosition);
}
exports.getElementFullRange = getElementFullRange;
//# sourceMappingURL=htmlParser.js.map