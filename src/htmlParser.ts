import * as vscode from "vscode";
import { Parser, Handler } from "htmlparser2";
import { ParsedStyles, extractColorProperties } from "./styleParser";

export interface HTMLElement {
  tagName: string;
  attributes: { [name: string]: string };
  styles: ParsedStyles;
  colors: {
    color?: string;
    backgroundColor?: string;
  };
  startPosition: vscode.Position;
  endPosition: vscode.Position;
  textStartPosition?: vscode.Position;
  textEndPosition?: vscode.Position;
  textContent?: string;
  parent?: HTMLElement;
  children: HTMLElement[];
  hasInlineStyle: boolean;
}

export interface ParseResult {
  elements: HTMLElement[];
  root: HTMLElement | null;
}

export function parseHTMLDocument(document: vscode.TextDocument): ParseResult {
  const text = document.getText();
  const elements: HTMLElement[] = [];
  const elementStack: HTMLElement[] = [];
  let root: HTMLElement | null = null;

  const handler: Partial<Handler> = {
    onopentag(name, attribs) {
      const startIndex = parser.startIndex;
      const position = document.positionAt(startIndex);

      const styles = attribs.style ? parseStyle(attribs.style) : {};
      const colors = extractColorProperties(styles);

      const element: HTMLElement = {
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
      } else {
        root = element;
      }

      elementStack.push(element);
      elements.push(element);
    },

    ontext(data) {
      if (elementStack.length > 0) {
        const currentElement = elementStack[elementStack.length - 1];
        const startIndex = parser.startIndex;
        const endIndex = parser.endIndex + 1;

        const textStartPosition = document.positionAt(startIndex);
        const textEndPosition = document.positionAt(endIndex);

        if (currentElement.textStartPosition === undefined) {
          currentElement.textContent = data;
          currentElement.textStartPosition = textStartPosition;
          currentElement.textEndPosition = textEndPosition;
        } else {
          currentElement.textContent = (currentElement.textContent || "") + data;
          currentElement.textEndPosition = textEndPosition;
        }
      }
    },

    onclosetag(name) {
      if (elementStack.length > 0) {
        const element = elementStack.pop();
        if (element) {
          const endIndex = parser.endIndex + 1;
          element.endPosition = document.positionAt(endIndex);
        }
      }
    },
  };

  const parser = new Parser(handler);
  parser.write(text);
  parser.end();

  return { elements, root };
}

function parseStyle(styleString: string): { [key: string]: string } {
  const styles: { [key: string]: string } = {};
  const declarations = styleString.split(";");

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(":");
    if (colonIndex === -1) continue;

    const property = declaration.substring(0, colonIndex).trim();
    const value = declaration.substring(colonIndex + 1).trim();

    if (property && value) {
      styles[property] = value;
    }
  }

  return styles;
}

export function findElementsByColor(
  elements: HTMLElement[],
  colorType: "color" | "backgroundColor"
): HTMLElement[] {
  return elements.filter((element) => element.colors[colorType] !== undefined);
}

export function getElementTextRange(element: HTMLElement): vscode.Range | null {
  if (!element.textStartPosition || !element.textEndPosition) {
    return null;
  }

  return new vscode.Range(element.textStartPosition, element.textEndPosition);
}

export function getElementFullRange(element: HTMLElement): vscode.Range {
  return new vscode.Range(element.startPosition, element.endPosition);
}
