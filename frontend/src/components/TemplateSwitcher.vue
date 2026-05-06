<template>
  <div class="template-switcher">
    <span class="switch-label">模板：</span>
    <div class="switch-options">
      <button v-for="t in templates" :key="t.value" class="switch-btn" :class="{ active: modelValue === t.value }"
        @click="emit('update:modelValue', t.value)">
        {{ t.label }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ modelValue: 'classic' | 'modern' | 'minimal' }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: 'classic' | 'modern' | 'minimal'): void }>()

const templates = [
  { value: 'classic' as const, label: '📋 经典' },
  { value: 'modern' as const, label: '🚀 现代' },
  { value: 'minimal' as const, label: '✏️ 简约' },
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
  background: #4a6cf5;
  border-color: #4a6cf5;
  color: #fff;
}
</style>
