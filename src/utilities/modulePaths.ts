import { Settings } from "../classes/Settings";
import * as nodePath from 'path';

const modulePaths = (path: string) => {
  const fileExt = Settings.fileExt;
  const paths = fileExt.map((extName) => `${path}${extName}`); 
  const indexPaths = fileExt.map((extName) => `${path}${nodePath.sep}index${extName}`);
  return [...paths, ...indexPaths];
};

export default modulePaths;