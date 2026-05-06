<template>
  <div class="resume-preview" ref="resumeRef">
    <!-- Classic 模板 -->
    <div v-if="template === 'classic'" class="template-classic">
      <header class="resume-header">
        <h1 class="name">{{ resume.name || '姓名' }}</h1>
        <div class="contact-line" v-if="hasContact">
          <span v-if="resume.email">📧 {{ resume.email }}</span>
          <span v-if="resume.phone">📱 {{ resume.phone }}</span>
          <span v-if="resume.location">📍 {{ resume.location }}</span>
        </div>
        <p class="summary" v-if="resume.summary">{{ resume.summary }}</p>
      </header>

      <section class="section" v-if="resume.education.length">
        <h2 class="section-title">教育背景</h2>
        <div class="item" v-for="(item, i) in resume.education" :key="i">
          <div class="item-header">
            <span class="item-title">{{ item.school }}</span>
            <span class="item-meta">{{ item.duration }}</span>
          </div>
          <div class="item-body">{{ item.degree }}<span v-if="item.details"> · {{ item.details }}</span></div>
        </div>
      </section>

      <section class="section" v-if="resume.experience.length">
        <h2 class="section-title">工作经历</h2>
        <div class="item" v-for="(item, i) in resume.experience" :key="i">
          <div class="item-header">
            <span class="item-title">{{ item.company }}</span>
            <span class="item-meta">{{ item.title }} · {{ item.duration }}</span>
          </div>
          <ul class="item-list" v-if="item.details.length">
            <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
          </ul>
        </div>
      </section>

      <section class="section" v-if="resume.projects.length">
        <h2 class="section-title">项目经历</h2>
        <div class="item" v-for="(item, i) in resume.projects" :key="i">
          <div class="item-header">
            <span class="item-title">{{ item.name }}</span>
            <span class="item-meta">{{ item.role }} · {{ item.duration }}</span>
          </div>
          <ul class="item-list" v-if="item.details.length">
            <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
          </ul>
        </div>
      </section>

      <section class="section" v-if="resume.skills.length">
        <h2 class="section-title">技能特长</h2>
        <div class="skills-wrap">
          <span class="skill-tag" v-for="(s, i) in resume.skills" :key="i">{{ s }}</span>
        </div>
      </section>
    </div>

    <!-- Modern 模板 -->
    <div v-else-if="template === 'modern'" class="template-modern">
      <header class="modern-header">
        <div class="modern-name-row">
          <h1 class="modern-name">{{ resume.name || '姓名' }}</h1>
        </div>
        <div class="modern-contact" v-if="hasContact">
          <span v-if="resume.email">{{ resume.email }}</span>
          <span v-if="resume.phone">{{ resume.phone }}</span>
          <span v-if="resume.location">{{ resume.location }}</span>
        </div>
        <p class="modern-summary" v-if="resume.summary">{{ resume.summary }}</p>
      </header>

      <div class="modern-body">
        <aside class="modern-sidebar">
          <section v-if="resume.skills.length">
            <h3>技能</h3>
            <ul class="sidebar-list">
              <li v-for="(s, i) in resume.skills" :key="i">{{ s }}</li>
            </ul>
          </section>
          <section v-if="resume.education.length">
            <h3>教育</h3>
            <div v-for="(e, i) in resume.education" :key="i" class="sidebar-item">
              <strong>{{ e.school }}</strong>
              <span>{{ e.degree }}</span>
              <span class="meta">{{ e.duration }}</span>
            </div>
          </section>
        </aside>
        <main class="modern-main">
          <section v-if="resume.experience.length">
            <h3 class="main-section-title">工作经历</h3>
            <div v-for="(item, i) in resume.experience" :key="i" class="main-item">
              <div class="main-item-header">
                <strong>{{ item.company }}</strong>
                <span class="main-meta">{{ item.title }} · {{ item.duration }}</span>
              </div>
              <ul class="main-list">
                <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
              </ul>
            </div>
          </section>
          <section v-if="resume.projects.length">
            <h3 class="main-section-title">项目经历</h3>
            <div v-for="(item, i) in resume.projects" :key="i" class="main-item">
              <div class="main-item-header">
                <strong>{{ item.name }}</strong>
                <span class="main-meta">{{ item.role }} · {{ item.duration }}</span>
              </div>
              <ul class="main-list">
                <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
              </ul>
            </div>
          </section>
        </main>
      </div>
    </div>

    <!-- Minimal 模板 -->
    <div v-else class="template-minimal">
      <header class="min-header">
        <h1 class="min-name">{{ resume.name || '姓名' }}</h1>
        <div class="min-contact" v-if="hasContact">
          <span v-if="resume.email">{{ resume.email }}</span>
          <span v-if="resume.phone">{{ resume.phone }}</span>
          <span v-if="resume.location">{{ resume.location }}</span>
        </div>
      </header>
      <p class="min-summary" v-if="resume.summary">{{ resume.summary }}</p>
      <hr class="min-divider" />
      <section v-if="resume.experience.length" class="min-section">
        <h2 class="min-section-title">经历</h2>
        <div v-for="(item, i) in [...resume.experience, ...resume.projects]" :key="i">
          <div class="min-item-row">
            <strong>{{ (item as any).company || (item as any).name }}</strong>
            <span>{{ (item as any).title || (item as any).role }} · {{ item.duration }}</span>
          </div>
          <ul class="min-list">
            <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
          </ul>
        </div>
      </section>
      <section v-if="resume.education.length" class="min-section">
        <h2 class="min-section-title">教育</h2>
        <div v-for="(e, i) in resume.education" :key="i" class="min-item-row">
          <strong>{{ e.school }}</strong>
          <span>{{ e.degree }} · {{ e.duration }}</span>
        </div>
      </section>
      <section v-if="resume.skills.length" class="min-section">
        <h2 class="min-section-title">技能</h2>
        <p class="min-skills">{{ resume.skills.join(' · ') }}</p>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ResumeData } from '../types/resume'

const props = defineProps<{
  resume: ResumeData
  template: 'classic' | 'modern' | 'minimal'
}>()

defineExpose({ el: () => resumeRef.value })

const resumeRef = ref<HTMLElement | null>(null)

const hasContact = computed(() =>
  props.resume.email || props.resume.phone || props.resume.location
)
</script>

<style scoped>
.resume-preview {
  width: var(--resume-width, 210mm);
  min-height: var(--resume-height, 297mm);
  background: #fff;
  padding: var(--resume-padding, 20mm);
  font-size: 12px;
  color: #1a1a2e;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  border-radius: 4px;
}

/* ===== Classic ===== */
.template-classic {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.resume-header {
  border-bottom: 2px solid #1a1a2e;
  padding-bottom: 12px;
}

.name {
  font-size: 28px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.contact-line {
  display: flex;
  gap: 16px;
  font-size: 11px;
  color: #64748b;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.summary {
  font-size: 11px;
  color: #475569;
  line-height: 1.6;
}

.section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 700;
  color: #4a6cf5;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
  margin-bottom: 4px;
}

.item {
  padding-left: 8px;
}

.item-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.item-title {
  font-weight: 600;
  font-size: 12px;
}

.item-meta {
  font-size: 10px;
  color: #94a3b8;
}

.item-body {
  font-size: 11px;
  color: #475569;
}

.item-list {
  margin: 4px 0 0 16px;
  font-size: 11px;
  color: #475569;
  line-height: 1.7;
}

.skills-wrap {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-tag {
  background: #eff6ff;
  color: #4a6cf5;
  font-size: 10px;
  padding: 3px 8px;
  border-radius: 4px;
  border: 1px solid #c7d2fe;
}

/* ===== Modern ===== */
.template-modern {
  display: flex;
  flex-direction: column;
}

.modern-header {
  background: #1a1a2e;
  color: #fff;
  padding: 20px;
  border-radius: 4px 4px 0 0;
}

.modern-name {
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 6px;
}

.modern-contact {
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #c7d2fe;
  flex-wrap: wrap;
  margin-bottom: 8px;
}

.modern-summary {
  font-size: 11px;
  color: #cbd5e1;
  line-height: 1.5;
}

.modern-body {
  display: grid;
  grid-template-columns: 140px 1fr;
  gap: 0;
}

.modern-sidebar {
  background: #f1f5f9;
  padding: 16px 12px;
  border-right: 1px solid #e2e8f0;
}

.modern-sidebar h3 {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #4a6cf5;
  margin-bottom: 8px;
  margin-top: 12px;
}

.modern-sidebar h3:first-child {
  margin-top: 0;
}

.sidebar-list {
  list-style: none;
  font-size: 10px;
  color: #475569;
  line-height: 1.8;
}

.sidebar-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
  font-size: 10px;
  color: #475569;
}

.sidebar-item strong {
  font-size: 11px;
  color: #1a1a2e;
}

.meta {
  color: #94a3b8;
}

.modern-main {
  padding: 16px 16px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.main-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #4a6cf5;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 3px;
  margin-bottom: 8px;
}

.main-item {
  margin-bottom: 10px;
}

.main-item-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
}

.main-item-header strong {
  color: #1a1a2e;
}

.main-meta {
  font-size: 10px;
  color: #94a3b8;
}

.main-list {
  margin: 4px 0 0 14px;
  font-size: 10px;
  color: #475569;
  line-height: 1.7;
}

/* ===== Minimal ===== */
.template-minimal {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.min-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.min-name {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.min-contact {
  display: flex;
  gap: 10px;
  font-size: 10px;
  color: #94a3b8;
}

.min-summary {
  font-size: 11px;
  color: #64748b;
  line-height: 1.6;
}

.min-divider {
  border: none;
  border-top: 1px solid #e2e8f0;
  margin: 4px 0;
}

.min-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.min-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #94a3b8;
}

.min-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 2px;
}

.min-list {
  margin-left: 14px;
  font-size: 10px;
  color: #64748b;
  line-height: 1.7;
}

.min-skills {
  font-size: 11px;
  color: #475569;
}
</style>
