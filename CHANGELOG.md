# Changelog

All notable changes to Color Flow will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.0] - 2026-01-28

### Added

- **TSX/JSX File Support**: Extension now supports `.tsx` and `.jsx` files in addition to HTML, PHP, Vue, and Svelte
- **Enable Highlighting Setting**: New configuration option to enable/disable color highlighting (default: enabled)
- **Status Bar Indicator**: Visual status bar item showing extension state:
  - Shows enabled/disabled state with icon
  - Tooltip displays current status
  - Click to open Color Flow settings
  - Automatically updates when settings change
- **Improved Position Tracking**: HTML parser now uses accurate character-based positioning via VS Code's `positionAt()` API, fixing issues with incorrect highlight positions

### Fixed

- **Char-Range Highlight Mode**: Now correctly highlights the exact text range of element content, trimming leading and trailing whitespace
- **Word-Only Highlight Mode**: Now highlights individual words separately, skipping spaces between words
- **Full-Line Highlight Mode**: Now covers the entire width of each line from column 0 to end of line, including line breaks
- **Position Tracking Accuracy**: Fixed issues where highlights appeared at incorrect positions (e.g., on `<div style` instead of actual text content)
- **Multiline Text Support**: Improved handling of text content that spans multiple lines across highlight modes

### Changed

- **Settings Order**: Configuration properties reordered in settings UI for better organization:
  - "Enable Highlighting" moved to top
  - "Enable Border" placed before "Border Color"
- **HTML Parser**: Refactored to use `document.positionAt()` for accurate character index to position conversion

## [0.1.0] - 2026-01-28

### Added

- Initial release of Color Flow extension
- HTML parsing with inline style detection
- Support for multiple color formats:
  - Named colors (red, blue, green, etc.)
  - Hex colors (#f00, #ff0000, #ff0000ff)
  - RGB/RGBA colors
  - HSL/HSLA colors
- Color conversion to RGBA with configurable opacity
- Three highlight modes:
  - Full-line highlighting
  - Word-only highlighting
  - Character-range highlighting (default)
- Border customization:
  - Enable/disable borders
  - Custom border colors
  - Border radius support
- Real-time decoration updates on document changes
- Toggle extension on/off command
- Refresh decorations command
- Open settings command
- Settings management with change detection
- Decoration caching for performance
- Support for HTML, PHP, Vue, and Svelte files
- Comprehensive test coverage
- API documentation (AGENTS.md)

## [Future Versions]

### Planned Features

- Support for CSS variables (`var(--my-color)`)
- Support for class-based styling
- Support for `<style>` block declarations
- Color inheritance from parent elements
- External CSS file parsing
- More color format support (LCH, OKLCH, etc.)
