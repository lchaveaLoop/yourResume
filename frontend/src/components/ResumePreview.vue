<template>
  <div class="resume-preview" ref="resumeRef">
    <article v-if="template === 'ats'" class="resume-template template-ats">
      <header class="ats-header">
        <div class="profile-copy">
          <div class="identity-row">
            <h1>{{ displayName }}</h1>
            <p>{{ displayRole }}</p>
          </div>
          <div class="contact-line" v-if="hasContact">
            <span v-if="resume.location">{{ resume.location }}</span>
            <span v-if="resume.phone">{{ resume.phone }}</span>
            <span v-if="resume.email">{{ resume.email }}</span>
          </div>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="photo photo-ats" alt="照片" />
      </header>

      <section v-if="resume.summary" class="section">
        <h2>职业摘要</h2>
        <p class="summary-text">{{ resume.summary }}</p>
      </section>

      <section v-if="resume.skills.length" class="section">
        <h2>核心技能</h2>
        <div class="skill-pills">
          <span v-for="(skill, i) in resume.skills" :key="i">{{ skill }}</span>
        </div>
      </section>

      <section v-if="resume.experience.length" class="section">
        <h2>工作经历</h2>
        <div v-for="(item, i) in resume.experience" :key="i" class="timeline-row compact-row">
          <span class="date">{{ item.duration }}</span>
          <strong>{{ item.company }}</strong>
          <span class="role">{{ item.title }}</span>
        </div>
      </section>

      <section v-if="resume.projects.length" class="section">
        <h2>项目经历</h2>
        <div v-for="(item, i) in resume.projects" :key="i" class="entry">
          <div class="entry-head">
            <strong>{{ item.name }}</strong>
            <span>{{ item.duration }}</span>
          </div>
          <p v-if="item.role" class="entry-subtitle">{{ item.role }}</p>
          <ul v-if="item.details.length">
            <li v-for="(detail, j) in limitedDetails(item.details, 4)" :key="j">{{ detail }}</li>
          </ul>
        </div>
      </section>

      <section v-if="resume.education.length" class="section">
        <h2>教育经历</h2>
        <div v-for="(item, i) in resume.education" :key="i" class="timeline-row compact-row">
          <span class="date">{{ item.duration }}</span>
          <strong>{{ item.school }}</strong>
          <span class="role">{{ item.degree }}</span>
        </div>
      </section>
    </article>

    <article v-else-if="template === 'senior'" class="resume-template template-senior">
      <header class="senior-hero">
        <div>
          <h1>{{ displayName }}</h1>
          <p>{{ seniorRole }}</p>
          <div class="contact-line" v-if="hasContact">
            <span v-if="resume.location">{{ resume.location }}</span>
            <span v-if="resume.phone">{{ resume.phone }}</span>
            <span v-if="resume.email">{{ resume.email }}</span>
          </div>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="photo photo-senior" alt="照片" />
      </header>

      <section class="metric-row" v-if="metrics.length">
        <div v-for="metric in metrics" :key="metric.label" class="metric-card">
          <strong>{{ metric.value }}</strong>
          <span>{{ metric.label }}</span>
        </div>
      </section>

      <div class="senior-grid">
        <main>
          <section v-if="resume.summary" class="section">
            <h2>工程影响力摘要</h2>
            <p class="summary-text">{{ resume.summary }}</p>
          </section>

          <section v-if="resume.projects.length" class="section">
            <div v-for="(item, i) in resume.projects" :key="i" class="impact-entry">
              <div class="impact-rule"></div>
              <div class="entry-head stacked-head">
                <strong>{{ item.name }}</strong>
                <span>{{ item.duration }}</span>
              </div>
              <p v-if="item.role" class="entry-subtitle">{{ item.role }}</p>
              <ul v-if="item.details.length">
                <li v-for="(detail, j) in limitedDetails(item.details, 3)" :key="j">{{ detail }}</li>
              </ul>
            </div>
          </section>
        </main>

        <aside class="senior-side">
          <section v-if="capabilities.length" class="side-section">
            <h2>核心能力</h2>
            <ul>
              <li v-for="cap in capabilities" :key="cap">{{ cap }}</li>
            </ul>
          </section>

          <section v-if="resume.skills.length" class="side-section">
            <h2>技术栈</h2>
            <div class="plain-list">
              <span v-for="(skill, i) in resume.skills" :key="i">{{ skill }}</span>
            </div>
          </section>

          <section v-if="resume.education.length" class="side-section">
            <h2>教育</h2>
            <div v-for="(item, i) in resume.education" :key="i" class="side-item">
              <strong>{{ item.school }}</strong>
              <span>{{ item.degree }}</span>
              <small>{{ item.duration }}</small>
            </div>
          </section>
        </aside>
      </div>
    </article>

    <article v-else-if="template === 'long'" class="resume-template template-long">
      <header class="long-header">
        <div class="profile-copy">
          <div class="identity-row">
            <h1>{{ displayName }}</h1>
            <p>{{ displayRole }}</p>
          </div>
          <div class="contact-line" v-if="hasContact">
            <span v-if="resume.location">{{ resume.location }}</span>
            <span v-if="resume.phone">{{ resume.phone }}</span>
            <span v-if="resume.email">{{ resume.email }}</span>
          </div>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="photo photo-long" alt="照片" />
      </header>

      <section v-if="resume.summary" class="section">
        <h2>职业摘要</h2>
        <p class="summary-text">{{ resume.summary }}</p>
      </section>

      <section v-if="resume.skills.length" class="section">
        <h2>核心技能</h2>
        <p class="inline-skills">{{ resume.skills.join(' · ') }}</p>
      </section>

      <section v-if="resume.projects.length" class="section">
        <h2>项目经历</h2>
        <div v-for="(item, i) in resume.projects" :key="i" class="entry long-entry">
          <div class="entry-head">
            <strong>{{ item.name }}</strong>
            <span>{{ item.duration }}</span>
          </div>
          <p v-if="item.role" class="entry-subtitle">{{ item.role }}</p>
          <ul v-if="item.details.length">
            <li v-for="(detail, j) in item.details" :key="j">{{ detail }}</li>
          </ul>
        </div>
      </section>

      <section v-if="resume.experience.length" class="section">
        <h2>工作经历</h2>
        <div v-for="(item, i) in resume.experience" :key="i" class="timeline-row">
          <span class="date">{{ item.duration }}</span>
          <div>
            <strong>{{ item.company }}</strong>
            <p>{{ item.title }}</p>
            <ul v-if="item.details.length">
              <li v-for="(detail, j) in item.details" :key="j">{{ detail }}</li>
            </ul>
          </div>
        </div>
      </section>

      <section v-if="resume.education.length" class="section">
        <h2>教育经历</h2>
        <div v-for="(item, i) in resume.education" :key="i" class="timeline-row compact-row">
          <span class="date">{{ item.duration }}</span>
          <strong>{{ item.school }}</strong>
          <span class="role">{{ item.degree }}</span>
        </div>
      </section>
    </article>

    <article v-else class="resume-template template-marketing">
      <header class="mk-hero">
        <div class="mk-profile">
          <p class="template-kicker">Business Resume</p>
          <h1>{{ displayName }}</h1>
          <p class="target-role">{{ resume.targetRole || '市场商务岗位' }}</p>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="photo mk-avatar" alt="照片" />
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
              <li v-for="(d, j) in limitedDetails(item.details, 3)" :key="j">{{ d }}</li>
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

const displayName = computed(() => props.resume.name || '姓名')
const displayRole = computed(() => props.resume.targetRole || '目标岗位')
const seniorRole = computed(() => {
  const role = props.resume.targetRole || 'C/C++ 开发工程师'
  return role.includes('高级') ? role : `高级 ${role}`
})
const hasContact = computed(() =>
  props.resume.email || props.resume.phone || props.resume.location
)

const metrics = computed(() => {
  const text = [
    props.resume.summary,
    ...props.resume.projects.flatMap(item => item.details),
    ...props.resume.experience.flatMap(item => item.details),
  ].join(' ')
  const values = Array.from(new Set(text.match(/\d+(?:\.\d+)?%?\+?/g) ?? []))
  const labels = ['关键成果', '性能改善', '交付影响']
  return values.slice(0, 3).map((value, index) => ({ value, label: labels[index] }))
})

const capabilities = computed(() => {
  const preferred = ['架构', '数据', '跨平台', 'Web', '集成', '算法', '性能', '交付']
  const text = props.resume.skills.join(' ')
  const fromSkills = props.resume.skills.filter(skill =>
    preferred.some(key => skill.toLowerCase().includes(key.toLowerCase()))
  )
  const fallback = preferred
    .filter(key => text.includes(key))
    .map(key => `${key}能力`)
  return Array.from(new Set([...fromSkills, ...fallback, ...props.resume.skills])).slice(0, 6)
})

function limitedDetails(details: string[], limit: number) {
  return details.slice(0, limit)
}
</script>

<style scoped>
.resume-preview {
  --resume-width: 210mm;
  --resume-height: 297mm;
  --ink: #172033;
  --muted: #5f6b7a;
  --blue: #174a78;
  --blue-dark: #142f4a;
  --blue-soft: #eef5fb;
  --rule: #d3dce7;
  --paper: #ffffff;
  --business: #2f2b3f;
  --brass: #9a6a34;
  --business-paper: #fffdf8;

  width: var(--resume-width);
  min-height: var(--resume-height);
  background: var(--paper);
  color: var(--ink);
  box-shadow: 0 18px 60px rgba(15, 23, 42, 0.18);
  border-radius: 2px;
  overflow: hidden;
  line-height: 1.48;
}

.resume-template {
  min-height: var(--resume-height);
  padding: 16mm 18mm;
  font-size: 10.5px;
  overflow-wrap: anywhere;
  background: #fff;
}

h1,
h2,
p,
ul {
  margin: 0;
}

h1 {
  font-size: 30px;
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: 0;
}

h2 {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 12px;
  margin-bottom: 7px;
  color: var(--blue);
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
}

h2::after {
  content: '';
  height: 1px;
  background: var(--rule);
}

ul {
  padding-left: 14px;
  break-inside: avoid;
}

li {
  margin-top: 2.5px;
}

.section,
.entry,
.impact-entry,
.mk-section,
.mk-entry,
.mk-compact-entry,
.mk-edu,
.side-section,
.side-item,
.timeline-row {
  break-inside: avoid;
  page-break-inside: avoid;
}

.section {
  margin-top: 13px;
}

.photo {
  object-fit: cover;
  flex-shrink: 0;
  background: #f8fafc;
}

.contact-line {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: var(--muted);
  font-size: 10px;
}

.contact-line span:not(:last-child)::after {
  content: '·';
  margin-left: 8px;
  color: #a7b0bb;
}

.summary-text {
  color: #2f3b4a;
  font-size: 11.3px;
  line-height: 1.72;
}

.entry {
  margin-top: 8px;
}

.entry-head {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: baseline;
}

.entry-head strong {
  color: #172033;
  font-size: 12.8px;
}

.entry-head span,
.entry-subtitle,
.date,
.role {
  color: var(--muted);
}

.entry-head span,
.date {
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}

.entry-subtitle {
  margin-top: 2px;
  font-weight: 700;
}

.skill-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.skill-pills span {
  padding: 3px 9px;
  color: #173d62;
  background: #f5f9fd;
  border: 1px solid #cbdceb;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
}

.timeline-row {
  display: grid;
  grid-template-columns: 135px 1fr;
  gap: 12px;
  margin-top: 7px;
}

.compact-row {
  grid-template-columns: 135px 1.1fr 1.6fr;
  align-items: baseline;
}

/* Scheme 1: ATS single column */
.template-ats {
  padding-top: 15mm;
}

.ats-header,
.long-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  padding-bottom: 13px;
  border-bottom: 3px solid var(--blue);
}

.identity-row {
  display: flex;
  align-items: baseline;
  gap: 20px;
}

.identity-row p {
  color: var(--blue);
  font-size: 15px;
  font-weight: 800;
}

.profile-copy {
  min-width: 0;
}

.profile-copy .contact-line {
  margin-top: 11px;
}

.photo-ats,
.photo-long {
  width: 25mm;
  height: 32mm;
  border: 1px solid #c9d6e4;
}

.template-ats li,
.template-long li {
  color: #354455;
}

/* Scheme 4: senior engineer impact */
.template-senior {
  padding: 0;
  background: #f4f7fa;
}

.senior-hero {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 17mm 18mm 13mm;
  color: #fff;
  background: var(--blue-dark);
  border-bottom: 5px solid #6aa6cf;
}

.senior-hero h1 {
  color: #fff;
}

.senior-hero p {
  margin-top: 5px;
  color: #d9ebf7;
  font-size: 15px;
  font-weight: 800;
}

.senior-hero .contact-line {
  margin-top: 11px;
  color: #c7d7e3;
}

.senior-hero .contact-line span:not(:last-child)::after {
  color: #89a8bd;
}

.photo-senior {
  width: 24mm;
  height: 24mm;
  border-radius: 50%;
  border: 3px solid #97c4e0;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10mm;
  padding: 10mm 18mm 8mm;
}

.metric-card {
  padding: 8mm 7mm;
  background: #fff;
  border: 1px solid #d5dee8;
  border-radius: 6px;
}

.metric-card strong {
  display: block;
  color: #145884;
  font-size: 24px;
  line-height: 1;
}

.metric-card span {
  display: block;
  margin-top: 4px;
  color: #566272;
  font-size: 11px;
  font-weight: 800;
}

.senior-grid {
  display: grid;
  grid-template-columns: 1fr 62mm;
  gap: 9mm;
  padding: 6mm 18mm 16mm;
}

.template-senior .section {
  margin-top: 0;
  margin-bottom: 12px;
}

.impact-entry {
  margin-top: 10px;
}

.impact-rule {
  height: 5px;
  margin-bottom: 9px;
  background: #d3e2ed;
  border-radius: 2px;
}

.stacked-head {
  display: block;
}

.stacked-head span {
  display: block;
  margin-top: 2px;
}

.senior-side {
  padding: 8mm 7mm;
  background: #fff;
  border: 1px solid #d5dee8;
  border-radius: 7px;
}

.side-section {
  margin-bottom: 14px;
}

.side-section h2 {
  display: block;
  margin-bottom: 7px;
}

.side-section h2::after {
  display: none;
}

.side-section ul {
  padding-left: 13px;
}

.plain-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
  color: #334155;
}

.side-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 8px;
}

.side-item small,
.side-item span {
  color: var(--muted);
}

/* Scheme 8: long resume, export-safe multipage */
.template-long {
  padding-top: 14mm;
}

.template-long .section {
  margin-top: 12px;
}

.template-long .summary-text {
  line-height: 1.66;
}

.inline-skills {
  color: #2f3b4a;
  line-height: 1.68;
}

.long-entry {
  padding-top: 2px;
  margin-top: 10px;
}

.long-entry + .long-entry {
  padding-top: 9px;
  border-top: 1px solid #e1e7ef;
}

.template-long .timeline-row p {
  color: var(--muted);
  font-weight: 700;
}

/* Marketing business template */
.template-marketing {
  color: #2b211d;
  background: var(--business-paper);
}

.template-kicker {
  margin: 0 0 6px;
  color: var(--brass);
  font-size: 8.6px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.target-role {
  margin-top: 5px;
  color: #74502d;
  font-size: 12.5px;
  font-weight: 700;
}

.mk-hero {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 14px;
  border-bottom: 2px solid var(--business);
}

.mk-hero h1 {
  color: var(--business);
  font-size: 33px;
}

.mk-avatar {
  width: 25mm;
  height: 32mm;
  border: 1px solid #b99561;
  box-shadow: 6px 6px 0 #ead9bf;
}

.mk-contact {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin: 9px 0 14px;
  padding: 6px 0;
  color: #5f5750;
  border-bottom: 1px solid #ead8bd;
  font-size: 9.7px;
}

.mk-summary {
  display: grid;
  grid-template-columns: 104px 1fr;
  gap: 15px;
  margin-bottom: 14px;
}

.template-marketing h2 {
  display: block;
  color: var(--business);
  font-size: 10.5px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.template-marketing h2::after {
  display: none;
}

.mk-summary p {
  color: #51413a;
  font-size: 10.8px;
}

.mk-section {
  margin-bottom: 13px;
}

.mk-section h2 {
  margin-bottom: 7px;
  padding-bottom: 4px;
  border-bottom: 1px solid #d9bf98;
}

.mk-entry {
  margin-bottom: 9px;
  padding-bottom: 8px;
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
  font-size: 11.4px;
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
  font-size: 9.4px;
}

.template-marketing li {
  color: #51413a;
}

.mk-two-col {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 18px;
  align-items: start;
}

.mk-compact-entry,
.mk-edu {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-bottom: 9px;
}

.mk-skills {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.mk-skills span {
  padding: 3px 7px;
  color: var(--business);
  background: #f5ead9;
  border: 1px solid #d9bf98;
  border-radius: 999px;
  font-size: 9.3px;
}
</style>
