<template>
  <div class="home">
    <header class="top-bar">
      <div class="brand">
        <span class="brand-icon">📋</span>
        <h1 class="brand-title">yourResume</h1>
      </div>
      <div class="top-actions">
        <TemplateSwitcher v-if="hasData" v-model="store.template" />
        <PDFExporter v-if="hasData" :get-element="getPreviewEl" :filename="`${store.data.name || '简历'}_简历.pdf`" />
      </div>
    </header>

    <main class="main-content">
      <div class="workspace">
        <!-- 左侧：上传区 -->
        <aside class="left-panel">
          <FileUpload v-if="!hasData" @file-selected="handleFileSelected" />
          <div v-else class="panel-section">
            <div class="section-header">
              <h3>已加载简历</h3>
              <button class="btn-reset" @click="store.reset()">重新上传</button>
            </div>
            <p class="filename">📄 {{ filename }}</p>

            <div class="field-editor">
              <h4>基本信息</h4>
              <label class="field-label">姓名</label>
              <input class="field-input" :value="store.data.name" @input="update('name', ($event.target as HTMLInputElement).value)" placeholder="姓名" />
              <label class="field-label">邮箱</label>
              <input class="field-input" :value="store.data.email" @input="update('email', ($event.target as HTMLInputElement).value)" placeholder="email@example.com" />
              <label class="field-label">电话</label>
              <input class="field-input" :value="store.data.phone" @input="update('phone', ($event.target as HTMLInputElement).value)" placeholder="138-0000-0000" />
              <label class="field-label">地址</label>
              <input class="field-input" :value="store.data.location" @input="update('location', ($event.target as HTMLInputElement).value)" placeholder="城市" />

              <h4>摘要</h4>
              <textarea class="field-textarea" :value="store.data.summary"
                @input="update('summary', ($event.target as HTMLTextAreaElement).value)"
                placeholder="个人简介，一句话描述自己" rows="3" />

              <h4>教育经历 <button class="btn-add" @click="addEducation">+ 添加</button></h4>
              <div v-for="(e, i) in store.data.education" :key="i" class="block-card">
                <input class="field-input" v-model="e.school" placeholder="学校" />
                <input class="field-input" v-model="e.degree" placeholder="学历 · 专业" />
                <input class="field-input" v-model="e.duration" placeholder="时间" />
                <button class="btn-remove" @click="store.data.education.splice(i, 1)">删除</button>
              </div>

              <h4>工作经历 <button class="btn-add" @click="addExperience">+ 添加</button></h4>
              <div v-for="(e, i) in store.data.experience" :key="i" class="block-card">
                <input class="field-input" v-model="e.company" placeholder="公司" />
                <input class="field-input" v-model="e.title" placeholder="职位" />
                <input class="field-input" v-model="e.duration" placeholder="时间" />
                <textarea class="field-textarea" v-model="e.detailsRaw" @blur="syncDetailsRaw(e)" placeholder="工作描述（每行一条）" rows="3" />
                <button class="btn-remove" @click="store.data.experience.splice(i, 1)">删除</button>
              </div>

              <h4>项目经历 <button class="btn-add" @click="addProject">+ 添加</button></h4>
              <div v-for="(e, i) in store.data.projects" :key="i" class="block-card">
                <input class="field-input" v-model="e.name" placeholder="项目名" />
                <input class="field-input" v-model="e.role" placeholder="角色" />
                <input class="field-input" v-model="e.duration" placeholder="时间" />
                <textarea class="field-textarea" v-model="e.detailsRaw" @blur="syncDetailsRaw(e)" placeholder="项目描述（每行一条）" rows="3" />
                <button class="btn-remove" @click="store.data.projects.splice(i, 1)">删除</button>
              </div>

              <h4>技能 <button class="btn-add" @click="store.data.skills.push('')">+ 添加</button></h4>
              <div class="skills-editor">
                <div v-for="(_, i) in store.data.skills" :key="i" class="skill-row">
                  <input class="field-input" v-model="store.data.skills[i]" placeholder="技能名称" />
                  <button class="btn-remove-sm" @click="store.data.skills.splice(i, 1)">×</button>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- 右侧：预览区 -->
        <section class="right-panel">
          <div class="preview-sticky">
            <div class="preview-label">
              <span>📺 预览</span>
              <span class="preview-hint">A4 尺寸，可导出 PDF</span>
            </div>
            <div class="preview-scroll">
              <div class="preview-wrap">
                <ResumePreview ref="previewRef" :resume="store.data" :template="store.template" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useResumeStore } from '../stores/resume'
import { parseMarkdown } from '../utils/parser'
import { parseDocx } from '../utils/docx'
import FileUpload from '../components/FileUpload.vue'
import ResumePreview from '../components/ResumePreview.vue'
import TemplateSwitcher from '../components/TemplateSwitcher.vue'
import PDFExporter from '../components/PDFExporter.vue'
import type { ResumeData } from '../types/resume'

const store = useResumeStore()
const previewRef = ref<InstanceType<typeof ResumePreview> | null>(null)
const filename = ref('')

const hasData = computed(() => !!store.data.name || store.data.experience.length > 0 || store.data.education.length > 0)

async function handleFileSelected(content: string | File, fname: string) {
  filename.value = fname
  let parsed
  if (content instanceof File) {
    parsed = await parseDocx(content)
  } else {
    parsed = parseMarkdown(content)
  }
  store.setResume(parsed)
}

function update<K extends keyof ResumeData>(key: K, value: string) {
  ;(store.data as any)[key] = value
}

function getPreviewEl() {
  return previewRef.value?.el() ?? null
}

// 同步 detailsRaw <-> details
watch(() => store.data.experience, (list) => {
  list.forEach(e => {
    if (e.detailsRaw == null) {
      e.detailsRaw = e.details.join('\n')
    }
  })
}, { immediate: true, deep: true })

watch(() => store.data.projects, (list) => {
  list.forEach(p => {
    if (p.detailsRaw == null) {
      p.detailsRaw = p.details.join('\n')
    }
  })
}, { immediate: true, deep: true })

function syncDetailsRaw(item: { details: string[]; detailsRaw?: string }) {
  item.details = item.detailsRaw ? item.detailsRaw.split('\n').filter(l => l.trim()) : []
}

function addEducation() {
  store.data.education.push({ school: '', degree: '', duration: '', details: '' })
}

function addExperience() {
  store.data.experience.push({ company: '', title: '', duration: '', details: [] })
}

function addProject() {
  store.data.projects.push({ name: '', role: '', duration: '', details: [] })
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: #fff;
  border-bottom: 1px solid #e2e8f0;
  flex-shrink: 0;
}

.brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.brand-icon {
  font-size: 20px;
}

.brand-title {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
}

.top-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.main-content {
  flex: 1;
  overflow: hidden;
}

.workspace {
  display: grid;
  grid-template-columns: 380px 1fr;
  height: 100%;
}

.left-panel {
  background: #f8fafc;
  border-right: 1px solid #e2e8f0;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.right-panel {
  background: #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.preview-sticky {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.preview-label {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 20px;
  background: #1a1a2e;
  color: #fff;
  font-size: 12px;
  font-weight: 500;
  flex-shrink: 0;
}

.preview-hint {
  color: #94a3b8;
  font-weight: 400;
}

.preview-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  display: flex;
  justify-content: center;
}

.preview-wrap {
  transform-origin: top center;
}

/* Editor styles */
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.section-header h3 {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
}

.filename {
  font-size: 12px;
  color: #64748b;
  background: #e2e8f0;
  padding: 6px 10px;
  border-radius: 6px;
  margin-bottom: 8px;
}

.btn-reset {
  font-size: 12px;
  color: #64748b;
  background: none;
  border: 1px solid #cbd5e1;
  border-radius: 4px;
  padding: 3px 10px;
  cursor: pointer;
}

.btn-reset:hover {
  color: #4a6cf5;
  border-color: #4a6cf5;
}

.panel-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.field-editor h4 {
  font-size: 12px;
  font-weight: 600;
  color: #475569;
  margin-top: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-add {
  font-size: 11px;
  background: none;
  border: none;
  color: #4a6cf5;
  cursor: pointer;
  font-weight: 400;
}

.btn-add:hover {
  text-decoration: underline;
}

.field-label {
  font-size: 11px;
  color: #94a3b8;
  margin-top: 6px;
}

.field-input {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #1a1a2e;
  background: #fff;
  outline: none;
  transition: border-color 0.15s;
}

.field-input:focus {
  border-color: #4a6cf5;
}

.field-textarea {
  width: 100%;
  padding: 6px 8px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 12px;
  color: #1a1a2e;
  background: #fff;
  resize: vertical;
  outline: none;
  font-family: inherit;
  transition: border-color 0.15s;
}

.field-textarea:focus {
  border-color: #4a6cf5;
}

.block-card {
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 6px;
}

.btn-remove {
  align-self: flex-end;
  font-size: 11px;
  color: #ef4444;
  background: none;
  border: none;
  cursor: pointer;
}

.btn-remove:hover {
  text-decoration: underline;
}

.skills-editor {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.skill-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.btn-remove-sm {
  background: none;
  border: none;
  color: #ef4444;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
}
</style>
