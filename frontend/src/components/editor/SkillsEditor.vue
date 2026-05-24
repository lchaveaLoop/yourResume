<template>
  <section class="editor-group">
    <h4>
      技能
      <button type="button" class="btn-add" data-testid="resume-editor-add-skill" @click="store.addSkill()">
        <Plus class="icon" aria-hidden="true" />
        添加
      </button>
    </h4>

    <div class="skills-editor">
      <div v-for="(_, index) in store.data.skills" :key="index" class="skill-row">
        <input
          class="field-input"
          :data-testid="`resume-editor-skill-${index}`"
          :value="store.data.skills[index]"
          placeholder="技能名称"
          @input="store.updateSkill(index, ($event.target as HTMLInputElement).value)"
        />
        <button
          type="button"
          class="btn-remove-sm"
          :data-testid="`resume-editor-skill-${index}-remove`"
          aria-label="删除技能"
          @click="store.removeSkill(index)"
        >
          <Trash2 class="icon" aria-hidden="true" />
        </button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { Plus, Trash2 } from 'lucide-vue-next'
import { useResumeStore } from '../../stores/resume'

const store = useResumeStore()
</script>
