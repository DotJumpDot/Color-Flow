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
exports.SettingsManager = void 0;
const vscode = __importStar(require("vscode"));
class SettingsManager {
    constructor() {
        this.changeEmitter = new vscode.EventEmitter();
        this.disposables = [];
        this.settings = this.loadSettings();
        this.watchConfigurationChanges();
    }
    loadSettings() {
        const config = vscode.workspace.getConfiguration(SettingsManager.CONFIG_SECTION);
        return {
            opacity: config.get("opacity", 0.2),
            enableBorder: config.get("enableBorder", false),
            borderColor: config.get("borderColor", "currentColor"),
            borderRadius: config.get("borderRadius", "0px"),
            highlightMode: config.get("highlightMode", "char-range"),
            enabled: true,
        };
    }
    watchConfigurationChanges() {
        const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
            if (event.affectsConfiguration(SettingsManager.CONFIG_SECTION)) {
                this.settings = this.loadSettings();
                this.changeEmitter.fire(this.settings);
            }
        });
        this.disposables.push(configChangeDisposable);
    }
    getSettings() {
        return { ...this.settings };
    }
    get onSettingsChanged() {
        return this.changeEmitter.event;
    }
    toggleEnabled() {
        this.settings.enabled = !this.settings.enabled;
        this.changeEmitter.fire(this.settings);
    }
    setEnabled(enabled) {
        this.settings.enabled = enabled;
        this.changeEmitter.fire(this.settings);
    }
    dispose() {
        this.changeEmitter.dispose();
        this.disposables.forEach((disposable) => disposable.dispose());
    }
}
exports.SettingsManager = SettingsManager;
SettingsManager.CONFIG_SECTION = "colorFlow";
//# sourceMappingURL=settingsManager.js.map