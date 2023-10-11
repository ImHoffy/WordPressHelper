import fs from 'fs'

export type filePath = string
export type fileContent = string | object

export default class File {
  path: filePath
  content: fileContent | null

  constructor(path: filePath, content?: fileContent) {
    this.path = path
    this.content = content || null
  }

  read(): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.path, 'utf8', (err, data) => {
        if (err || typeof data !== 'string') {
          console.error(err)
          return reject()
        }
        return resolve(data)
      })
    })
  }

  async readJSON(): Promise<object | null> {
    const readContent = await this.read()

    try {
      return JSON.parse(readContent)
    } catch (err) {
      return null
    }
  }

  writeJSON(): void {
    fs.writeFile(this.path, JSON.stringify(this.content, null, 2), (err) => {
      if (err) {
        console.error(err)
        return
      }
      return
    })
  }

  exists(): boolean {
    return fs.existsSync(this.path) ? true : false
  }
}
