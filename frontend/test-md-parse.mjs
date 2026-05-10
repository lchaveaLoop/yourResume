import { readFileSync } from 'fs';

// 直接复制 parser.ts 的逻辑 (转 JS)
function parseMarkdown(text) {
  const lines = text.split('\n');
  const data = {
    name: '', email: '', phone: '', location: '', summary: '',
    education: [], experience: [], skills: [], projects: []
  };

  let currentSection = null;
  let currentBlock = {};

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
