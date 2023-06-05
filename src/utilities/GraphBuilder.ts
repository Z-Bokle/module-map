import { FileType } from "vscode";
import { ESModule, ModuleItem } from "../classes/ESModule";
import * as path from 'path';

// 使用邻接表表示图
/*
  - - - - - - - - -               - - - - - - - - -
 |      | SubNode  |- - Side - ->| SubNode  |      |
 | Node | - - - - -|             |- - - - - | Node |
 |      | SubNode  |<- - Side - -| SubNode  |      |
  - - - - - - - - -               - - - - - - - - -
*/

interface SubNode extends ModuleItem {
  type: 'import' | 'export'
}

interface ImportSubNode extends SubNode {
  type: 'import'
  from: Side[]
  to?: Node
}

interface ExportSubNode extends SubNode {
  type: 'export'
  from?: Node
  to: Side[]
}

interface Side {}

interface ItemSide extends Side {
  from: ExportSubNode
  to: ImportSubNode
}

interface DefaultSide extends Side {
  from: Node
  to: ImportSubNode
}

interface Node extends ESModule {
  importSubNodes: ImportSubNode[]
  exportSubNodes: ExportSubNode[]
  exportDefaultSides: DefaultSide[]
}

interface Graph {

  nodes: Node[]
  /**
   * 图的入口，仅用于遍历，构造时默认为第一个Node，后续可修改
   */
  entry: Node
}

// 查找所有相关的其他Module，由于仅import语句包含其他模块的信息，因此只能从import开始查找
function findRelatedModules(module: ESModule, allModules: ESModule[]): ESModule[] {
  const relatedModules: ESModule[] = [];
  for(const item of module.imports) {
    const absolutePath = path.resolve(module.path ?? '', item.source ?? '');
    const relatedModule = allModules.find((module) => path.resolve(module.path ?? '') === absolutePath);
    if(relatedModule) {
      relatedModules.push(relatedModule);
    }
  }
  return relatedModules;
}

function moduleItemToSubNode(item: ModuleItem, type: 'import' | 'export', node: Node): SubNode {
  if(type === 'import') {
    return {
      type,
      from: [],
      to: node
    } as ImportSubNode;
  } else {
    return {
      type,
      from: node,
      to: []
    } as ExportSubNode;
  }
}

function moduleToNode(module: ESModule): Node {
  let node: Node = { ...module, importSubNodes: [], exportSubNodes: [], exportDefaultSides: [] };
  node = {
    ...node, 
    importSubNodes: module.imports.map((item) => moduleItemToSubNode(item, 'import', node)) as ImportSubNode[], 
    exportSubNodes: [
      ...module.exportAllModules.map((item) => moduleItemToSubNode(item, 'export', node)),
      ...module.exportedItems.map((item) => moduleItemToSubNode(item, 'export', node))
    ] as ExportSubNode[],
    exportDefaultSides: []
  };
  return node;
}

export function build(modules: Exclude<ESModule[], []>): Graph[] {

  const graphs: Graph[] = [];
  let visitedModulesNum = 0;

  /*
    递归构造Graph，所有涉及到的node存入nodes中
    1. 生成Node，所有的SubNode都不关联Side
    2. 查看该Node对应的ESModule，找出所有关联的其他ESModule，对于每个ESModule
      2-1.如果该Module对应的Node已存在于nodes中，则设置对应的SubNode关联，构造Side
      2-2.如果该Module对应的Node不在nodes中，则构造一个新的Node，存入nodes中，随后执行2-1
    3. 递归结束，Graph构造完成
    4. 查看是否还有剩余的modules，如果还有，重复1～3，直到所有图都构造完成
  */

  do {

    function addNode(module: ESModule) {
      const node = moduleToNode(module);
      const relatedModules = findRelatedModules(module, modules);
      nodes.push(node);
      relatedModules.forEach((relatedModule) => {
        const relatedNode = addNode(relatedModule);

        if(relatedModule.exportDefault) {
          // 如果import是default，则关联本模块
          const subNode = node.importSubNodes.find(
            (subNode) => 
              path.resolve(node.path ?? '', subNode.source ?? '') === path.resolve(relatedNode.path ?? '')
              && subNode.default
            );
          const defaultSide = {
            from: relatedNode,
            to: subNode as ImportSubNode
          };
          relatedNode.exportDefaultSides.push(defaultSide);
          subNode?.from.push(defaultSide);
        } else {
          // 否则查找本模块的相关子模块，关联
          const subNodes = node.importSubNodes.filter(
            (subNode) => 
              path.resolve(node.path ?? '', subNode.source ?? '') === path.resolve(relatedNode.path ?? '')
            );
          const relatedSubNodes = relatedNode.exportSubNodes.filter(
            (relatedSubNode) => 
              path.resolve(relatedNode.path ?? '', relatedSubNode.source ?? '') === path.resolve(relatedNode.path ?? '')
              && relatedSubNode.default !== true
            );
          subNodes.forEach((subNode) => {
            const relatedSubNode = relatedSubNodes.find((relatedSubNode) => relatedSubNode.name === subNode.name);
            if(relatedSubNode) {
              const side: ItemSide = {
                from: relatedSubNode,
                to: subNode
              };
              relatedSubNode.to.push(side);
              subNode.from.push(side);
            }
          });
        }
        
      });
      return node;
    }

    const entry = moduleToNode(modules[0]);
    const nodes: Node[] = [];
    
    addNode(modules[0]);

    visitedModulesNum += nodes.length;
    graphs.push({
      nodes, entry
    });
  } while(visitedModulesNum < modules.length);
  

  return graphs;
}