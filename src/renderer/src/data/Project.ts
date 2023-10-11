import { generateRandomString } from './Function'
import { mainSession } from './MainSession'

const api = window.api

export interface ProjectIF {
  name: string
  dbName?: string
  dbUser?: string
  dbPassword?: string
  dockerPort: number
}

export default class Project {
  name: string
  dbName: string
  dbUser: string
  dbPassword: string
  dockerPort: number

  statusWp: boolean = false
  statusDb: boolean = false
  existsWp: boolean = false
  existsDb: boolean = false

  constructor(data: ProjectIF) {
    this.name = data.name
    this.dbName = data.dbName || generateRandomString(16)
    this.dbUser = data.dbUser || generateRandomString(32)
    this.dbPassword = data.dbPassword || generateRandomString(32)
    this.dockerPort = data.dockerPort

    this.checkStatus()
  }

  get nameFormated(): string {
    return this.name.toLowerCase().replace(/[^A-Za-z0-9]/g, '')
  }

  get isInstalled(): boolean {
    return this.existsWp && this.existsDb
  }

  get isRunning(): boolean {
    return this.statusWp && this.statusDb
  }

  checkStatus(): void {
    this.statusWp = mainSession.dockerPs.includes(`wordPress_${this.nameFormated}`) ? true : false
    this.statusDb = mainSession.dockerPs.includes(`wordPressDB_${this.nameFormated}`) ? true : false
    this.existsWp = mainSession.dockerPsAll.includes(`wordPress_${this.nameFormated}`) ? true : false
    this.existsDb = mainSession.dockerPsAll.includes(`wordPressDB_${this.nameFormated}`) ? true : false
  }

  async onWordPressUninstall(): Promise<void> {
    this.checkStatus()

    await this.onWordPressStop()

    if (this.isInstalled) {
      await api.execRun(`docker network rm wordPress_${this.nameFormated}`)
    }

    if (this.existsWp) {
      await api.execRun(`docker rm wordPress_${this.nameFormated}`)
      await api.execRun(`docker volume rm wordPress_${this.nameFormated}`)
    }

    if (this.existsDb) {
      await api.execRun(`docker rm wordPressDB_${this.nameFormated}`)
      await api.execRun(`docker volume rm wordPressDB_${this.nameFormated}`)
    }

    await mainSession.checkDockerContainerStatus()
    this.checkStatus()
  }

  async onWordPressStart(): Promise<void> {
    this.checkStatus()

    if (!this.statusWp) {
      await api.execRun(`docker start wordPress_${this.nameFormated}`)
    }

    if (!this.statusDb) {
      await api.execRun(`docker start wordPressDB_${this.nameFormated}`)
    }

    await mainSession.checkDockerContainerStatus()
    this.checkStatus()
  }

  async onWordPressStop(): Promise<void> {
    this.checkStatus()

    if (this.statusWp) {
      await api.execRun(`docker stop wordPress_${this.nameFormated}`)
    }

    if (this.statusDb) {
      await api.execRun(`docker stop wordPressDB_${this.nameFormated}`)
    }

    await mainSession.checkDockerContainerStatus()
    this.checkStatus()
  }

  async onWordPressInstallation(): Promise<void> {
    await this.onWordPressUninstall()

    await api.execRun(`docker volume create wordPress_${this.nameFormated}`)
    await api.execRun(`docker volume create wordPressDB_${this.nameFormated}`)

    await api.execRun(`docker network create wordPress_${this.nameFormated}`)

    await api.execRun(
      [
        'docker',
        'run',
        `--name wordPressDB_${this.nameFormated}`,
        `-e MYSQL_DATABASE=${this.dbName}`,
        `-e MYSQL_USER=${this.dbUser}`,
        `-e MYSQL_PASSWORD=${this.dbPassword}`,
        `-e MYSQL_RANDOM_ROOT_PASSWORD='1'`,
        `-v wordPressDB_${this.nameFormated}:/var/lib/mysql`,
        `--net=wordPress_${this.nameFormated}`,
        `-d mysql:5.7`
      ].join(' ')
    )

    await api.execRun(
      [
        `docker`,
        `run`,
        `--name wordPress_${this.nameFormated}`,
        `-e WORDPRESS_DB_HOST=wordPressDB_${this.nameFormated}`,
        `-e WORDPRESS_DB_USER=${this.dbUser}`,
        `-e WORDPRESS_DB_PASSWORD=${this.dbPassword}`,
        `-e WORDPRESS_DB_NAME=${this.dbName}`,
        `-v wordPressDB_${this.nameFormated}:/var/www/html`,
        `--net=wordPress_${this.nameFormated}`,
        `-p ${this.dockerPort}:80`,
        `-d wordpress`
      ].join(' ')
    )

    await mainSession.checkDockerContainerStatus()
    this.checkStatus()
  }
}
