import { exec } from 'child_process'

export default class Exec {
  command: string

  constructor(command: string) {
    this.command = command
  }

  run(): Promise<string> {
    return new Promise((resolve, rejects) => {
      exec(this.command, (err, stdout) => {
        if (err) {
          console.error(err)
          return rejects()
        }

        return resolve(stdout)
      })
    })
  }
}
