/* eslint-disable @typescript-eslint/naming-convention */
import * as parser from '@babel/parser';
import traverse, { NodePath } from '@babel/traverse';
import * as fs from 'fs';
import { File } from './File';
import { Settings } from './Settings';
import { ESModule, ModuleItem } from './ESModule';

const parseExport = (path: NodePath) => {
  const exportedItems: ModuleItem[] = [];
  const exportAllModules: ModuleItem[] = [];
  let exportDefault = false;
  if(path.isExportNamedDeclaration()) {
    const node = path.node; 
    if(node.declaration?.type === 'VariableDeclaration') {
      const items = node.declaration.declarations.forEach(
        (declaration) => exportedItems.push({
          name: (declaration.id as any).name
        })
      );
    }
    if(node.declaration?.type === 'ClassDeclaration') {
      const item = node.declaration.id.name;
      exportedItems.push({
        name: item
      });
    }
    if(node.declaration?.type === 'FunctionDeclaration') {
      const item = node.declaration.id?.name;
      exportedItems.push({
        name: item
      });
    }
    if(node.declaration?.type === 'EnumDeclaration') {
      const item = node.declaration.id.name;
      exportedItems.push({
        name: item
      });
    }
    if(node.declaration?.type === 'InterfaceDeclaration') {
      const item = node.declaration.id.name;
      exportedItems.push({
        name: item
      });
    }
    node.specifiers.forEach((specify) => {
      exportedItems.push({
        name: (specify.exported as any)?.name as string,
        alias: ((specify as any)?.local)?.name as string,
        source: node.source?.value
      });
    });
  }
  if(path.isExportDefaultDeclaration()) {
    exportDefault = true;
  }
  if(path.isExportAllDeclaration()) {
    exportAllModules.push({
      source: path.node.source.value
    });
  }
  return {
    exportedItems,
    exportDefault,
    exportAllModules
  };
};

const parseImport = (path: NodePath) => {
  const imports: ModuleItem[] = [];
  imports.push(
    ...(path.node as any)?.specifiers.map(
      (specify: any) => ({
        name: specify?.imported?.name as string,
        alias: specify?.local?.name as string,
        source: (path.node as any)?.source.value as string,
        default: specify.type === 'ImportDefaultSpecifier'
      })
    ) as ModuleItem[]
  );
  return imports;
};

export const parseFile = (file: File) => {
  if(!Settings.fileExt.includes(file.extName ?? '')) {
    return;
  }
  const module: ESModule = {
    ...file,
    exportDefault: false,
    exportAllModules: [],
    exportedItems: [],
    imports: []
  };
  if(file.path) {
    const buf = fs.readFileSync(file.path);
    const ast = parser.parse(buf.toString(), {
      sourceType: 'module',
      plugins: ['jsx', 'typescript']
    });
    traverse(ast, {
      ImportDeclaration: (path) => {
        const result = parseImport(path);
        module.imports.push(...result);
      },
      ExportDeclaration: (path) => {
        const result = parseExport(path);
        module.exportAllModules.push(...result.exportAllModules);
        module.exportedItems.push(...result.exportedItems);
        module.exportDefault = module.exportDefault || result.exportDefault;
      }
    });
  }
  return module;
};