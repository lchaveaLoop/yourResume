<template>
  <div class="template-switcher">
    <span class="switch-label">模板：</span>
    <div class="switch-options">
      <button v-for="t in templates" :key="t.value" class="switch-btn" :class="{ active: modelValue === t.value }"
        :data-testid="`template-option-${t.value}`" :aria-pressed="modelValue === t.value"
        @click="emit('update:modelValue', t.value)">
        {{ t.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CareerTemplate } from '../../types/resume'

defineProps<{ modelValue: CareerTemplate }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: CareerTemplate): void }>()

const templates = [
  { value: 'ats' as const, label: 'ATS 单栏' },
  { value: 'senior' as const, label: '高级工程师' },
  { value: 'long' as const, label: '长简历' },
  { value: 'marketing' as const, label: '市场商务' },
]
</script>

<style scoped>
.template-switcher {
  display: flex;
  align-items: center;
  gap: 12px;
}

.switch-label {
  font-size: 13px;
  color: #64748b;
  font-weight: 500;
}

.switch-options {
  display: flex;
  gap: 6px;
}

.switch-btn {
  padding: 6px 14px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  font-size: 13px;
  cursor: pointer;
  color: #475569;
  transition: all 0.15s;
}

.switch-btn:hover {
  border-color: #4a6cf5;
  color: #4a6cf5;
}

.switch-btn.active {
  background: #0f2742;
  border-color: #0f2742;
  color: #fff;
}
</style>
