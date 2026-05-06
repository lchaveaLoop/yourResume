import JSZip from 'jszip';
import { readFileSync } from 'fs';

async function main() {
  const buf = readFileSync('C:/Users/lc/.openclaw/media/inbound/刘唱-个人简历---4061f7fa-543b-4600-b000-e9cc8a320f62.docx');
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml')?.async('string');
  if (!xml) return;

  const paras = xml.split(/<\/w:p>/);
  const lines = [];
  for (const para of paras) {
    const ts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const line = ts.map(m => m.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1')).join('');
    if (line.trim()) lines.push(line.trim());
  }

  // 直接复用上面的 TS 逻辑转成 JS 测试
  const data = { name:'', email:'', phone:'', location:'', summary:'', education:[], experience:[], skills:[], projects:[] };
  let section = 'base';
  let currentEdu = { school:'', degree:'', duration:'', details:'' };
  let currentExp = { company:'', title:'', duration:'', details:[], detailsRaw:'' };
  let currentProj = { name:'', role:'', duration:'', details:[], detailsRaw:'' };
  let pendingExpDetails = [];
  let pendingProjDetails = [];
  let skipNext = false;

  const SECTION_KEYWORDS = {
    教育背景:'education', 教育:'education', 学校:'education', 教育经历:'education',
    工作经历:'experience', 工作:'experience', 经历:'experience', 工作经验:'experience',
    项目经历:'projects', 项目:'projects', 项目经验:'projects',
    技能:'base', 专业技能:'base', 技能特长:'base',
    自我评价:'base', 个人简介:'base', 简介:'base',
  };

  function isSectionHeader(line) {
    if (line in SECTION_KEYWORDS) return SECTION_KEYWORDS[line];
    if (line.length > 20) return null;
    for (const [kw, sec] of Object.entries(SECTION_KEYWORDS)) {
      if (line.includes(kw)) return sec;
    }
    return null;
  }

  function extractDuration(line) {
    const endIdx = line.indexOf('至今');
    if (endIdx !== -1 && endIdx < 12) {
      return { duration: line.substring(0, endIdx + 2), rest: line.substring(endIdx + 2).trim() };
    }
    const m2 = line.match(/^(\d{4}\.\d(?:\.\d)?)\s*-\s*(\d{4}\.\d(?:\.\d)?)(.*)/);
    if (m2) return { duration: `${m2[1]}-${m2[2]}`, rest: (m2[3] || '').trim() };
    return { duration:'', rest: line };
  }

  function flushEdu() {
    if (currentEdu.school || currentEdu.degree) data.education.push({...currentEdu});
    currentEdu = { school:'', degree:'', duration:'', details:'' };
  }
  function flushExp() {
    if (currentExp.company || currentExp.title) {
      currentExp.details = pendingExpDetails.filter(Boolean);
      currentExp.detailsRaw = currentExp.details.join('\n');
      data.experience.push({...currentExp});
    }
    currentExp = { company:'', title:'', duration:'', details:[], detailsRaw:'' };
    pendingExpDetails = [];
  }
  function flushProj() {
    if (currentProj.name || currentProj.role) {
      currentProj.details = pendingProjDetails.filter(Boolean);
      currentProj.detailsRaw = currentProj.details.join('\n');
      data.projects.push({...currentProj});
    }
    currentProj = { name:'', role:'', duration:'', details:[], detailsRaw:'' };
    pendingProjDetails = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    if (!raw.trim()) continue;
    const hdr = isSectionHeader(raw);
    if (hdr) {
      if (section === 'education') flushEdu();
      if (section === 'experience') flushExp();
      if (section === 'projects') flushProj();
      section = hdr;
      continue;
    }

    if (section === 'base') {
      if (!data.name) { data.name = raw; continue; }
      const em = raw.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (em && !data.email) data.email = em[0];
      const ph = raw.match(/\d{11}/);
      if (ph && !data.phone) data.phone = ph[0];
      if (raw.length > 20 && !data.summary) data.summary = raw;
    }

    if (section === 'education') {
      const { duration, rest } = extractDuration(raw);
      if (duration) {
        flushEdu();
        currentEdu.duration = duration;
        if (rest.includes('|')) {
          const parts = rest.split('|');
          currentEdu.school = parts[0].trim();
          currentEdu.degree = parts.slice(1).join('|').trim();
        } else {
          currentEdu.school = rest;
        }
        continue;
      }
      if (raw.includes('|') || /大专|本科|硕士|博士/.test(raw)) {
        if (currentEdu.school) currentEdu.degree = raw.replace(/\s+/g, ' ');
        else currentEdu.school = raw;
        continue;
      }
      if (currentEdu.school && !currentEdu.degree) currentEdu.degree = raw;
      else if (currentEdu.school) currentEdu.details = currentEdu.details ? currentEdu.details + '；' + raw : raw;
    }

    if (section === 'experience') {
      if (skipNext) { skipNext = false; continue; }
      const { duration, rest } = extractDuration(raw);
      if (duration) {
        flushExp();
        currentExp.duration = duration;
        if (rest.includes('|')) {
          const parts = rest.split('|');
          currentExp.company = parts[0].trim();
          currentExp.title = parts.slice(1).join('|').trim();
        } else {
          currentExp.company = rest;
          const next = lines[i+1];
          if (next && !isSectionHeader(next) && !extractDuration(next).duration && !/^\d+\./.test(next)) {
            currentExp.title = next.replace(/^[｜|]\s*/, '').trim();
            skipNext = true;
          }
        }
        continue;
      }
      if (!currentExp.company && !currentExp.title) {
        if (raw.includes('|')) {
          const parts = raw.split('|');
          currentExp.company = parts[0].trim();
          currentExp.title = parts.slice(1).join('|').trim();
        } else {
          currentExp.company = raw;
        }
        continue;
      }
      if (/^\d+\./.test(raw)) { pendingExpDetails.push(raw.replace(/^\d+\./, '').trim()); continue; }
      if (currentExp.company || currentExp.title) pendingExpDetails.push(raw);
    }

    if (section === 'projects') {
      if (skipNext) { skipNext = false; continue; }
      const { duration, rest } = extractDuration(raw);
      if (duration) {
        flushProj();
        currentProj.duration = duration;
        if (rest.includes('|')) {
          const parts = rest.split('|');
          currentProj.name = parts[0].trim();
          currentProj.role = parts.slice(1).join('|').trim();
        } else {
          currentProj.name = rest;
        }
        const next = lines[i+1];
        if (next && !isSectionHeader(next) && !extractDuration(next).duration) {
          if (/主要开发人员|主要负责人|独立开发|参与/.test(next)) {
            currentProj.role = next.trim();
            skipNext = true;
          }
        }
        continue;
      }
      if (!currentProj.name) {
        if (/主要开发人员|主要负责人|独立开发|参与/.test(raw)) currentProj.role = raw;
        else currentProj.name = raw;
        continue;
      }
      if (!currentProj.role && /主要开发人员|主要负责人|独立开发|参与/.test(raw)) {
        currentProj.role = raw; continue;
      }
      if (/^[\u4e00-\u9fa5]{2,6}：/.test(raw) || /^开发/.test(raw)) {
        pendingProjDetails.push(raw); continue;
      }
      if (currentProj.name) pendingProjDetails.push(raw);
    }
  }

  if (section === 'education') flushEdu();
  if (section === 'experience') flushExp();
  if (section === 'projects') flushProj();

  console.log(JSON.stringify(data, null, 2));
}

main();
