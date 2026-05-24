<template>
  <section class="editor-group">
    <h4>基本信息</h4>
    <div class="field-grid">
      <label class="field-pair">
        <span class="field-label">姓名</span>
        <input
          class="field-input"
          data-testid="resume-editor-name"
          :value="store.data.name"
          placeholder="姓名"
          @input="update('name', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="field-pair">
        <span class="field-label">邮箱</span>
        <input
          class="field-input"
          data-testid="resume-editor-email"
          :value="store.data.email"
          placeholder="email@example.com"
          @input="update('email', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="field-pair">
        <span class="field-label">电话</span>
        <input
          class="field-input"
          data-testid="resume-editor-phone"
          :value="store.data.phone"
          placeholder="138-0000-0000"
          @input="update('phone', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="field-pair">
        <span class="field-label">城市</span>
        <input
          class="field-input"
          data-testid="resume-editor-location"
          :value="store.data.location"
          placeholder="上海"
          @input="update('location', ($event.target as HTMLInputElement).value)"
        />
      </label>

      <label class="field-pair">
        <span class="field-label">目标岗位</span>
        <input
          class="field-input"
          data-testid="resume-editor-target-role"
          :value="store.data.targetRole"
          placeholder="例如：前端开发工程师 / 市场经理"
          @input="update('targetRole', ($event.target as HTMLInputElement).value)"
        />
      </label>
    </div>
  </section>

  <section class="editor-group">
    <h4>职业摘要</h4>
    <label class="field-pair">
      <span class="field-label">一句话定位</span>
      <textarea
        class="field-textarea"
        data-testid="resume-editor-summary"
        :value="store.data.summary"
        placeholder="用 1-2 句话概括经验、方向和代表性成果"
        rows="3"
        @input="update('summary', ($event.target as HTMLTextAreaElement).value)"
      />
    </label>
  </section>
</template>

<script setup lang="ts">
import { useResumeStore } from '../../stores/resume'
import type { ResumeData } from '../../types/resume'

type EditableTextField = 'name' | 'email' | 'phone' | 'location' | 'targetRole' | 'summary'

const store = useResumeStore()

function update(key: EditableTextField, value: string) {
  store.updateField(key, value as ResumeData[typeof key])
}
</script>
