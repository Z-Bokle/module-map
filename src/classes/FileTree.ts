import * as p from 'path'
import * as fs from 'fs'
import { Dir, File, FileBase } from './File'
import { Settings } from './Settings'
import { FileType } from 'vscode'

export class FileTree {
  private constructor() {
    // const ignoreFilePath = root + p.sep + '.modulemapignore'
    // if(fs.existsSync(ignoreFilePath) && fs.statSync(ignoreFilePath).isFile()) {
    //   fs.readFileSync(root + p.sep + '.modulemapignore')
    //   .toString()
    //   .split('\n')
    //   .forEach((str) => {
    //     this.ignoreList.push(str)
    //   })
    // }
  }

  static instanse: FileTree | undefined

  entry?: FileBase | null = null

  private ignoreList: string[] = Settings.ignore

  static async createFileTree(root: string) {
    console.log('building file tree of: ', root)
    this.instanse = new FileTree()
    const entry = await this.instanse.readDir(root , '.')
    this.instanse.entry = entry
    console.log('build done.')
    return this.instanse
  }

  private async readDir(path: string, dirName: string): Promise<Dir | null> {
    const dir = await fs.promises.readdir(path)
    const children = await Promise.all(
      dir.map(async (child) => {
        if(this.ignoreList.includes(child)) {
          return null
        }
        const childPath = path + p.sep + child
        const info = fs.statSync(childPath)
        if(info.isDirectory()) {
          const childDir = await this.readDir(childPath, child)
          return childDir
        } else if(info.isFile()) {
          return new File({
            name: child,
            path: childPath
          })
        }
      })
    )
    return new Dir({
      name: dirName,
      path: path,
      children: children.filter((child) => child !== undefined && child !== null) as FileBase[]
    })
  }

  fileForEach(dir: Dir, callback: (file: File) => void) {
    dir.children.forEach((child) => {
      if(child.type === FileType.File) {
        callback(child as File)
      } else if(child.type === FileType.Directory) {
        this.fileForEach(child as Dir, callback)
      }
    })
  }

}