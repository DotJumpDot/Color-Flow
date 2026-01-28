import * as vscode from "vscode";

export type HighlightMode = "full-line" | "word-only" | "char-range";

export interface ColorFlowSettings {
  opacity: number;
  enableBorder: boolean;
  borderColor: string;
  borderRadius: string;
  highlightMode: HighlightMode;
  enabled: boolean;
}

export class SettingsManager {
  private static readonly CONFIG_SECTION = "colorFlow";
  private settings: ColorFlowSettings;
  private changeEmitter = new vscode.EventEmitter<ColorFlowSettings>();
  private disposables: vscode.Disposable[] = [];

  constructor() {
    this.settings = this.loadSettings();
    this.watchConfigurationChanges();
  }

  private loadSettings(): ColorFlowSettings {
    const config = vscode.workspace.getConfiguration(SettingsManager.CONFIG_SECTION);

    return {
      opacity: config.get<number>("opacity", 0.2),
      enableBorder: config.get<boolean>("enableBorder", false),
      borderColor: config.get<string>("borderColor", "currentColor"),
      borderRadius: config.get<string>("borderRadius", "0px"),
      highlightMode: config.get<HighlightMode>("highlightMode", "char-range"),
      enabled: config.get<boolean>("enabled", true),
    };
  }

  private watchConfigurationChanges(): void {
    const configChangeDisposable = vscode.workspace.onDidChangeConfiguration((event) => {
      if (event.affectsConfiguration(SettingsManager.CONFIG_SECTION)) {
        this.settings = this.loadSettings();
        this.changeEmitter.fire(this.settings);
      }
    });

    this.disposables.push(configChangeDisposable);
  }

  getSettings(): ColorFlowSettings {
    return { ...this.settings };
  }

  get onSettingsChanged(): vscode.Event<ColorFlowSettings> {
    return this.changeEmitter.event;
  }

  toggleEnabled(): void {
    this.settings.enabled = !this.settings.enabled;
    this.changeEmitter.fire(this.settings);
  }

  setEnabled(enabled: boolean): void {
    this.settings.enabled = enabled;
    this.changeEmitter.fire(this.settings);
  }

  dispose(): void {
    this.changeEmitter.dispose();
    this.disposables.forEach((disposable) => disposable.dispose());
  }
}
