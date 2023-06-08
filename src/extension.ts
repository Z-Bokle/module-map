import * as vscode from 'vscode';
import { FileTree } from './classes/FileTree';
import { Settings } from './classes/Settings';
import { parseFile } from './classes/Parser';
import { Dir, File } from './classes/File';
import { MainPanel } from './panels/MainPanel';
import { ESModule } from './classes/ESModule';
import { build } from './utilities/GraphBuilder';

export const doAnalyse = () => {
  const folders = vscode.workspace.workspaceFolders;
    if (folders === undefined) {
      vscode.window.showErrorMessage('Please open at least 1 folder first.');
    } else {
      const modules: ESModule[] = [];
      FileTree.createFileTree(folders[0].uri.path)
        .then((fileTree) => {
          fileTree.fileForEach((fileTree.entry as Dir), (file) => {
            const res = parseFile(file);
            if(res) {
              // MainPanel.currentPanel?.postMessage({command: 'addESModule', data: res});
              modules.push(res);
            }
          });
        })
        .then(() => {
          // console.log(modules);
          console.log(build(modules));
        });
    }
};

export function activate(context: vscode.ExtensionContext) {

  Settings.updateSettings();

  const analyseDisposable = vscode.commands.registerCommand('module-map.analyse', () => {
    doAnalyse();
  });

  const showViewDisposable = vscode.commands.registerCommand('module-map.showView', () => {
    MainPanel.render(context.extensionUri);
  });

  context.subscriptions.push(analyseDisposable);
  context.subscriptions.push(showViewDisposable);
}


export function deactivate() { }
