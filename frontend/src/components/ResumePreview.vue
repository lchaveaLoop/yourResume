<template>
  <div class="resume-preview" ref="resumeRef">
    <article v-if="template === 'it'" class="resume-template template-it">
      <header class="it-hero">
        <div class="hero-copy">
          <p class="template-kicker">Technical Resume</p>
          <h1>{{ resume.name || '姓名' }}</h1>
          <p class="target-role">{{ resume.targetRole || 'IT 技术岗位' }}</p>
          <div class="contact-row" v-if="hasContact">
            <span v-if="resume.email">{{ resume.email }}</span>
            <span v-if="resume.phone">{{ resume.phone }}</span>
            <span v-if="resume.location">{{ resume.location }}</span>
          </div>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="avatar it-avatar" alt="照片" />
      </header>

      <section v-if="resume.summary" class="it-summary">
        {{ resume.summary }}
      </section>

      <div class="it-grid">
        <main class="it-main">
          <section v-if="resume.projects.length" class="resume-section">
            <h2>项目经历</h2>
            <div v-for="(item, i) in resume.projects" :key="i" class="it-card">
              <div class="item-head">
                <strong>{{ item.name }}</strong>
                <span>{{ item.duration }}</span>
              </div>
              <p v-if="item.role" class="item-subtitle">{{ item.role }}</p>
              <ul v-if="item.details.length">
                <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
              </ul>
            </div>
          </section>

          <section v-if="resume.experience.length" class="resume-section">
            <h2>工作经历</h2>
            <div v-for="(item, i) in resume.experience" :key="i" class="it-card">
              <div class="item-head">
                <strong>{{ item.company }}</strong>
                <span>{{ item.duration }}</span>
              </div>
              <p v-if="item.title" class="item-subtitle">{{ item.title }}</p>
              <ul v-if="item.details.length">
                <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
              </ul>
            </div>
          </section>
        </main>

        <aside class="it-side">
          <section v-if="resume.skills.length" class="side-block">
            <h2>技能栈</h2>
            <div class="skill-stack">
              <span v-for="(skill, i) in resume.skills" :key="i">{{ skill }}</span>
            </div>
          </section>

          <section v-if="resume.education.length" class="side-block">
            <h2>教育背景</h2>
            <div v-for="(item, i) in resume.education" :key="i" class="side-item">
              <strong>{{ item.school }}</strong>
              <span>{{ item.degree }}</span>
              <small>{{ item.duration }}</small>
              <small v-if="item.details">{{ item.details }}</small>
            </div>
          </section>
        </aside>
      </div>
    </article>

    <article v-else class="resume-template template-marketing">
      <header class="mk-hero">
        <div class="mk-profile">
          <p class="template-kicker">Business Resume</p>
          <h1>{{ resume.name || '姓名' }}</h1>
          <p class="target-role">{{ resume.targetRole || '市场商务岗位' }}</p>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="avatar mk-avatar" alt="照片" />
      </header>

      <div class="mk-contact" v-if="hasContact">
        <span v-if="resume.email">{{ resume.email }}</span>
        <span v-if="resume.phone">{{ resume.phone }}</span>
        <span v-if="resume.location">{{ resume.location }}</span>
      </div>

      <section v-if="resume.summary" class="mk-summary">
        <h2>职业摘要</h2>
        <p>{{ resume.summary }}</p>
      </section>

      <section v-if="resume.experience.length" class="mk-section">
        <h2>工作经历</h2>
        <div v-for="(item, i) in resume.experience" :key="i" class="mk-entry">
          <div class="mk-entry-head">
            <div>
              <strong>{{ item.company }}</strong>
              <p>{{ item.title }}</p>
            </div>
            <span>{{ item.duration }}</span>
          </div>
          <ul v-if="item.details.length">
            <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
          </ul>
        </div>
      </section>

      <div class="mk-two-col">
        <section v-if="resume.projects.length" class="mk-section">
          <h2>项目成果</h2>
          <div v-for="(item, i) in resume.projects" :key="i" class="mk-compact-entry">
            <strong>{{ item.name }}</strong>
            <span>{{ item.role }} · {{ item.duration }}</span>
            <ul v-if="item.details.length">
              <li v-for="(d, j) in item.details" :key="j">{{ d }}</li>
            </ul>
          </div>
        </section>

        <aside>
          <section v-if="resume.skills.length" class="mk-section">
            <h2>核心能力</h2>
            <div class="mk-skills">
              <span v-for="(skill, i) in resume.skills" :key="i">{{ skill }}</span>
            </div>
          </section>

          <section v-if="resume.education.length" class="mk-section">
            <h2>教育背景</h2>
            <div v-for="(item, i) in resume.education" :key="i" class="mk-edu">
              <strong>{{ item.school }}</strong>
              <span>{{ item.degree }}</span>
              <small>{{ item.duration }}</small>
              <small v-if="item.details">{{ item.details }}</small>
            </div>
          </section>
        </aside>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { CareerTemplate, ResumeData } from '../types/resume'

const props = defineProps<{
  resume: ResumeData
  template: CareerTemplate
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
  color: #172033;
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.2);
  border-radius: 2px;
  overflow: hidden;
  line-height: 1.55;
}

.resume-template {
  min-height: var(--resume-height, 297mm);
  padding: 18mm;
  font-size: 10.6px;
}

.template-kicker {
  margin: 0 0 6px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

h1,
h2,
p,
ul {
  margin: 0;
}

h1 {
  font-family: Georgia, 'Times New Roman', 'Microsoft YaHei', serif;
  font-size: 33px;
  line-height: 1.05;
  letter-spacing: 0;
}

h2 {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

ul {
  padding-left: 14px;
}

li {
  margin-top: 3px;
}

.avatar {
  object-fit: cover;
  flex-shrink: 0;
}

.target-role {
  margin-top: 6px;
  font-size: 13px;
  font-weight: 700;
}

.contact-row,
.mk-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* IT technical template */
.template-it {
  background:
    linear-gradient(90deg, #f8fbff 0%, #ffffff 42%),
    linear-gradient(#e8eef7 1px, transparent 1px),
    linear-gradient(90deg, #eef3f8 1px, transparent 1px);
  background-size: auto, 18px 18px, 18px 18px;
}

.it-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 16px 18px;
  color: #eef8ff;
  background: #0f2742;
  border-left: 5px solid #38bdf8;
}

.it-hero h1 {
  color: #ffffff;
}

.it-hero .template-kicker {
  color: #7dd3fc;
}

.it-hero .target-role {
  color: #c7eefc;
}

.it-hero .contact-row {
  margin-top: 10px;
  color: #b7c9d9;
}

.it-avatar {
  width: 80px;
  height: 102px;
  border: 2px solid rgba(125, 211, 252, 0.7);
}

.it-summary {
  margin: 14px 0;
  padding: 10px 12px;
  color: #24364c;
  background: rgba(226, 242, 252, 0.82);
  border: 1px solid #c9e5f4;
}

.it-grid {
  display: grid;
  grid-template-columns: 1fr 168px;
  gap: 16px;
  align-items: start;
}

.it-main,
.it-side {
  display: flex;
  flex-direction: column;
  gap: 13px;
}

.resume-section,
.side-block {
  break-inside: avoid;
}

.template-it h2 {
  margin-bottom: 8px;
  color: #0f2742;
  border-bottom: 1px solid #bfd7ea;
  padding-bottom: 4px;
}

.it-card {
  margin-bottom: 9px;
  padding: 8px 0 8px 10px;
  border-left: 2px solid #38bdf8;
}

.item-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: baseline;
}

.item-head strong {
  font-size: 11.5px;
  color: #102033;
}

.item-head span,
.item-subtitle {
  color: #60758a;
}

.item-head span {
  font-size: 9.5px;
  white-space: nowrap;
}

.item-subtitle {
  margin-top: 2px;
  font-weight: 700;
}

.template-it li {
  color: #3c5065;
}

.skill-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-stack span {
  padding: 3px 7px;
  color: #0f2742;
  background: #e6f4fb;
  border: 1px solid #b8dced;
  border-radius: 3px;
  font-size: 9.5px;
}

.side-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 9px;
  color: #3f5268;
}

.side-item strong {
  color: #172033;
}

.side-item small {
  color: #718399;
}

/* Marketing business template */
.template-marketing {
  color: #2b211d;
  background:
    linear-gradient(90deg, #fffaf2 0%, #fff 52%),
    linear-gradient(180deg, rgba(177, 127, 62, 0.1), transparent 28%);
}

.mk-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 16px;
  border-bottom: 2px solid #2d2b45;
}

.mk-hero .template-kicker {
  color: #a66f2f;
}

.mk-hero h1 {
  color: #2d2b45;
  font-size: 36px;
}

.mk-hero .target-role {
  color: #7a4d2a;
}

.mk-avatar {
  width: 86px;
  height: 108px;
  border: 1px solid #c6a16e;
  box-shadow: 8px 8px 0 #ead8bd;
}

.mk-contact {
  margin: 10px 0 16px;
  padding: 7px 0;
  color: #5f5750;
  border-bottom: 1px solid #ead8bd;
}

.mk-summary {
  display: grid;
  grid-template-columns: 112px 1fr;
  gap: 18px;
  margin-bottom: 16px;
}

.template-marketing h2 {
  color: #2d2b45;
}

.mk-summary p {
  color: #51413a;
  font-size: 11.2px;
}

.mk-section {
  margin-bottom: 15px;
  break-inside: avoid;
}

.mk-section h2 {
  margin-bottom: 9px;
  padding-bottom: 4px;
  border-bottom: 1px solid #d9bf98;
}

.mk-entry {
  margin-bottom: 11px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(217, 191, 152, 0.58);
}

.mk-entry-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
}

.mk-entry-head strong,
.mk-compact-entry strong,
.mk-edu strong {
  color: #2b211d;
  font-size: 11.8px;
}

.mk-entry-head p,
.mk-entry-head span,
.mk-compact-entry span,
.mk-edu span,
.mk-edu small {
  color: #7a6558;
}

.mk-entry-head span {
  white-space: nowrap;
  font-size: 9.5px;
}

.template-marketing li {
  color: #51413a;
}

.mk-two-col {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 20px;
  align-items: start;
}

.mk-compact-entry,
.mk-edu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 10px;
}

.mk-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mk-skills span {
  padding: 4px 8px;
  color: #2d2b45;
  background: #f5e7d2;
  border: 1px solid #d9bf98;
  border-radius: 999px;
  font-size: 9.5px;
}
</style>
