<template>
  <div class="container mt-5">
    <div class="mb-4">
      <span v-if="status.dockerInstalled" class="text-success">Docker</span>
      <span v-else="status.dockerInstalled" class="text-danger">Docker</span>
    </div>
    <div class="list-group">
      <button type="button" class="list-group-item list-group-item-action list-group-item-primary" data-bs-toggle="modal" data-bs-target="#createNewProjectModal">Create new project</button>
      <button type="button" class="list-group-item list-group-item-action disabled" disabled>BackUp all</button>
      <button type="button" class="list-group-item list-group-item-action disabled" disabled>Update all</button>
      <button
        type="button"
        class="d-flex justify-content-between list-group-item list-group-item-action list-group-item-light"
        v-for="(projectItem, projectIndex) in projectList"
        :key="projectIndex"
        data-bs-toggle="modal"
        data-bs-target="#openProjectModal"
        @click="activeProjectID = projectIndex"
      >
        <span v-text="`${projectItem.name}`"></span>
        <div>
          <span class="badge text-bg-primary ms-2">{{ projectItem.dockerPort }}</span>
          <span v-if="projectItem.isRunning" class="badge text-bg-success ms-2">WordPress</span>
          <span v-else-if="projectItem.isInstalled && !projectItem.isRunning" class="badge text-bg-secondary ms-2">WordPress</span>
          <span v-if="projectItem.isRunning" class="badge text-bg-success ms-2">Database</span>
          <span v-else-if="projectItem.isInstalled && !projectItem.isRunning" class="badge text-bg-secondary ms-2">Database</span>
        </div>
      </button>
    </div>
  </div>

  <div class="modal fade" id="openProjectModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div v-if="activeProject" class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Project - {{ activeProject.name }}</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="list-group">
            <button v-if="!activeProject.isInstalled" type="button" class="list-group-item list-group-item-action list-group-item-primary" @click="onWordPressInstallation()">WordPress Install</button>
            <a
              v-if="activeProject.isRunning"
              :href="`http://localhost:${activeProject.dockerPort}/`"
              type="button"
              class="list-group-item list-group-item-action list-group-item-primary"
              target="_blank"
              >Open Website</a
            >
            <button v-if="activeProject.isInstalled && !activeProject.isRunning" type="button" class="list-group-item list-group-item-action list-group-item-primary" @click="onWordPressStart()">
              WordPress Start
            </button>
            <button v-if="activeProject.isInstalled && activeProject.isRunning" type="button" class="list-group-item list-group-item-action list-group-item-primary" @click="onWordPressStop()">
              WordPress Stop
            </button>
            <button v-if="activeProject.isInstalled" type="button" class="list-group-item list-group-item-action list-group-item-danger" @dblclick="onWordPressUninstall()">
              WordPress Uninstall (DoubleClick)
            </button>
            <button type="button" class="list-group-item list-group-item-action list-group-item-danger" @dblclick="onRemoveProject()">Remove Project (DoubleClick)</button>
          </div>
        </div>
        <div class="modal-footer">
          <div v-if="loading" class="spinner-border" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal" @click="activeProjectID = null">Close</button>
        </div>
      </div>
    </div>
  </div>

  <CreateNewProject />
</template>

<script setup lang="ts">
import { onMounted, computed, ref } from 'vue'
import { mainSession } from './data/MainSession'
import Project from './data/Project'
import CreateNewProject from './components/CreateNewProject.vue'

onMounted((): void => {
  mainSession.init()
})

const loading = ref<boolean>(false)
const projectList = computed<Project[]>(() => mainSession.projectList)
const status = computed(() => mainSession.status)
const activeProjectID = ref<number | null>(null)
const activeProject = computed<Project | null>(() => (activeProjectID.value !== null ? projectList.value[activeProjectID.value] : null))

async function onWordPressInstallation(): Promise<void> {
  loading.value = true
  await activeProject.value?.onWordPressInstallation()
  loading.value = false
}

async function onWordPressUninstall(): Promise<void> {
  loading.value = true
  await activeProject.value?.onWordPressUninstall()
  loading.value = false
}

async function onWordPressStart(): Promise<void> {
  loading.value = true
  await activeProject.value?.onWordPressStart()
  loading.value = false
}

async function onWordPressStop(): Promise<void> {
  loading.value = true
  await activeProject.value?.onWordPressStop()
  loading.value = false
}

async function onRemoveProject(): Promise<void> {
  if (activeProjectID.value === null) {
    return
  }

  loading.value = true

  const projectIndex = JSON.parse(JSON.stringify(activeProjectID.value))

  activeProjectID.value = null

  await mainSession.onRemoveProject(projectIndex)
  loading.value = false
}
</script>
