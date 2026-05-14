import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const targetRoleLabels = ['求职意向', '目标岗位', '意向岗位', '应聘职位', '职业方向', '目标职位', '目标行业'];

function extractTargetRoleFromLine(line) {
  const normalized = line
    .replace(/^[-*•·]\s*/, '')
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .trim();
  for (const label of targetRoleLabels) {
    const match = normalized.match(new RegExp(`^${label}\\s*[:：|｜-]?\\s*(.+)$`, 'i'));
    if (match?.[1]) return match[1].trim();
  }
  return '';
}

function isTargetRoleLabel(line) {
  const normalized = line
    .replace(/^[-*•·]\s*/, '')
    .replace(/^#+\s*/, '')
    .replace(/\*\*/g, '')
    .trim()
    .replace(/[:：|｜-]\s*$/, '');
  return targetRoleLabels.some(label => normalized === label);
}

function inferCareerTemplate(resume) {
  const itKeywords = ['开发', '工程师', '前端', '后端', 'java', 'python', 'c++', 'go', '算法', '数据', '架构', '运维', 'devops', 'vue', 'react'];
  const marketingKeywords = ['市场', '营销', '品牌', '增长', '投放', '广告', '公关', '活动', '渠道', 'campaign', 'branding', '商务'];
  const text = [
    resume.targetRole, resume.targetRole, resume.targetRole, resume.summary,
    ...resume.experience.flatMap(item => [item.title, item.company, ...item.details]),
    ...resume.projects.flatMap(item => [item.role, item.name, ...item.details]),
    ...resume.skills,
  ].filter(Boolean).join(' ').toLowerCase();
  const score = (keywords) => keywords.reduce((sum, kw) => text.includes(kw.toLowerCase()) ? sum + 1 : sum, 0);
  return score(marketingKeywords) > score(itKeywords) ? 'marketing' : 'it';
}

// 直接复制 parser.ts 的逻辑 (转 JS)
function parseMarkdown(text) {
  const lines = text.split('\n');
  const data = {
    name: '', email: '', phone: '', location: '', summary: '',
    targetRole: '', education: [], experience: [], skills: [], projects: []
  };

  let currentSection = null;
  let currentBlock = {};
  let expectTargetRole = false;

  const sectionKeywords = {
    '教育背景': 'education', '教育': 'education',
    '工作经历': 'experience', '工作': 'experience', '经历': 'experience',
    '项目经历': 'projects', '项目': 'projects',
    '技能': 'skills', '专业技能': 'skills',
  };

  function hasBlockContent(block) {
    return Object.values(block).some(v => v && v.trim().length > 0);
  }

  function flushBlock(section, block) {
    const details = block.details ? block.details.split('\n').filter(Boolean) : [];
    if (section === 'education') {
      data.education.push({
        school: block.school || '',
        degree: block.degree || details[0] || '',
        duration: block.duration || '',
        details: details.slice(1).join('；'),
      });
    } else if (section === 'experience') {
      data.experience.push({
        company: block.company || '',
        title: block.title || details[0] || '',
        duration: block.duration || '',
        details,
      });
    } else if (section === 'projects') {
      data.projects.push({
        name: block.name || '',
        role: block.role || details[0] || '',
        duration: block.duration || '',
        details,
      });
    }
  }

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    if (expectTargetRole) {
      data.targetRole = line.replace(/^[-*•·]\s*/, '').trim();
      expectTargetRole = false;
      continue;
    }

    const targetRole = extractTargetRoleFromLine(line);
    if (targetRole && !data.targetRole) {
      data.targetRole = targetRole;
      continue;
    }

    if (isTargetRoleLabel(line)) {
      expectTargetRole = true;
      continue;
    }

    if (line.startsWith('# ') && !line.startsWith('## ')) {
      data.name = line.slice(2).trim();
      continue;
    }

    if (line.includes('@') && !data.email) {
      const emailMatch = line.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (emailMatch) data.email = emailMatch[0];
    }

    if (!data.phone && /\d{3}[-\s]?\d{4}[-\s]?\d{4}/.test(line)) {
      const phoneMatch = line.match(/\d{3}[-\s]?\d{4}[-\s]?\d{4}|\d{11}/);
      if (phoneMatch) data.phone = phoneMatch[0];
    }

    if (line.startsWith('## ')) {
      if (currentBlock && currentSection && currentSection !== 'skills' && hasBlockContent(currentBlock)) {
        flushBlock(currentSection, currentBlock);
      }
      const keyword = line.slice(3).trim();
      currentSection = sectionKeywords[keyword] || null;
      currentBlock = {};
      continue;
    }

    // 三级标题 = 公司/项目标题 + 职位 + 时间
    if (line.startsWith('### ')) {
      if (currentBlock && currentSection && currentSection !== 'skills' && hasBlockContent(currentBlock)) {
        flushBlock(currentSection, currentBlock);
      }
      currentBlock = {};

      const parts = line.slice(4).trim().split(' - ');
      if (currentSection === 'experience') {
        currentBlock.company = parts[0] || '';
        currentBlock.title = parts[1] || '';
        currentBlock.duration = parts.slice(2).join(' - ') || '';
      } else if (currentSection === 'projects') {
        currentBlock.name = parts[0] || '';
        currentBlock.role = parts[1] || '';
        currentBlock.duration = parts.slice(2).join(' - ') || '';
      }
      continue;
    }

    if (line.startsWith('- ')) {
      const content = line.slice(2).trim();
      if (currentSection === 'skills') {
        data.skills.push(content);
      } else if (currentSection === 'education') {
        const parts = content.split(' - ');
        if (parts.length >= 2) {
          data.education.push({
            school: parts[0].trim(),
            degree: parts[1].trim(),
            duration: parts[2]?.trim() || '',
            details: '',
          });
        }
      } else if (currentSection) {
        currentBlock.details = currentBlock.details ? currentBlock.details + '\n' + content : content;
      }
      continue;
    }

    if (!data.name && /^[\u4e00-\u9fa5]{2,4}(\s[\u4e00-\u9fa5]+)*$/.test(line)) {
      data.name = line;
    }
  }

  if (currentBlock && currentSection && currentSection !== 'skills' && hasBlockContent(currentBlock)) {
    flushBlock(currentSection, currentBlock);
  }

  return data;
}

// 测试
const md = readFileSync('../test-resume.md', 'utf8');
const result = parseMarkdown(md);
console.log(JSON.stringify(result, null, 2));

const itResult = parseMarkdown(`# 李雷
目标岗位：前端开发工程师
## 技能
- Vue / React / TypeScript
`);
const marketingResult = parseMarkdown(`# 韩梅梅
求职意向：市场经理/品牌营销
## 技能
- 品牌策划
- 广告投放
`);
const fallbackResult = parseMarkdown(`# 王五
## 教育背景
- 某大学 - 本科 - 2020-2024
`);
const sectionRoleResult = parseMarkdown(`# 赵六
## 求职意向
市场品牌经理
`);

assert.equal(itResult.targetRole, '前端开发工程师', 'should parse IT target role');
assert.equal(inferCareerTemplate(itResult), 'it', 'should infer IT template');
assert.equal(marketingResult.targetRole, '市场经理/品牌营销', 'should parse marketing target role');
assert.equal(inferCareerTemplate(marketingResult), 'marketing', 'should infer marketing template');
assert.equal(inferCareerTemplate(fallbackResult), 'it', 'should fallback to IT template');
assert.equal(sectionRoleResult.targetRole, '市场品牌经理', 'should parse target role from heading section');
assert.equal(inferCareerTemplate(sectionRoleResult), 'marketing', 'should infer marketing from section target role');
