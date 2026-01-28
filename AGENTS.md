# Color Flow - API Documentation

This document provides detailed documentation for main functions and modules in Color Flow extension.

## Table of Contents

- [ColorConverter Module](#colorconverter-module)
- [StyleParser Module](#styleparser-module)
- [HTMLParser Module](#htmlparser-module)
- [SettingsManager Module](#settingsmanager-module)
- [DecorationManager Module](#decorationmanager-module)
- [Extension Entry Point](#extension-entry-point)

---

## ColorConverter Module

### `convertToRGBA(colorString: string, opacity: number): string | null`

Converts a color string to RGBA format with applied opacity.

**Parameters:**

- `colorString` (string): The color value to convert (e.g., "red", "#ff0000", "rgb(255,0,0)")
- `opacity` (number): Opacity value between 0 and 1 to apply to the color

**Returns:**

- `string | null`: RGBA color string in format "rgba(r,g,b,a)" or null if invalid

**Example:**

```typescript
convertToRGBA("#ff0000", 0.5); // Returns: "rgba(255, 0, 0, 0.5)"
convertToRGBA("blue", 0.3); // Returns: "rgba(0, 0, 255, 0.3)"
```

**Dependencies:** tinycolor2

---

### `isValidColor(colorString: string): boolean`

Validates whether a string represents a valid color.

**Parameters:**

- `colorString` (string): The color string to validate

**Returns:**

- `boolean`: True if color is valid, false otherwise

**Example:**

```typescript
isValidColor("#ff0000"); // Returns: true
isValidColor("notacolor"); // Returns: false
```

**Dependencies:** tinycolor2

---

### `parseColor(colorString: string): RGBAColor | null`

Parses a color string into an RGBA object.

**Parameters:**

- `colorString` (string): The color string to parse

**Returns:**

- `RGBAColor | null`: Object with r, g, b, a properties or null if invalid

**Example:**

```typescript
parseColor("#ff0000"); // Returns: { r: 255, g: 0, b: 0, a: 1 }
parseColor("blue"); // Returns: { r: 0, g: 0, b: 255, a: 1 }
```

**Dependencies:** tinycolor2

---

## StyleParser Module

### `parseStyleString(styleString: string): ParsedStyles`

Parses a CSS style string into a key-value object.

**Parameters:**

- `styleString` (string): CSS style declarations string (e.g., "color: red; background: blue;")

**Returns:**

- `ParsedStyles`: Object mapping property names to their values

**Example:**

```typescript
parseStyleString("color: red; background-color: blue;");
// Returns: { color: "red", "background-color": "blue" }
```

---

### `extractColorProperties(styles: ParsedStyles): { color?: string; backgroundColor?: string }`

Extracts color-related properties from a parsed styles object.

**Parameters:**

- `styles` (ParsedStyles): Object containing parsed CSS properties

**Returns:**

- Object with optional `color` and `backgroundColor` properties

**Example:**

```typescript
extractColorProperties({ color: "red", fontSize: "16px" });
// Returns: { color: "red" }
```

---

### `isColorProperty(property: string): boolean`

Checks if a property name is a color-related CSS property.

**Parameters:**

- `property` (string): CSS property name to check

**Returns:**

- `boolean`: True if property is color-related

**Example:**

```typescript
isColorProperty("color"); // Returns: true
isColorProperty("fontSize"); // Returns: false
```

---

### `getStyleProperties(styleString: string): StyleProperty[]`

Converts a style string into an array of StyleProperty objects.

**Parameters:**

- `styleString` (string): CSS style declarations string

**Returns:**

- `StyleProperty[]`: Array of objects with property and value fields

**Example:**

```typescript
getStyleProperties("color: red; background: blue;");
// Returns: [{ property: "color", value: "red" }, { property: "background", value: "blue" }]
```

---

## HTMLParser Module

### `parseHTMLDocument(document: vscode.TextDocument): ParseResult`

Parses an HTML document and extracts elements with inline styles.

**Parameters:**

- `document` (vscode.TextDocument): VS Code text document to parse

**Returns:**

- `ParseResult`: Object containing:
  - `elements`: Array of all parsed HTMLElement objects
  - `root`: Root element of the HTML tree

**Implementation Details:**

- Uses `document.positionAt()` for accurate character-based positioning
- Captures `startIndex` and `endIndex` from htmlparser2 for precise range calculation
- Handles multiline text content correctly
- Supports HTML, PHP, Vue, Svelte, TSX, and JSX files

**Example:**

```typescript
const result = parseHTMLDocument(editor.document);
console.log(result.elements); // Array of elements with color info
```

**Dependencies:** htmlparser2

---

### `findElementsByColor(elements: HTMLElement[], colorType: 'color' | 'backgroundColor'): HTMLElement[]`

Filters elements that have a specific color type defined.

**Parameters:**

- `elements` (HTMLElement[]): Array of parsed HTML elements
- `colorType` ('color' | 'backgroundColor'): Type of color to filter by

**Returns:**

- `HTMLElement[]`: Array of elements with specified color type

**Example:**

```typescript
const coloredElements = findElementsByColor(elements, "color");
```

---

### `getElementTextRange(element: HTMLElement): vscode.Range | null`

Gets the text range for an element's content.

**Parameters:**

- `element` (HTMLElement): Parsed HTML element

**Returns:**

- `vscode.Range | null`: Range of element's text content or null

**Example:**

```typescript
const range = getElementTextRange(element);
```

---

### `getElementFullRange(element: HTMLElement): vscode.Range`

Gets the full range from element start to end position.

**Parameters:**

- `element` (HTMLElement): Parsed HTML element

**Returns:**

- `vscode.Range`: Range from element start to end

**Example:**

```typescript
const range = getElementFullRange(element);
```

---

## SettingsManager Module

### `constructor()`

Creates a new SettingsManager instance and loads initial configuration.

**Example:**

```typescript
const settingsManager = new SettingsManager();
```

---

### `getSettings(): ColorFlowSettings`

Returns a copy of current extension settings.

**Returns:**

- `ColorFlowSettings`: Object containing all configuration values

**Example:**

```typescript
const settings = settingsManager.getSettings();
console.log(settings.opacity); // e.g., 0.2
console.log(settings.enabled); // e.g., true
```

---

### `onSettingsChanged: vscode.Event<ColorFlowSettings>`

Event that fires when settings change.

**Example:**

```typescript
settingsManager.onSettingsChanged((settings) => {
  console.log("Settings updated:", settings);
});
```

---

### `toggleEnabled(): void`

Toggles the extension enabled state.

**Example:**

```typescript
settingsManager.toggleEnabled();
```

---

### `setEnabled(enabled: boolean): void`

Sets the extension enabled state.

**Parameters:**

- `enabled` (boolean): New enabled state

**Example:**

```typescript
settingsManager.setEnabled(false);
```

---

### `dispose(): void`

Cleans up resources and event listeners.

**Example:**

```typescript
settingsManager.dispose();
```

---

## DecorationManager Module

### `constructor()`

Creates a new DecorationManager instance.

**Example:**

```typescript
const decorationManager = new DecorationManager();
```

---

### `applyDecorations(editor: vscode.TextEditor, elements: HTMLElement[], settings: ColorFlowSettings): void`

Applies color decorations to elements in the editor.

**Parameters:**

- `editor` (vscode.TextEditor): VS Code text editor to decorate
- `elements` (HTMLElement[]): Array of parsed HTML elements
- `settings` (ColorFlowSettings): Current extension settings

**Behavior:**

- Checks `settings.enabled` - if false, clears all decorations and returns
- Processes elements with inline styles containing color or background-color properties
- Groups decorations by color for efficient rendering
- Caches decoration types to avoid recreation

**Example:**

```typescript
decorationManager.applyDecorations(editor, elements, settings);
```

---

### `getRangesForElement(document: vscode.TextDocument, element: HTMLElement, mode: HighlightMode): vscode.Range[]`

Determines the ranges to highlight based on the selected highlight mode.

**Parameters:**

- `document` (vscode.TextDocument): The text document
- `element` (HTMLElement): Parsed HTML element
- `mode` (HighlightMode): The highlight mode to use

**Returns:**

- `vscode.Range[]`: Array of ranges to decorate

**Highlight Modes:**

- **full-line**: Returns ranges for each complete line the element spans (column 0 to end of line)
- **word-only**: Returns separate ranges for each word, skipping whitespace between them
- **char-range**: Returns a single range for the element's text content with whitespace trimmed

**Example:**

```typescript
const ranges = decorationManager.getRangesForElement(document, element, "word-only");
```

---

### `getWordRanges(document: vscode.TextDocument, range: vscode.Range, text: string): vscode.Range[]`

Extracts individual word ranges from a text range.

**Parameters:**

- `document` (vscode.TextDocument): The text document
- `range` (vscode.Range): The range to search within
- `text` (string): The text content to parse

**Returns:**

- `vscode.Range[]`: Array of ranges for each word

**Implementation:**

- Uses regex `/\S+/g` to find non-whitespace sequences
- Calculates precise character offsets using `document.offsetAt()` and `document.positionAt()`

---

### `trimWhitespaceRange(document: vscode.TextDocument, range: vscode.Range, text: string): vscode.Range`

Trims leading and trailing whitespace from a range.

**Parameters:**

- `document` (vscode.TextDocument): The text document
- `range` (vscode.Range): The range to trim
- `text` (string): The text content

**Returns:**

- `vscode.Range`: Trimmed range

**Implementation:**

- Handles multiline text correctly using character offsets
- Returns original range if trimming would result in invalid range

---

### `clearDecorations(editor: vscode.TextEditor): void`

Removes all decorations from the editor.

**Parameters:**

- `editor` (vscode.TextEditor): VS Code text editor

**Example:**

```typescript
decorationManager.clearDecorations(editor);
```

---

### `clearCache(): void`

Clears the decoration cache and disposes of all decoration types.

**Example:**

```typescript
decorationManager.clearCache();
```

---

### `dispose(): void`

Cleans up all resources and decorations.

**Example:**

```typescript
decorationManager.dispose();
```

---

## Extension Entry Point

### `activate(context: vscode.ExtensionContext): void`

Main activation function called when the extension is loaded.

**Parameters:**

- `context` (vscode.ExtensionContext): Extension context for managing subscriptions

**Behavior:**

- Initializes settings and decoration managers
- Creates and configures status bar item with enabled/disabled state indicator
- Registers event listeners for document changes and active editor changes
- Registers commands (openSettings, toggle, refresh)
- Applies decorations to the active editor on startup
- Updates status bar when settings change

**Supported Languages:**

- HTML
- PHP
- Vue
- Svelte
- TypeScript React (typescriptreact)
- JavaScript React (javascriptreact)

**Example:**

```typescript
export function activate(context: vscode.ExtensionContext) {
  // Extension initialization code
}
```

---

### `deactivate(): void`

Cleanup function called when the extension is deactivated.

**Behavior:**

- Clears pending update timeouts
- Disposes of settings and decoration managers

**Example:**

```typescript
export function deactivate() {
  // Cleanup code
}
```

---

## Type Definitions

### `RGBAColor`

```typescript
interface RGBAColor {
  r: number;
  g: number;
  b: number;
  a: number;
}
```

### `ParsedStyles`

```typescript
interface ParsedStyles {
  [property: string]: string;
}
```

### `StyleProperty`

```typescript
interface StyleProperty {
  property: string;
  value: string;
}
```

### `HTMLElement`

```typescript
interface HTMLElement {
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
```

### `ColorFlowSettings`

```typescript
interface ColorFlowSettings {
  enabled: boolean;
  opacity: number;
  enableBorder: boolean;
  borderColor: string;
  borderRadius: string;
  highlightMode: "full-line" | "word-only" | "char-range";
}
```

### `HighlightMode`

```typescript
type HighlightMode = "full-line" | "word-only" | "char-range";
```

---

## Architecture Overview

Color Flow is built with a modular architecture:

1. **ColorConverter**: Handles color parsing and conversion to RGBA format
2. **StyleParser**: Parses CSS style strings and extracts color properties
3. **HTMLParser**: Parses HTML documents using htmlparser2 and tracks accurate positions
4. **SettingsManager**: Manages extension configuration and change events
5. **DecorationManager**: Applies VS Code text decorations based on parsed elements and settings
6. **Extension Entry Point**: Coordinates all components and manages VS Code lifecycle

### Key Design Decisions

- **Character-based Positioning**: Uses `document.positionAt()` instead of manual line/column counting for accuracy
- **Decoration Caching**: Reuses `vscode.TextEditorDecorationType` objects for performance
- **Debounced Updates**: Uses 100ms timeout to avoid excessive decorations during typing
- **Supported Languages Filter**: Checks `languageId` before processing to avoid unsupported file types
- **Status Bar Integration**: Provides visual feedback and quick access to settings
