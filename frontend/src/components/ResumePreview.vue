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
      <section v-if="resume.experience.length || resume.projects.length" class="min-section">
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

/* ===== Enhanced template system ===== */
.resume-preview {
  position: relative;
  overflow: hidden;
  border-radius: 2px;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.22);
  line-height: 1.55;
}

.resume-preview::before {
  content: '';
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: 0.38;
  background-image:
    linear-gradient(rgba(15, 23, 42, 0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(15, 23, 42, 0.018) 1px, transparent 1px);
  background-size: 14px 14px;
}

.resume-preview > div {
  position: relative;
  z-index: 1;
}

.item-list li,
.main-list li,
.min-list li,
.cp-list li,
.tl-list li,
.bd-list li {
  padding-left: 2px;
}

.item-list li::marker,
.main-list li::marker,
.min-list li::marker,
.cp-list li::marker,
.tl-list li::marker,
.bd-list li::marker {
  color: currentColor;
}

/* Classic: crisp executive letterhead */
.template-classic {
  gap: 14px;
}

.template-classic .resume-header {
  position: relative;
  border-bottom: 0;
  padding: 18px 20px 16px;
  margin: -8px -8px 2px;
  color: #f8fafc;
  background:
    linear-gradient(135deg, rgba(11, 31, 58, 0.98), rgba(28, 61, 90, 0.98)),
    radial-gradient(circle at 100% 0%, rgba(218, 165, 32, 0.28), transparent 36%);
}

.template-classic .resume-header::after {
  content: '';
  position: absolute;
  left: 20px;
  right: 20px;
  bottom: 0;
  height: 3px;
  background: linear-gradient(90deg, #d9a441, transparent);
}

.template-classic .name {
  margin-bottom: 7px;
  color: #fff;
  font-family: Georgia, 'Times New Roman', 'Microsoft YaHei', serif;
  font-size: 30px;
  letter-spacing: 0;
}

.template-classic .contact-line,
.template-classic .summary {
  color: rgba(248, 250, 252, 0.78);
}

.template-classic .avatar {
  width: 86px;
  height: 112px;
  border: 2px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 14px 28px rgba(2, 6, 23, 0.26);
}

.template-classic .section {
  gap: 7px;
}

.template-classic .section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 0;
  color: #0b1f3a;
  font-size: 12px;
  letter-spacing: 0.08em;
}

.template-classic .section-title::before {
  content: '';
  width: 18px;
  height: 3px;
  background: #d9a441;
}

.template-classic .item {
  padding: 9px 0 9px 12px;
  border-left: 2px solid #e5e7eb;
}

.template-classic .item-title {
  color: #0f172a;
  font-size: 12.5px;
}

.template-classic .item-meta {
  color: #667085;
}

/* Modern: editorial two-column resume */
.template-modern {
  min-height: calc(var(--resume-height, 297mm) - 40mm);
  margin: -20mm;
  background: #fbf7ef;
}

.template-modern .modern-header {
  padding: 24px 26px 22px;
  border-radius: 0;
  color: #17202a;
  background:
    linear-gradient(90deg, rgba(251, 247, 239, 0.96), rgba(236, 225, 207, 0.96)),
    linear-gradient(135deg, rgba(22, 87, 97, 0.12), transparent);
  border-bottom: 1px solid rgba(23, 32, 42, 0.16);
}

.template-modern .modern-name {
  color: #17202a;
  font-family: Georgia, 'Times New Roman', 'Microsoft YaHei', serif;
  font-size: 34px;
  letter-spacing: 0;
}

.template-modern .modern-contact {
  gap: 8px;
  color: #6f4e37;
}

.template-modern .modern-contact span {
  padding: 3px 7px;
  border: 1px solid rgba(111, 78, 55, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.45);
}

.template-modern .modern-summary {
  max-width: 430px;
  color: #475467;
}

.template-modern .modern-avatar {
  width: 86px;
  height: 112px;
  border: 1px solid rgba(23, 32, 42, 0.22);
  box-shadow: 8px 8px 0 #165761;
}

.template-modern .modern-body {
  grid-template-columns: 165px 1fr;
}

.template-modern .modern-sidebar {
  padding: 20px 15px 22px 24px;
  background: #165761;
  color: #effaf8;
  border-right: 0;
}

.template-modern .modern-sidebar h3 {
  color: #f3d58b;
  letter-spacing: 0.12em;
}

.template-modern .sidebar-list,
.template-modern .sidebar-item,
.template-modern .sidebar-item strong,
.template-modern .meta {
  color: rgba(255, 255, 255, 0.84);
}

.template-modern .sidebar-list li {
  padding: 4px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.template-modern .modern-main {
  padding: 20px 24px 24px;
  background: #fbf7ef;
}

.template-modern .main-section-title {
  border-bottom: 1px solid rgba(23, 32, 42, 0.16);
  color: #165761;
  letter-spacing: 0.08em;
}

.template-modern .main-item {
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(23, 32, 42, 0.08);
}

.template-modern .main-item-header strong {
  color: #17202a;
  font-size: 12px;
}

.template-modern .main-meta {
  color: #6f4e37;
}

/* Minimal: premium monochrome */
.template-minimal {
  gap: 13px;
  color: #1f2937;
}

.template-minimal .min-header {
  padding-bottom: 14px;
  border-bottom: 1px solid #111827;
}

.template-minimal .min-name {
  color: #111827;
  font-family: Georgia, 'Times New Roman', 'Microsoft YaHei', serif;
  font-size: 33px;
  letter-spacing: 0;
}

.template-minimal .min-contact {
  margin-top: 6px;
  gap: 8px;
  color: #4b5563;
  flex-wrap: wrap;
}

.template-minimal .min-contact span:not(:last-child)::after {
  content: '/';
  margin-left: 8px;
  color: #9ca3af;
}

.template-minimal .min-avatar {
  width: 76px;
  height: 96px;
  border-radius: 0;
  filter: grayscale(100%);
}

.template-minimal .min-summary {
  max-width: 88%;
  color: #374151;
  font-size: 11.5px;
}

.template-minimal .min-divider {
  display: none;
}

.template-minimal .min-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 10px;
  border-top: 1px solid #e5e7eb;
}

.template-minimal .min-section-title {
  display: flex;
  align-items: center;
  gap: 10px;
  color: #111827;
  letter-spacing: 0.14em;
}

.template-minimal .min-section-title::after {
  content: '';
  flex: 1;
  height: 1px;
  background: #e5e7eb;
}

.template-minimal .min-item-row {
  gap: 14px;
  align-items: baseline;
  padding-top: 2px;
}

.template-minimal .min-list {
  margin-bottom: 8px;
}

/* Compact: dense ATS-friendly page with polish */
.template-compact {
  gap: 7px;
}

.template-compact .cp-header {
  margin: -6px -6px 4px;
  padding: 12px 14px;
  border: 1px solid #d7dee8;
  background: #f8fafc;
}

.template-compact .cp-name {
  color: #0f172a;
  font-size: 25px;
  letter-spacing: 0;
}

.template-compact .cp-contact {
  margin-top: 3px;
  color: #475569;
}

.template-compact .cp-avatar {
  width: 58px;
  height: 76px;
  border: 1px solid #cbd5e1;
}

.template-compact .cp-section {
  padding: 5px 0 6px;
  border-bottom: 1px solid #e2e8f0;
}

.template-compact .cp-section-title {
  display: inline-flex;
  padding: 2px 7px;
  border: 1px solid #cbd5e1;
  border-bottom: 1px solid #cbd5e1;
  color: #0f172a;
  background: #f8fafc;
  font-size: 10px;
  letter-spacing: 0.08em;
}

.template-compact .cp-item-row strong {
  color: #111827;
}

.template-compact .cp-list {
  columns: 1;
}

/* Timeline: refined career chronology */
.template-timeline {
  gap: 15px;
}

.template-timeline .tl-header {
  padding: 16px 18px;
  margin: -8px -8px 0;
  border: 1px solid rgba(63, 82, 67, 0.18);
  background:
    linear-gradient(135deg, rgba(243, 247, 239, 0.96), rgba(255, 255, 255, 0.96)),
    radial-gradient(circle at 90% 10%, rgba(168, 111, 70, 0.16), transparent 40%);
}

.template-timeline .tl-name {
  color: #253528;
  font-family: Georgia, 'Times New Roman', 'Microsoft YaHei', serif;
  font-size: 31px;
  letter-spacing: 0;
}

.template-timeline .tl-contact {
  color: #687568;
}

.template-timeline .tl-summary {
  max-width: 450px;
  color: #475447;
}

.template-timeline .tl-avatar {
  border: 4px solid #fff;
  box-shadow: 0 0 0 1px rgba(63, 82, 67, 0.18), 0 12px 30px rgba(63, 82, 67, 0.18);
}

.template-timeline .tl-section-title {
  border-bottom: 0;
  color: #253528;
  letter-spacing: 0.1em;
}

.template-timeline .tl-section-title::after {
  content: '';
  display: block;
  width: 46px;
  height: 2px;
  margin-top: 4px;
  background: #a86f46;
}

.template-timeline .tl-marker::before {
  background: #d7dfd2;
}

.template-timeline .tl-dot {
  background: #a86f46;
  box-shadow: 0 0 0 3px #f3f7ef;
  border-color: #fff;
}

.template-timeline .tl-content {
  padding: 9px 10px;
  border: 1px solid #e3e9de;
  background: rgba(255, 255, 255, 0.66);
}

.template-timeline .tl-duration {
  color: #a86f46;
  font-weight: 700;
}

/* Bold: magazine cover energy */
.template-bold {
  min-height: calc(var(--resume-height, 297mm) - 40mm);
  margin: -20mm;
  padding: 18mm;
  color: #f8fafc;
  background:
    linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(39, 31, 50, 0.98)),
    radial-gradient(circle at 85% 10%, rgba(239, 68, 68, 0.32), transparent 34%);
}

.template-bold .bd-accent {
  top: 18mm;
  left: 18mm;
  right: auto;
  width: 78px;
  height: 5px;
  background: #f97316;
  border-radius: 0;
}

.template-bold .bd-header {
  padding-top: 18px;
  border-bottom: 1px solid rgba(248, 250, 252, 0.24);
}

.template-bold .bd-name {
  max-width: 420px;
  color: #fff;
  font-family: Georgia, 'Times New Roman', 'Microsoft YaHei', serif;
  font-size: 38px;
  line-height: 1.02;
  letter-spacing: 0;
}

.template-bold .bd-contact {
  color: rgba(248, 250, 252, 0.72);
}

.template-bold .bd-avatar {
  width: 94px;
  height: 118px;
  border: 2px solid rgba(249, 115, 22, 0.72);
  box-shadow: 10px 10px 0 rgba(249, 115, 22, 0.32);
}

.template-bold .bd-body {
  gap: 16px;
}

.template-bold .bd-section-title {
  color: #fff;
}

.template-bold .bd-num {
  background: #f97316;
  color: #111827;
  border-radius: 0;
}

.template-bold .bd-item {
  padding: 10px 12px;
  border: 1px solid rgba(248, 250, 252, 0.14);
  background: rgba(255, 255, 255, 0.045);
}

.template-bold .bd-item-title,
.template-bold .bd-edu-row strong {
  color: #fff;
}

.template-bold .bd-item-sub,
.template-bold .bd-list,
.template-bold .bd-edu-row span {
  color: rgba(248, 250, 252, 0.74);
}

.template-bold .bd-duration {
  color: #f97316;
}

.template-bold .bd-bottom-grid {
  gap: 14px;
}

.template-bold .bd-skill-tag {
  border-radius: 0;
  background: #f8fafc;
  color: #111827;
}
</style>
