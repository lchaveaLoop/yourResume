<template>
  <div class="template-switcher" aria-label="简历模板">
    <span class="switch-label">模板</span>
    <div class="switch-options">
      <button
        v-for="t in templates"
        :key="t.value"
        class="switch-btn"
        :class="{ active: modelValue === t.value }"
        :style="{ '--template-accent': t.accent }"
        :data-testid="`template-option-${t.value}`"
        :aria-pressed="modelValue === t.value"
        :title="t.description"
        type="button"
        @click="emit('update:modelValue', t.value)"
      >
        <span class="accent-bar" aria-hidden="true"></span>
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
import {
  Cpu,
  GraduationCap,
  Landmark,
  LayoutTemplate,
  Megaphone,
  PanelsTopLeft,
} from 'lucide-vue-next'
import type { Component } from 'vue'
import type { CareerTemplate } from '../../types/resume'

defineProps<{ modelValue: CareerTemplate }>()
const emit = defineEmits<{ (e: 'update:modelValue', v: CareerTemplate): void }>()

const templates: Array<{
  value: CareerTemplate
  label: string
  caption: string
  description: string
  accent: string
  icon: Component
}> = [
  {
    value: 'base',
    label: '通用基础',
    caption: 'ATS 友好',
    description: '极高可读性的通用投递模板',
    accent: '#2e3440',
    icon: LayoutTemplate,
  },
  {
    value: 'tech',
    label: '技术研发',
    caption: '结构清晰',
    description: '适合工程师、研发和技术负责人',
    accent: '#0f6f8f',
    icon: Cpu,
  },
  {
    value: 'product',
    label: '产品增长',
    caption: '协作导向',
    description: '适合产品、增长和数据协作岗位',
    accent: '#2d8064',
    icon: PanelsTopLeft,
  },
  {
    value: 'marketing',
    label: '市场品牌',
    caption: '表达质感',
    description: '适合市场、品牌、商务和运营岗位',
    accent: '#a46f35',
    icon: Megaphone,
  },
  {
    value: 'finance',
    label: '金融专业',
    caption: '稳重克制',
    description: '适合金融、财务、审计和投研岗位',
    accent: '#17614d',
    icon: Landmark,
  },
  {
    value: 'education',
    label: '教育学术',
    caption: '书卷秩序',
    description: '适合教育、教研、学术和培训岗位',
    accent: '#4f5f9d',
    icon: GraduationCap,
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
  font-weight: 850;
}

.switch-options {
  display: flex;
  gap: 7px;
  max-width: min(760px, 56vw);
  overflow-x: auto;
  padding: 2px 2px 5px;
}

.switch-btn {
  --template-accent: var(--color-brand);
  position: relative;
  display: inline-grid;
  grid-template-columns: 4px 16px max-content;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 7px 11px 7px 8px;
  color: var(--color-muted);
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  box-shadow: 0 8px 20px rgba(15, 23, 42, 0.04);
  cursor: pointer;
  transition:
    background 0.16s ease,
    border-color 0.16s ease,
    color 0.16s ease,
    box-shadow 0.16s ease,
    transform 0.16s ease;
}

.switch-btn:hover {
  color: var(--color-ink);
  border-color: var(--template-accent);
  box-shadow: 0 12px 26px rgba(15, 23, 42, 0.09);
  transform: translateY(-1px);
}

.switch-btn.active {
  color: var(--color-ink-strong);
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.94)),
    #fff;
  border-color: var(--template-accent);
  box-shadow:
    0 14px 30px rgba(15, 23, 42, 0.12),
    inset 0 0 0 1px rgba(255, 255, 255, 0.86);
}

.accent-bar {
  width: 4px;
  height: 26px;
  background: var(--template-accent);
  border-radius: 99px;
}

.switch-btn .icon {
  width: 16px;
  height: 16px;
  color: var(--template-accent);
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
  font-weight: 700;
  line-height: 1;
  opacity: 0.62;
  white-space: nowrap;
}

@media (max-width: 1240px) {
  .switch-options {
    max-width: 48vw;
  }

  .switch-copy small {
    display: none;
  }
}
</style>
