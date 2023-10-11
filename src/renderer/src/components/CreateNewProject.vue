<template>
  <div class="modal fade" id="createNewProjectModal" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h1 class="modal-title fs-5">Create new project</h1>
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
          <div class="mb-3">
            <label class="form-label">Project name</label>
            <input type="email" v-model="newProjectData.name" class="form-control" placeholder="examplename" />
          </div>
          <div class="mb-3">
            <label class="form-label">Docker Port (2000-9999)</label>
            <input type="number" v-model="newProjectData.dockerPort" class="form-control" />
          </div>
          <div v-if="validation.newProject" class="text-danger" v-text="validation.newProject"></div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary" @click="onCreateNewProject()">Create new project</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { mainSession } from '../data/MainSession'
import { ProjectIF } from '../data/Project'

const validation = ref({
  newProject: null
})

const newProjectData = ref<ProjectIF>({
  name: '',
  dockerPort: 8000
})

function onCreateNewProject() {
  mainSession.onCreateNewProject(newProjectData.value).catch((err) => {
    validation.value.newProject = err
  })

  validation.value.newProject = null
}
</script>
