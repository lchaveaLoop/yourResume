<template>
  <section class="editor-group">
    <h4>
      项目经历
      <button type="button" class="btn-add" data-testid="resume-editor-add-project" @click="store.addProject()">
        <Plus class="icon" aria-hidden="true" />
        添加
      </button>
    </h4>

    <div v-for="(project, index) in store.data.projects" :key="index" class="block-card">
      <input
        class="field-input"
        :data-testid="`resume-editor-project-${index}-name`"
        :value="project.name"
        placeholder="项目名"
        @input="store.updateProject(index, { name: ($event.target as HTMLInputElement).value })"
      />
      <input
        class="field-input"
        :data-testid="`resume-editor-project-${index}-role`"
        :value="project.role"
        placeholder="角色"
        @input="store.updateProject(index, { role: ($event.target as HTMLInputElement).value })"
      />
      <input
        class="field-input"
        :data-testid="`resume-editor-project-${index}-duration`"
        :value="project.duration"
        placeholder="时间"
        @input="store.updateProject(index, { duration: ($event.target as HTMLInputElement).value })"
      />
      <textarea
        class="field-textarea"
        :data-testid="`resume-editor-project-${index}-details`"
        :value="project.detailsRaw"
        placeholder="项目描述（每行一条，建议突出职责、方案和结果）"
        rows="3"
        @input="store.setProjectDetailsRaw(index, ($event.target as HTMLTextAreaElement).value)"
      />
      <button
        type="button"
        class="btn-remove"
        :data-testid="`resume-editor-project-${index}-remove`"
        @click="store.removeProject(index)"
      >
        <Trash2 class="icon" aria-hidden="true" />
        删除
      </button>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { useResumeStore } from '../../stores/resume'

const store = useResumeStore()
</script>
