<template>
  <div class="resume-preview" ref="resumeRef">
    <!-- Classic 模板 -->
    <div v-if="template === 'classic'" class="template-classic">
      <header class="resume-header">
        <div class="header-content">
          <div class="header-text">
            <h1 class="name">{{ resume.name || '姓名' }}</h1>
            <div class="contact-line" v-if="hasContact">
              <span v-if="resume.email">📧 {{ resume.email }}</span>
              <span v-if="resume.phone">📱 {{ resume.phone }}</span>
              <span v-if="resume.location">📍 {{ resume.location }}</span>
            </div>
            <p class="summary" v-if="resume.summary">{{ resume.summary }}</p>
          </div>
          <img v-if="resume.photo" :src="resume.photo" class="avatar" alt="照片" />
        </div>
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
          <div>
            <h1 class="modern-name">{{ resume.name || '姓名' }}</h1>
            <div class="modern-contact" v-if="hasContact">
              <span v-if="resume.email">{{ resume.email }}</span>
              <span v-if="resume.phone">{{ resume.phone }}</span>
              <span v-if="resume.location">{{ resume.location }}</span>
            </div>
            <p class="modern-summary" v-if="resume.summary">{{ resume.summary }}</p>
          </div>
          <img v-if="resume.photo" :src="resume.photo" class="modern-avatar" alt="照片" />
        </div>
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
    <div v-else-if="template === 'minimal'" class="template-minimal">
      <header class="min-header">
        <div class="min-header-content">
          <div>
            <h1 class="min-name">{{ resume.name || '姓名' }}</h1>
            <div class="min-contact" v-if="hasContact">
              <span v-if="resume.email">{{ resume.email }}</span>
              <span v-if="resume.phone">{{ resume.phone }}</span>
              <span v-if="resume.location">{{ resume.location }}</span>
            </div>
          </div>
          <img v-if="resume.photo" :src="resume.photo" class="min-avatar" alt="照片" />
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

    <!-- Compact 模板 -->
    <div v-else-if="template === 'compact'" class="template-compact">
      <header class="cp-header">
        <div class="cp-header-inner">
          <div>
            <h1 class="cp-name">{{ resume.name || '姓名' }}</h1>
            <div class="cp-contact" v-if="hasContact">
              <span v-if="resume.email">{{ resume.email }}</span>
              <span v-if="resume.phone">{{ resume.phone }}</span>
              <span v-if="resume.location">{{ resume.location }}</span>
            </div>
          </div>
          <img v-if="resume.photo" :src="resume.photo" class="cp-avatar" alt="照片" />
        </div>
      </header>

      <div class="cp-sections">
        <section v-if="resume.experience.length" class="cp-section">
          <h2 class="cp-section-title">工作经历</h2>
          <div v-for="(item, i) in resume.experience" :key="i" class="cp-item">
            <div class="cp-item-row">
              <strong>{{ item.company }}</strong>
              <span class="cp-meta">{{ item.title }} · {{ item.duration }}</span>
            </div>
            <ul class="cp-list" v-if="item.details.length">
              <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
            </ul>
          </div>
        </section>

        <section v-if="resume.projects.length" class="cp-section">
          <h2 class="cp-section-title">项目经历</h2>
          <div v-for="(item, i) in resume.projects" :key="i" class="cp-item">
            <div class="cp-item-row">
              <strong>{{ item.name }}</strong>
              <span class="cp-meta">{{ item.role }} · {{ item.duration }}</span>
            </div>
            <ul class="cp-list" v-if="item.details.length">
              <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
            </ul>
          </div>
        </section>

        <section v-if="resume.education.length" class="cp-section">
          <h2 class="cp-section-title">教育背景</h2>
          <div v-for="(item, i) in resume.education" :key="i" class="cp-item">
            <div class="cp-item-row">
              <strong>{{ item.school }}</strong>
              <span class="cp-meta">{{ item.degree }} · {{ item.duration }}</span>
            </div>
            <div class="cp-detail" v-if="item.details">{{ item.details }}</div>
          </div>
        </section>

        <section v-if="resume.skills.length" class="cp-section">
          <h2 class="cp-section-title">技能</h2>
          <p class="cp-skills">{{ resume.skills.join(' · ') }}</p>
        </section>
      </div>
    </div>

    <!-- Timeline 模板 -->
    <div v-else-if="template === 'timeline'" class="template-timeline">
      <header class="tl-header">
        <div class="tl-header-inner">
          <div>
            <h1 class="tl-name">{{ resume.name || '姓名' }}</h1>
            <div class="tl-contact" v-if="hasContact">
              <span v-if="resume.email">{{ resume.email }}</span>
              <span v-if="resume.phone">{{ resume.phone }}</span>
              <span v-if="resume.location">{{ resume.location }}</span>
            </div>
            <p class="tl-summary" v-if="resume.summary">{{ resume.summary }}</p>
          </div>
          <img v-if="resume.photo" :src="resume.photo" class="tl-avatar" alt="照片" />
        </div>
      </header>

      <section v-if="resume.experience.length || resume.projects.length" class="tl-section">
        <h2 class="tl-section-title">经历</h2>
        <div class="tl-timeline">
          <div v-for="(item, i) in [...resume.experience, ...resume.projects]" :key="i" class="tl-entry">
            <div class="tl-marker">
              <div class="tl-dot"></div>
            </div>
            <div class="tl-content">
              <div class="tl-entry-header">
                <strong>{{ (item as any).company || (item as any).name }}</strong>
                <span class="tl-meta">{{ (item as any).title || (item as any).role }}</span>
              </div>
              <div class="tl-duration">{{ item.duration }}</div>
              <ul class="tl-list" v-if="item.details.length">
                <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section v-if="resume.education.length" class="tl-section">
        <h2 class="tl-section-title">教育</h2>
        <div v-for="(item, i) in resume.education" :key="i" class="tl-edu-row">
          <strong>{{ item.school }}</strong>
          <span>{{ item.degree }} · {{ item.duration }}</span>
        </div>
      </section>

      <section v-if="resume.skills.length" class="tl-section">
        <h2 class="tl-section-title">技能</h2>
        <p class="tl-skills">{{ resume.skills.join(' · ') }}</p>
      </section>
    </div>

    <!-- Bold 模板 -->
    <div v-else class="template-bold">
      <div class="bd-accent"></div>
      <header class="bd-header">
        <div class="bd-header-inner">
          <div>
            <h1 class="bd-name">{{ resume.name || '姓名' }}</h1>
            <div class="bd-contact" v-if="hasContact">
              <span v-if="resume.email">{{ resume.email }}</span>
              <span class="bd-sep" v-if="resume.email && (resume.phone || resume.location)">|</span>
              <span v-if="resume.phone">{{ resume.phone }}</span>
              <span class="bd-sep" v-if="resume.phone && resume.location">|</span>
              <span v-if="resume.location">{{ resume.location }}</span>
            </div>
          </div>
          <img v-if="resume.photo" :src="resume.photo" class="bd-avatar" alt="照片" />
        </div>
      </header>

      <div class="bd-body">
        <section v-if="resume.experience.length" class="bd-section">
          <h2 class="bd-section-title"><span class="bd-num">01</span> 工作经历</h2>
          <div v-for="(item, i) in resume.experience" :key="i" class="bd-item">
            <div class="bd-item-header">
              <div>
                <strong class="bd-item-title">{{ item.company }}</strong>
                <div class="bd-item-sub">{{ item.title }}</div>
              </div>
              <span class="bd-duration">{{ item.duration }}</span>
            </div>
            <ul class="bd-list" v-if="item.details.length">
              <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
            </ul>
          </div>
        </section>

        <section v-if="resume.projects.length" class="bd-section">
          <h2 class="bd-section-title"><span class="bd-num">02</span> 项目经历</h2>
          <div v-for="(item, i) in resume.projects" :key="i" class="bd-item">
            <div class="bd-item-header">
              <div>
                <strong class="bd-item-title">{{ item.name }}</strong>
                <div class="bd-item-sub">{{ item.role }}</div>
              </div>
              <span class="bd-duration">{{ item.duration }}</span>
            </div>
            <ul class="bd-list" v-if="item.details.length">
              <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
            </ul>
          </div>
        </section>

        <div class="bd-bottom-grid">
          <section v-if="resume.education.length" class="bd-section">
            <h2 class="bd-section-title"><span class="bd-num">03</span> 教育</h2>
            <div v-for="(item, i) in resume.education" :key="i" class="bd-edu-row">
              <strong>{{ item.school }}</strong>
              <span>{{ item.degree }} · {{ item.duration }}</span>
            </div>
          </section>

          <section v-if="resume.skills.length" class="bd-section">
            <h2 class="bd-section-title"><span class="bd-num">04</span> 技能</h2>
            <div class="bd-skills">
              <span v-for="(s, i) in resume.skills" :key="i" class="bd-skill-tag">{{ s }}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { ResumeData } from '../types/resume'

const props = defineProps<{
  resume: ResumeData
  template: 'classic' | 'modern' | 'minimal' | 'compact' | 'timeline' | 'bold'
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

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.header-text {
  flex: 1;
}

.avatar {
  width: 90px;
  height: 120px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
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

.modern-name-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.modern-avatar {
  width: 80px;
  height: 100px;
  object-fit: cover;
  border-radius: 4px;
  border: 2px solid #fff;
  flex-shrink: 0;
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
  margin-bottom: 8px;
}

.min-header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.min-avatar {
  width: 70px;
  height: 90px;
  object-fit: cover;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  flex-shrink: 0;
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

/* ===== Compact ===== */
.template-compact {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.cp-header {
  border-bottom: 2px solid #1a1a2e;
  padding-bottom: 8px;
}

.cp-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.cp-avatar {
  width: 60px;
  height: 80px;
  object-fit: cover;
  border-radius: 3px;
  flex-shrink: 0;
}

.cp-name {
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 2px;
}

.cp-contact {
  display: flex;
  gap: 10px;
  font-size: 9px;
  color: #64748b;
  flex-wrap: wrap;
}

.cp-sections {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cp-section {
  break-inside: avoid;
}

.cp-section-title {
  font-size: 11px;
  font-weight: 700;
  color: #1a1a2e;
  padding-bottom: 2px;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 4px;
}

.cp-item {
  margin-bottom: 4px;
}

.cp-item-row {
  display: flex;
  justify-content: space-between;
  font-size: 10px;
  line-height: 1.5;
}

.cp-meta {
  font-size: 9px;
  color: #94a3b8;
  text-align: right;
  flex-shrink: 0;
  margin-left: 8px;
}

.cp-list {
  margin: 1px 0 0 12px;
  font-size: 9px;
  color: #475569;
  line-height: 1.5;
}

.cp-detail {
  font-size: 9px;
  color: #64748b;
  margin-left: 12px;
}

.cp-skills {
  font-size: 10px;
  color: #475569;
}

/* ===== Timeline ===== */
.template-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.tl-header {
  margin-bottom: 4px;
}

.tl-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.tl-avatar {
  width: 80px;
  height: 105px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.tl-name {
  font-size: 26px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 4px;
  color: #1a1a2e;
}

.tl-contact {
  display: flex;
  gap: 12px;
  font-size: 10px;
  color: #64748b;
  flex-wrap: wrap;
}

.tl-summary {
  font-size: 11px;
  color: #475569;
  margin-top: 6px;
  line-height: 1.6;
}

.tl-section {
  break-inside: avoid;
}

.tl-section-title {
  font-size: 12px;
  font-weight: 700;
  color: #4a6cf5;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-bottom: 1px solid #e2e8f0;
  padding-bottom: 4px;
  margin-bottom: 10px;
}

.tl-timeline {
  position: relative;
  padding-left: 0;
}

.tl-entry {
  display: flex;
  gap: 14px;
  position: relative;
  padding-bottom: 14px;
}

.tl-entry:last-child {
  padding-bottom: 0;
}

.tl-marker {
  position: relative;
  width: 16px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.tl-marker::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: -18px;
  left: 50%;
  width: 2px;
  background: #e2e8f0;
  transform: translateX(-50%);
}

.tl-entry:last-child .tl-marker::before {
  display: none;
}

.tl-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #4a6cf5;
  border: 2px solid #fff;
  box-shadow: 0 0 0 2px #4a6cf5;
  margin-top: 2px;
  flex-shrink: 0;
}

.tl-content {
  flex: 1;
  min-width: 0;
}

.tl-entry-header {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  gap: 8px;
}

.tl-meta {
  font-size: 10px;
  color: #94a3b8;
  flex-shrink: 0;
}

.tl-duration {
  font-size: 9px;
  color: #4a6cf5;
  margin-bottom: 4px;
}

.tl-list {
  margin: 4px 0 0 14px;
  font-size: 10px;
  color: #475569;
  line-height: 1.7;
}

.tl-edu-row {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  margin-bottom: 4px;
}

.tl-skills {
  font-size: 11px;
  color: #475569;
}

/* ===== Bold ===== */
.template-bold {
  display: flex;
  flex-direction: column;
  position: relative;
}

.bd-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 6px;
  background: linear-gradient(90deg, #4a6cf5, #7c3aed);
  border-radius: 3px 3px 0 0;
}

.bd-header {
  padding-top: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #1a1a2e;
  margin-bottom: 14px;
}

.bd-header-inner {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}

.bd-avatar {
  width: 90px;
  height: 115px;
  object-fit: cover;
  border-radius: 4px;
  flex-shrink: 0;
}

.bd-name {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #1a1a2e;
  margin-bottom: 4px;
}

.bd-contact {
  display: flex;
  gap: 8px;
  font-size: 11px;
  color: #64748b;
  flex-wrap: wrap;
  align-items: center;
}

.bd-sep {
  color: #cbd5e1;
}

.bd-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.bd-section {
  break-inside: avoid;
}

.bd-section-title {
  font-size: 13px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.bd-num {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  font-size: 9px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #4a6cf5, #7c3aed);
  border-radius: 4px;
}

.bd-item {
  margin-bottom: 10px;
}

.bd-item-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.bd-item-title {
  font-size: 12px;
  color: #1a1a2e;
}

.bd-item-sub {
  font-size: 10px;
  color: #64748b;
  margin-top: 1px;
}

.bd-duration {
  font-size: 10px;
  color: #7c3aed;
  font-weight: 600;
  white-space: nowrap;
}

.bd-list {
  margin: 4px 0 0 16px;
  font-size: 10px;
  color: #475569;
  line-height: 1.7;
}

.bd-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.bd-edu-row {
  display: flex;
  flex-direction: column;
  font-size: 11px;
  margin-bottom: 6px;
  gap: 2px;
}

.bd-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.bd-skill-tag {
  background: #1a1a2e;
  color: #fff;
  font-size: 10px;
  padding: 3px 10px;
  border-radius: 12px;
}
</style>
