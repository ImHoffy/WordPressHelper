import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      execRun: Function
      fileRead: Function
      fileReadJSON: Function
      fileWriteJSON: Funktion
      fileExists: Funktion
    }
  }
}
