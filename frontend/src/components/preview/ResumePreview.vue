<template>
  <div class="resume-preview" data-testid="resume-preview" ref="resumeRef">
    <article class="resume-template" :class="`template-${currentTemplate}`">
      <header class="resume-header">
        <div class="identity-block">
          <p class="template-rule" aria-hidden="true"></p>
          <h1 v-if="resume.name">{{ resume.name }}</h1>
          <p v-if="resume.targetRole" class="target-role">{{ resume.targetRole }}</p>
          <div class="contact-line" v-if="hasContact">
            <span v-if="resume.location">{{ resume.location }}</span>
            <span v-if="resume.phone">{{ resume.phone }}</span>
            <span v-if="resume.email">{{ resume.email }}</span>
          </div>
        </div>
        <img v-if="resume.photo" :src="resume.photo" class="photo" alt="照片" />
      </header>

      <div class="resume-body">
        <main class="resume-main">
          <section v-if="resume.summary" class="resume-section section-summary">
            <h2>职业摘要</h2>
            <p class="summary-text">{{ resume.summary }}</p>
          </section>

          <section v-if="resume.experience.length" class="resume-section">
            <h2>工作经历</h2>
            <div v-for="(item, i) in resume.experience" :key="i" class="resume-entry">
              <div class="entry-head">
                <div>
                  <strong>{{ item.company }}</strong>
                  <p v-if="item.title" class="entry-subtitle">{{ item.title }}</p>
                </div>
                <span v-if="item.duration" class="entry-date">{{ item.duration }}</span>
              </div>
              <ul v-if="item.details.length">
                <li v-for="(detail, j) in item.details" :key="j">{{ detail }}</li>
              </ul>
            </div>
          </section>

          <section v-if="resume.projects.length" class="resume-section">
            <h2>项目经历</h2>
            <div v-for="(item, i) in resume.projects" :key="i" class="resume-entry">
              <div class="entry-head">
                <div>
                  <strong>{{ item.name }}</strong>
                  <p v-if="item.role" class="entry-subtitle">{{ item.role }}</p>
                </div>
                <span v-if="item.duration" class="entry-date">{{ item.duration }}</span>
              </div>
              <ul v-if="item.details.length">
                <li v-for="(detail, j) in item.details" :key="j">{{ detail }}</li>
              </ul>
            </div>
          </section>
        </main>

        <aside class="resume-side">
          <section v-if="resume.skills.length" class="resume-section side-section">
            <h2>核心技能</h2>
            <div class="skill-list">
              <span v-for="(skill, i) in resume.skills" :key="i">{{ skill }}</span>
            </div>
          </section>

          <section v-if="resume.education.length" class="resume-section side-section">
            <h2>教育经历</h2>
            <div v-for="(item, i) in resume.education" :key="i" class="education-entry">
              <strong>{{ item.school }}</strong>
              <span v-if="item.degree">{{ item.degree }}</span>
              <small v-if="item.duration">{{ item.duration }}</small>
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
import type { CareerTemplate, ResumeData } from '../../types/resume'
import { normalizeCareerTemplate } from '../../utils/templates'

const props = defineProps<{
  resume: ResumeData
  template: CareerTemplate
}>()

defineExpose({ el: () => resumeRef.value })

const resumeRef = ref<HTMLElement | null>(null)

const currentTemplate = computed(() => normalizeCareerTemplate(props.template) ?? 'base')
const hasContact = computed(() =>
  props.resume.email || props.resume.phone || props.resume.location
)
</script>

<style scoped>
.resume-preview {
  --resume-width: 210mm;
  --resume-height: 297mm;
  width: var(--resume-width);
  min-height: var(--resume-height);
  min-height: 1123px;
  color: #172033;
  background: #fff !important;
  border-radius: 2px;
  box-shadow: 0 22px 70px rgba(15, 23, 42, 0.2);
  overflow: hidden;
}

.resume-preview.pdf-exporting {
  box-shadow: none;
}

.resume-preview.pdf-exporting .resume-template,
.resume-preview.pdf-exporting .template-marketing,
.resume-preview.pdf-exporting .template-education {
  background: #fff;
}

.resume-preview.pdf-exporting .resume-side,
.resume-preview.pdf-exporting .template-product .resume-entry,
.resume-preview.pdf-exporting .template-base .section-summary {
  background: #fff;
}

.resume-template {
  --resume-ink: #172033;
  --resume-muted: #5f6b7a;
  --resume-faint: #eef1f5;
  --resume-line: #d8e0ea;
  --resume-line-soft: #e8edf3;
  --resume-accent: #1f4d73;
  --resume-accent-strong: #10263f;
  --resume-accent-soft: #eef5fb;
  --resume-accent-border: #c9d9e8;
  --resume-paper: #ffffff;
  --resume-side: #f7f9fc;
  --resume-font-body: var(--font-sans);
  --resume-font-display: var(--font-sans);
  min-height: var(--resume-height);
  min-height: 1123px;
  padding: 16mm 17mm;
  color: var(--resume-ink);
  background:
    linear-gradient(90deg, var(--resume-accent) 0 3.2mm, transparent 3.2mm),
    var(--resume-paper);
  font-family: var(--resume-font-body);
  font-size: 10.7px;
  line-height: 1.52;
  overflow-wrap: anywhere;
}

.template-base {
  --resume-ink: #151923;
  --resume-muted: #596270;
  --resume-line: #d7dce4;
  --resume-line-soft: #e7ebf0;
  --resume-accent: #2e3440;
  --resume-accent-strong: #151923;
  --resume-accent-soft: #f2f4f7;
  --resume-accent-border: #d7dce4;
  --resume-side: #f7f8fa;
  padding-left: 18mm;
  background: var(--resume-paper);
}

.template-tech {
  --resume-ink: #102033;
  --resume-muted: #587083;
  --resume-line: #c7dcea;
  --resume-line-soft: #e3f0f6;
  --resume-accent: #0f6f8f;
  --resume-accent-strong: #0c3344;
  --resume-accent-soft: #eaf7fb;
  --resume-accent-border: #c5e2ea;
  --resume-side: #f1f9fc;
}

.template-product {
  --resume-ink: #16251f;
  --resume-muted: #5d7469;
  --resume-line: #cbded5;
  --resume-line-soft: #e4f0ea;
  --resume-accent: #2d8064;
  --resume-accent-strong: #173f35;
  --resume-accent-soft: #edf8f3;
  --resume-accent-border: #c9e6da;
  --resume-side: #f4fbf7;
}

.template-marketing {
  --resume-ink: #2b211d;
  --resume-muted: #80695c;
  --resume-line: #dec8a8;
  --resume-line-soft: #eadbc5;
  --resume-accent: #a46f35;
  --resume-accent-strong: #3b2c25;
  --resume-accent-soft: #f7ead9;
  --resume-accent-border: #dfc39a;
  --resume-side: #fff8ed;
  --resume-paper: #fffdf8;
  background:
    linear-gradient(180deg, rgba(164, 111, 53, 0.1), transparent 38mm),
    var(--resume-paper);
}

.template-finance {
  --resume-ink: #101d19;
  --resume-muted: #53655f;
  --resume-line: #c9d8d2;
  --resume-line-soft: #e4ede9;
  --resume-accent: #17614d;
  --resume-accent-strong: #0b2f28;
  --resume-accent-soft: #edf5f2;
  --resume-accent-border: #c7ded6;
  --resume-side: #f4f8f6;
}

.template-education {
  --resume-ink: #1f2438;
  --resume-muted: #666d86;
  --resume-line: #d4d7e6;
  --resume-line-soft: #e8e9f1;
  --resume-accent: #4f5f9d;
  --resume-accent-strong: #252b56;
  --resume-accent-soft: #f0f2fb;
  --resume-accent-border: #d0d5eb;
  --resume-side: #f8f6ef;
  --resume-paper: #fffef9;
  --resume-font-display: var(--font-serif);
}

h1,
h2,
p,
ul {
  margin: 0;
}

.resume-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 16mm;
  align-items: start;
  padding-bottom: 10mm;
  border-bottom: 1.4px solid var(--resume-line);
}

.template-base .resume-header {
  border-bottom: 2px solid var(--resume-accent-strong);
}

.template-marketing .resume-header,
.template-education .resume-header {
  padding-bottom: 9mm;
}

.identity-block {
  min-width: 0;
}

.template-rule {
  width: 34mm;
  height: 3px;
  margin-bottom: 7mm;
  background: var(--resume-accent);
}

.template-base .template-rule {
  height: 1.5px;
}

h1 {
  color: var(--resume-accent-strong);
  font-family: var(--resume-font-display);
  font-size: 30px;
  font-weight: 850;
  line-height: 1.04;
  letter-spacing: 0;
}

.template-marketing h1 {
  font-size: 34px;
}

.template-education h1 {
  font-size: 32px;
  font-weight: 700;
}

.target-role {
  margin-top: 5px;
  color: var(--resume-accent);
  font-size: 13.5px;
  font-weight: 800;
}

.contact-line {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 9px;
  color: var(--resume-muted);
  font-size: 9.8px;
  font-weight: 650;
}

.contact-line span:not(:last-child)::after {
  content: '/';
  margin-left: 7px;
  color: var(--resume-line);
}

.photo {
  width: 24mm;
  height: 30mm;
  object-fit: cover;
  background: var(--resume-faint);
  border: 1px solid var(--resume-line);
  flex-shrink: 0;
}

.template-tech .photo,
.template-product .photo,
.template-finance .photo {
  border-radius: 50%;
  width: 24mm;
  height: 24mm;
  border: 2.5px solid var(--resume-accent-soft);
  box-shadow: 0 0 0 1px var(--resume-accent);
}

.template-marketing .photo {
  box-shadow: 5px 5px 0 var(--resume-accent-soft);
}

.resume-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 54mm;
  gap: 10mm;
  padding-top: 9mm;
}

.template-base .resume-body {
  grid-template-columns: minmax(0, 1fr);
}

.template-base .resume-side {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8mm;
  padding: 0;
  background: transparent;
  border: 0;
}

.template-marketing .resume-body,
.template-product .resume-body {
  grid-template-columns: minmax(0, 1.05fr) 58mm;
}

.resume-main,
.resume-side {
  min-width: 0;
}

.resume-side {
  padding: 7mm 6mm;
  background: var(--resume-side);
  border: 1px solid var(--resume-line-soft);
  break-inside: avoid;
  page-break-inside: avoid;
}

.template-education .resume-side {
  border-style: double;
}

.resume-section,
.resume-entry,
.education-entry {
  break-inside: avoid;
  page-break-inside: avoid;
}

.resume-section + .resume-section {
  margin-top: 7mm;
}

.side-section + .side-section {
  margin-top: 6mm;
}

h2 {
  display: grid;
  grid-template-columns: max-content 1fr;
  align-items: center;
  gap: 9px;
  margin-bottom: 3.8mm;
  color: var(--resume-accent-strong);
  font-size: 12.2px;
  font-weight: 850;
  line-height: 1.2;
  letter-spacing: 0.04em;
}

.template-marketing h2,
.template-finance h2,
.template-education h2 {
  text-transform: uppercase;
}

h2::after {
  content: '';
  height: 1px;
  background: var(--resume-line);
}

.resume-side h2 {
  display: block;
  margin-bottom: 3mm;
  color: var(--resume-accent);
}

.resume-side h2::after {
  display: none;
}

.summary-text {
  color: var(--resume-ink);
  font-size: 11.2px;
  line-height: 1.72;
}

.resume-entry + .resume-entry {
  margin-top: 5.5mm;
  padding-top: 4.8mm;
  border-top: 1px solid var(--resume-line-soft);
}

.entry-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: flex-start;
}

.entry-head strong,
.education-entry strong {
  color: var(--resume-ink);
  font-size: 12.3px;
  font-weight: 850;
  line-height: 1.25;
}

.entry-subtitle {
  margin-top: 1.5px;
  color: var(--resume-accent);
  font-size: 10.3px;
  font-weight: 750;
}

.entry-date {
  color: var(--resume-muted);
  font-size: 9.6px;
  font-weight: 800;
  line-height: 1.3;
  white-space: nowrap;
}

ul {
  margin-top: 2.5mm;
  padding-left: 13px;
}

li {
  margin-top: 2.5px;
  color: var(--resume-ink);
}

.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
}

.skill-list span {
  padding: 3px 7px;
  color: var(--resume-accent-strong);
  background: var(--resume-accent-soft);
  border: 1px solid var(--resume-accent-border);
  border-radius: 5px;
  font-size: 9.4px;
  font-weight: 760;
}

.template-base .skill-list span {
  color: var(--resume-ink);
  background: #fff;
  border-color: var(--resume-line);
  border-radius: 2px;
}

.education-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 4mm;
}

.education-entry:first-of-type {
  margin-top: 0;
}

.education-entry span,
.education-entry small {
  color: var(--resume-muted);
  font-size: 9.5px;
  line-height: 1.45;
}

.template-base .section-summary {
  padding: 4.5mm 5mm;
  background: var(--resume-accent-soft);
  border-left: 3px solid var(--resume-accent);
}

.template-tech .resume-entry {
  position: relative;
  padding-left: 4mm;
}

.template-tech .resume-entry::before {
  content: '';
  position: absolute;
  top: 1mm;
  left: 0;
  width: 2px;
  height: calc(100% - 1mm);
  background: var(--resume-accent);
}

.template-product .resume-entry {
  padding: 4mm;
  background: #fff;
  border: 1px solid var(--resume-line-soft);
  border-radius: 6px;
}

.template-product .resume-entry + .resume-entry {
  border-top: 1px solid var(--resume-line-soft);
}

.template-finance .resume-section {
  border-left: 1.4px solid var(--resume-line);
  padding-left: 4mm;
}

.template-finance .resume-side .resume-section {
  border-left: 0;
  padding-left: 0;
}

.template-education .resume-entry + .resume-entry {
  border-top-style: dotted;
}
</style>
