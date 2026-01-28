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
exports.deactivate = exports.activate = void 0;
const vscode = __importStar(require("vscode"));
const htmlParser_1 = require("./htmlParser");
const settingsManager_1 = require("./settingsManager");
const decorationManager_1 = require("./decorationManager");
let settingsManager;
let decorationManager;
let updateTimeout;
function activate(context) {
    console.log("Color Flow extension is now active!");
    settingsManager = new settingsManager_1.SettingsManager();
    decorationManager = new decorationManager_1.DecorationManager();
    const updateDecorations = (editor) => {
        if (!editor) {
            return;
        }
        const settings = settingsManager.getSettings();
        if (!settings.enabled) {
            decorationManager.clearDecorations(editor);
            return;
        }
        const { elements } = (0, htmlParser_1.parseHTMLDocument)(editor.document);
        decorationManager.applyDecorations(editor, elements, settings);
    };
    const debouncedUpdate = (editor) => {
        if (updateTimeout) {
            clearTimeout(updateTimeout);
        }
        updateTimeout = setTimeout(() => {
            updateDecorations(editor);
        }, 100);
    };
    const handleDocumentChange = (event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && editor.document === event.document) {
            debouncedUpdate(editor);
        }
    };
    const handleActiveEditorChange = (editor) => {
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
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                updateDecorations(editor);
            }
            const status = settingsManager.getSettings().enabled ? "enabled" : "disabled";
            vscode.window.showInformationMessage(`Color Flow is now ${status}`);
        }),
        vscode.commands.registerCommand("colorFlow.refresh", () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                updateDecorations(editor);
                vscode.window.showInformationMessage("Color Flow decorations refreshed");
            }
        }),
        settingsManager.onSettingsChanged(() => {
            decorationManager.clearCache();
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
exports.activate = activate;
function deactivate() {
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
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map