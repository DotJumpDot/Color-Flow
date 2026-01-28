import * as vscode from "vscode";
import { convertToRGBA } from "./colorConverter";
import { HTMLElement, getElementTextRange, getElementFullRange } from "./htmlParser";
import { ColorFlowSettings, HighlightMode } from "./settingsManager";

export class DecorationManager {
  private decorationCache: Map<string, vscode.TextEditorDecorationType> = new Map();
  private disposables: vscode.Disposable[] = [];

  constructor() {}

  applyDecorations(
    editor: vscode.TextEditor,
    elements: HTMLElement[],
    settings: ColorFlowSettings
  ): void {
    if (!settings.enabled) {
      this.clearDecorations(editor);
      return;
    }

    const decorationsByColor: Map<string, vscode.Range[]> = new Map();

    for (const element of elements) {
      if (!element.hasInlineStyle) {
        continue;
      }

      const colorValue = element.colors.color || element.colors.backgroundColor;

      if (!colorValue) {
        continue;
      }

      const backgroundColor = convertToRGBA(colorValue, settings.opacity);

      if (!backgroundColor) {
        continue;
      }

      const ranges = this.getRangesForElement(editor.document, element, settings.highlightMode);

      if (ranges.length === 0) {
        continue;
      }

      if (!decorationsByColor.has(backgroundColor)) {
        decorationsByColor.set(backgroundColor, []);
      }

      decorationsByColor.get(backgroundColor)!.push(...ranges);
    }

    this.clearDecorations(editor);

    for (const [backgroundColor, ranges] of decorationsByColor) {
      const decoration = this.getOrCreateDecoration(backgroundColor, settings);
      editor.setDecorations(decoration, ranges);
    }
  }

  private getRangesForElement(
    document: vscode.TextDocument,
    element: HTMLElement,
    mode: HighlightMode
  ): vscode.Range[] {
    switch (mode) {
      case "full-line":
        const ranges: vscode.Range[] = [];
        for (let i = element.startPosition.line; i <= element.endPosition.line; i++) {
          const line = document.lineAt(i);
          ranges.push(line.rangeIncludingLineBreak);
        }
        return ranges;

      case "word-only":
        const textRange = getElementTextRange(element);
        if (!textRange || !element.textContent) {
          return [];
        }
        return this.getWordRanges(document, textRange, element.textContent);

      case "char-range":
      default:
        const charRange = getElementTextRange(element);
        if (!charRange) {
          return [];
        }
        return [this.trimWhitespaceRange(document, charRange, element.textContent || "")];
    }
  }

  private getWordRanges(
    document: vscode.TextDocument,
    range: vscode.Range,
    text: string
  ): vscode.Range[] {
    const ranges: vscode.Range[] = [];
    const baseOffset = document.offsetAt(range.start);

    // Regex to find words (non-whitespace characters)
    const wordRegex = /\S+/g;
    let match;

    while ((match = wordRegex.exec(text)) !== null) {
      const startOffset = baseOffset + match.index;
      const endOffset = startOffset + match[0].length;
      ranges.push(
        new vscode.Range(document.positionAt(startOffset), document.positionAt(endOffset))
      );
    }

    return ranges;
  }

  private trimWhitespaceRange(
    document: vscode.TextDocument,
    range: vscode.Range,
    text: string
  ): vscode.Range {
    const trimmedLeft = text.trimStart();
    const leadingWhitespaceCount = text.length - trimmedLeft.length;
    const trimmedBoth = trimmedLeft.trimEnd();
    const trailingWhitespaceCount = trimmedLeft.length - trimmedBoth.length;

    const startOffset = document.offsetAt(range.start) + leadingWhitespaceCount;
    const endOffset = document.offsetAt(range.end) - trailingWhitespaceCount;

    if (startOffset >= endOffset) {
      return range;
    }

    return new vscode.Range(document.positionAt(startOffset), document.positionAt(endOffset));
  }

  private getOrCreateDecoration(
    backgroundColor: string,
    settings: ColorFlowSettings
  ): vscode.TextEditorDecorationType {
    if (this.decorationCache.has(backgroundColor)) {
      return this.decorationCache.get(backgroundColor)!;
    }

    const decorationOptions: vscode.DecorationRenderOptions = {
      backgroundColor: backgroundColor,
    };

    if (settings.enableBorder) {
      const borderColor =
        settings.borderColor === "currentColor" ? backgroundColor : settings.borderColor;

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

  clearDecorations(editor: vscode.TextEditor): void {
    for (const decoration of this.decorationCache.values()) {
      editor.setDecorations(decoration, []);
    }
  }

  clearCache(): void {
    for (const decoration of this.decorationCache.values()) {
      decoration.dispose();
    }
    this.decorationCache.clear();
  }

  dispose(): void {
    this.clearCache();
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
