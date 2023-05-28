import * as vscode from 'vscode'

export class Settings {

  static updateSettings() {
    Settings.settings = vscode.workspace.getConfiguration('moduleMap')
    Settings.ignore = 
      (Settings.settings.get('ignore') as string)
      ?.split(',')
      .map((str) => str.trim())
    Settings.fileExt = Settings.settings.get('fileExt') ?? []
  }
  static settings: vscode.WorkspaceConfiguration
  static ignore: string[]
  static fileExt: string[]
}