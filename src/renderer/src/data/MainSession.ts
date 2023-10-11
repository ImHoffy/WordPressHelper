import { reactive } from 'vue'
import Project, { ProjectIF } from './Project'

const api = window.api
const dbFile = 'db.json'

interface StatusIF {
  dockerInstalled: boolean
}

export default class MainSession {
  projectList: Project[] = []
  status: StatusIF = {
    dockerInstalled: false
  }
  dockerPs: string = ''
  dockerPsAll: string = ''

  async init(): Promise<void> {
    await this.checkStatus()
    await this.checkDockerContainerStatus()

    const dbFileExists = api.fileExists(dbFile)

    if (!dbFileExists) {
      this.onSave()
    }

    const dbFileContent = await api.fileReadJSON(dbFile)

    if (dbFileContent) {
      this.projectList = dbFileContent.projectList.map((project: ProjectIF) => new Project(project)) || []
    }
  }

  async checkStatus(): Promise<void> {
    return new Promise(async (resolve) => {
      const dockerVersion: string = await api.execRun('docker version')

      if (dockerVersion.includes('Version')) {
        this.status.dockerInstalled = true
      } else {
        this.status.dockerInstalled = false
      }

      resolve()
    })
  }

  async checkDockerContainerStatus(): Promise<void> {
    this.dockerPs = await api.execRun('docker ps')
    this.dockerPsAll = await api.execRun('docker ps -a')
  }

  onCreateNewProject(newProjectData: ProjectIF): Promise<void> {
    return new Promise(async (resolve, reject) => {
      if (newProjectData.name.length < 3) {
        return reject('Name length have to be min 3.')
      }

      if (newProjectData.dockerPort < 1000 || newProjectData.dockerPort > 9000) {
        return reject('Select Docker Port between 1000 and 9000')
      }

      if (this.projectList.filter((project: Project) => project.name === newProjectData.name).length > 0) {
        return reject('Duplicated project name.')
      }

      if (this.projectList.filter((project: Project) => project.dockerPort === newProjectData.dockerPort).length > 0) {
        return reject('Duplicated docker port.')
      }

      const newProject = new Project(newProjectData)
      this.projectList.push(newProject)

      await this.onSave()

      return resolve()
    })
  }

  onRemoveProject(projectIndex: number): Promise<void> {
    return new Promise(async (resolve) => {
      await this.projectList[projectIndex].onWordPressUninstall()

      this.projectList.splice(projectIndex, 1)

      await this.onSave()

      resolve()
    })
  }

  async onSave(): Promise<void> {
    await api.fileWriteJSON(dbFile, JSON.parse(JSON.stringify(this)))
  }
}

export const mainSession: MainSession = reactive(new MainSession())
