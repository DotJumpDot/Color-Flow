import * as vscode from "vscode";
import { parseHTMLDocument } from "./htmlParser";
import { SettingsManager, ColorFlowSettings } from "./settingsManager";
import { DecorationManager } from "./decorationManager";

const SUPPORTED_LANGUAGES = ["html", "php", "vue", "svelte", "typescriptreact", "javascriptreact"];

let settingsManager: SettingsManager;
let decorationManager: DecorationManager;
let statusBarItem: vscode.StatusBarItem;
let updateTimeout: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log("Color Flow extension is now active!");

  settingsManager = new SettingsManager();
  decorationManager = new DecorationManager();

  const updateStatusBarItem = (settings: ColorFlowSettings) => {
    statusBarItem.text = settings.enabled
      ? "$(symbol-color) Color Flow"
      : "$(symbol-color) Color Flow $(circle-slash)";
    statusBarItem.tooltip = settings.enabled
      ? "Color Flow is enabled (Click to open settings)"
      : "Color Flow is disabled (Click to open settings)";
  };

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 100);
  statusBarItem.command = "colorFlow.openSettings";
  updateStatusBarItem(settingsManager.getSettings());
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  const updateDecorations = (editor: vscode.TextEditor) => {
    if (!editor) {
      return;
    }

    const languageId = editor.document.languageId;

    if (!SUPPORTED_LANGUAGES.includes(languageId)) {
      return;
    }

    const settings = settingsManager.getSettings();

    if (!settings.enabled) {
      decorationManager.clearDecorations(editor);
      return;
    }

    const { elements } = parseHTMLDocument(editor.document);
    decorationManager.applyDecorations(editor, elements, settings);
  };

  const debouncedUpdate = (editor: vscode.TextEditor) => {
    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
      updateDecorations(editor);
    }, 100);
  };

  const handleDocumentChange = (event: vscode.TextDocumentChangeEvent) => {
    const editor = vscode.window.activeTextEditor;

    if (editor && editor.document === event.document) {
      debouncedUpdate(editor);
    }
  };

  const handleActiveEditorChange = (editor: vscode.TextEditor | undefined) => {
    if (editor) {
      updateDecorations(editor);
    }
  };

  const disposable = [
    vscode.workspace.onDidChangeTextDocument(handleDocumentChange),
    vscode.window.onDidChangeActiveTextEditor(handleActiveEditorChange),

    vscode.commands.registerCommand("colorFlow.openSettings", () => {
      vscode.commands.executeCommand("workbench.action.openSettings", "colorFlow");
    }),

    vscode.commands.registerCommand("colorFlow.toggle", () => {
      settingsManager.toggleEnabled();
      const settings = settingsManager.getSettings();

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
      }

      const status = settings.enabled ? "enabled" : "disabled";
      vscode.window.showInformationMessage(`Color Flow is now ${status}`);

      // Update status bar item
      updateStatusBarItem(settings);
    }),

    vscode.commands.registerCommand("colorFlow.refresh", () => {
      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
        vscode.window.showInformationMessage("Color Flow decorations refreshed");
      }
    }),

    settingsManager.onSettingsChanged((settings) => {
      decorationManager.clearCache();
      updateStatusBarItem(settings);

      const editor = vscode.window.activeTextEditor;
      if (editor) {
        updateDecorations(editor);
      }
    }),
  ];

  context.subscriptions.push(...disposable);

  const editor = vscode.window.activeTextEditor;
  if (editor) {
    updateDecorations(editor);
  }
}

export function deactivate() {
  if (updateTimeout) {
    clearTimeout(updateTimeout);
  }

  if (settingsManager) {
    settingsManager.dispose();
  }

  if (decorationManager) {
    decorationManager.dispose();
  }
}
