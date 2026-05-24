<template>
  <div class="template-switcher" aria-label="简历模板">
    <span class="switch-label">模板</span>
    <div class="switch-options">
      <button
        v-for="t in templates"
        :key="t.value"
        class="switch-btn"
        :class="{ active: modelValue === t.value }"
        :data-testid="`template-option-${t.value}`"
        :aria-pressed="modelValue === t.value"
        :title="t.description"
        @click="emit('update:modelValue', t.value)"
      >
        <component :is="t.icon" class="icon" aria-hidden="true" />
        <span class="switch-copy">
          <strong>{{ t.label }}</strong>
          <small>{{ t.caption }}</small>
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { AlignJustify, Award, BriefcaseBusiness, ScrollText } from 'lucide-vue-next'
import type { Component } from 'vue'
import type { CareerTemplate } from '../../types/resume'

defineProps<{ modelValue: CareerTemplate }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: CareerTemplate): void }>()

const templates: Array<{
  value: CareerTemplate
  label: string
  caption: string
  description: string
  icon: Component
}> = [
  {
    value: 'ats',
    label: 'ATS 单栏',
    caption: '清晰投递',
    description: '适合机器筛选和标准岗位投递',
    icon: AlignJustify,
  },
  {
    value: 'senior',
    label: '工程影响力',
    caption: '成果突出',
    description: '适合高级工程师和技术负责人',
    icon: Award,
  },
  {
    value: 'long',
    label: '长履历',
    caption: '多页友好',
    description: '适合经历较多的候选人',
    icon: ScrollText,
  },
  {
    value: 'marketing',
    label: '商务出版',
    caption: '品牌质感',
    description: '适合市场、商务和运营岗位',
    icon: BriefcaseBusiness,
  },
]
</script>

<style scoped>
.template-switcher {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.switch-label {
  color: var(--color-muted);
  font-size: 12px;
  font-weight: 800;
}

.switch-options {
  display: flex;
  gap: 6px;
}

.switch-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 42px;
  padding: 7px 10px;
  color: var(--color-muted);
  background: #fff;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease;
}

.switch-btn:hover {
  color: var(--color-brand);
  border-color: var(--color-border-strong);
  box-shadow: 0 8px 18px rgba(15, 23, 42, 0.07);
}

.switch-btn.active {
  color: #fff;
  background: var(--color-brand);
  border-color: var(--color-brand);
  box-shadow: 0 12px 26px rgba(16, 38, 63, 0.22);
}

.switch-btn .icon {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.switch-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
  text-align: left;
}

.switch-copy strong {
  font-size: 12px;
  font-weight: 850;
  line-height: 1;
  white-space: nowrap;
}

.switch-copy small {
  color: currentColor;
  font-size: 10px;
  font-weight: 650;
  line-height: 1;
  opacity: 0.66;
  white-space: nowrap;
}

@media (max-width: 1240px) {
  .switch-copy small {
    display: none;
  }
}

@media (max-width: 720px) {
  .template-switcher {
    align-items: flex-start;
    flex-direction: column;
    width: 100%;
  }

  .switch-options {
    width: 100%;
    overflow-x: auto;
    padding-bottom: 4px;
  }
}
</style>
