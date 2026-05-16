<template>
  <h4>
    工作经历
    <button type="button" class="btn-add" data-testid="resume-editor-add-experience" @click="store.addExperience()">
      + 添加
    </button>
  </h4>

  <div v-for="(experience, index) in store.data.experience" :key="index" class="block-card">
    <input
      class="field-input"
      :data-testid="`resume-editor-experience-${index}-company`"
      :value="experience.company"
      placeholder="公司"
      @input="store.updateExperience(index, { company: ($event.target as HTMLInputElement).value })"
    />
    <input
      class="field-input"
      :data-testid="`resume-editor-experience-${index}-title`"
      :value="experience.title"
      placeholder="职位"
      @input="store.updateExperience(index, { title: ($event.target as HTMLInputElement).value })"
    />
    <input
      class="field-input"
      :data-testid="`resume-editor-experience-${index}-duration`"
      :value="experience.duration"
      placeholder="时间"
      @input="store.updateExperience(index, { duration: ($event.target as HTMLInputElement).value })"
    />
    <textarea
      class="field-textarea"
      :data-testid="`resume-editor-experience-${index}-details`"
      :value="experience.detailsRaw"
      placeholder="工作描述（每行一条）"
      rows="3"
      @input="store.setExperienceDetailsRaw(index, ($event.target as HTMLTextAreaElement).value)"
    />
    <button
      type="button"
      class="btn-remove"
      :data-testid="`resume-editor-experience-${index}-remove`"
      @click="store.removeExperience(index)"
    >
      删除
    </button>
  </div>
</template>

<script setup lang="ts">
import { useResumeStore } from '../../stores/resume'

const store = useResumeStore()
</script>
