import { File } from "./File";

declare interface ModuleItem {
  /**
   * 导入/导出时该元素的名字
   */
  name?: string
  /**
   * 别名，只有使用了as才会存在
   * 
   * 只在module内使用
   */
  alias?: string
  /**
   * 来源
   * 
   * export时，如果空则为本模块
   */
  source?: string
  /**
   * 默认导入
   * 
   * 仅适用于import，export default没有对应的Module Item
   */
  default?: boolean
}

export class ESModule extends File {
  /**
   * export default
   * 
   */
  exportDefault: boolean;
  /**
   * export * from xxx
   * 
   * 只有source
   */
  exportAllModules: ModuleItem[];
  /**
   * 常规export
   */
  exportedItems: ModuleItem[];
  imports: ModuleItem[];
}