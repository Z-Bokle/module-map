import { FileType } from 'vscode';

interface FileBaseConfigs {
  /**
   * 文件/目录名
   */
  name: string
  /**
   * 路径
   */
  path: string
  type: FileType
}

interface FileConfigs extends FileBaseConfigs {

}

interface DirConfigs extends FileBaseConfigs {
  children: FileBase[]
}

export class FileBase implements Partial<FileBaseConfigs> {
  constructor(config: Partial<FileBaseConfigs>) {
    this.name = config.name;
    this.path = config.path;
    this.type = config.type;
  }
  path?:string;
  type?:FileType;
  name?:string;
}

export class File extends FileBase implements Partial<FileConfigs> {
  constructor(config: Partial<FileConfigs>) {
    super(config);
    this.extName = config.name?.substring(config.name?.lastIndexOf('.'), config.name.length);
  }
  type = FileType.File;
  extName?: string;
}

export class Dir extends FileBase implements Partial<DirConfigs> {
  constructor(config: Partial<DirConfigs>) {
    super(config);
    this.children = config.children ?? [];
  }
  type = FileType.Directory;
  children: FileBase[];
}