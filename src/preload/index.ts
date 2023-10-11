import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import Exec from './Exec'
import File, { filePath, fileContent } from './File'

// Custom APIs for renderer
const api = {
  execRun: (command: string) => new Exec(command).run(),
  fileRead: (path: filePath) => new File(path).read(),
  fileReadJSON: (path: filePath) => new File(path).readJSON(),
  fileWriteJSON: (path: filePath, content: fileContent) => new File(path, content).writeJSON(),
  fileExists: (path: filePath) => new File(path).exists()
}

// Use `contextBridge` APIs t expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
