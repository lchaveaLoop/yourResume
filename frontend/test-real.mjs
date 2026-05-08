import JSZip from 'jszip';
import { readFileSync } from 'fs';

async function main() {
  const buf = readFileSync('F:/简历/c++开发工程师-刘唱_all.docx');
  const zip = await JSZip.loadAsync(buf);
  const xml = await zip.file('word/document.xml').async('string');

  // Extract paras
  const paras = xml.split(/<\/w:p>/);
  const lines = [];
  for (const para of paras) {
    const ts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
    const line = ts.map(m => m.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1')).join('');
    if (line.trim()) lines.push(line.trim());
  }

  console.log('=== RAW LINES ===');
  lines.forEach((l, i) => console.log(`[${i}] ${l}`));
  console.log('');

  // ---- PARSER (mirror of docx.ts logic) ----
  const SECTION_KEYWORDS = {
    教育背景:'education', 教育:'education', 学校:'education', 教育经历:'education',
    工作经历:'experience', 工作:'experience', 经历:'experience', 工作经验:'experience',
    项目经历:'projects', 项目:'projects', 项目经验:'projects',
    技能:'base', 专业技能:'base', 技能特长:'base',
    自我评价:'base', 个人简介:'base', 简介:'base',
  };

  function isSectionHeader(line) {
    if (line in SECTION_KEYWORDS) return SECTION_KEYWORDS[line];
    if (line.match(/^[\-•·]\s/) || line.match(/^[a-zA-Z0-9]{1,3}[.)]\s/)) return null;
    if (line.length > 20) return null;
    if (/问题|文档|标准化|方案|描述|分析|设计|实现|测试|流程|规范/.test(line)) return null;
    for (const [kw, sec] of Object.entries(SECTION_KEYWORDS)) {
      if (line.includes(kw)) return sec;
    }
    return null;
  }

  function isLikelyTitle(line) {
    if (/工程师|开发|实习|架构|技术|研究员|总监|经理|主管|专家/.test(line)) return true;
    if (/K\s*\d|\d+K|\d+薪/.test(line)) return true;
    return false;
  }

  function extractDuration(line) {
    const endIdx = line.indexOf('至今');
    if (endIdx !== -1 && endIdx < 12) {
      return { duration: line.substring(0, endIdx + 2), rest: line.substring(endIdx + 2).trim() };
    }
    const m2 = line.match(/^(\d{4}\.\d{1,2})\s*[-–−—]\s*(\d{4}\.\d{1,2})(.*)/);
    if (m2) return { duration: `${m2[1]}-${m2[2]}`, rest: (m2[3] || '').trim() };
    return { duration:'', rest: line };
  }

  const data = { name:'', email:'', phone:'', location:'', summary:'', education:[], experience:[], skills:[], projects:[] };
  let section = 'base';
  let currentEdu = { school:'', degree:'', duration:'', details:'' };
  let currentExp = { company:'', title:'', duration:'', details:[], detailsRaw:'' };
  let currentProj = { name:'', role:'', duration:'', details:[], detailsRaw:'' };
  let pendingExpDetails = [];
  let pendingProjDetails = [];
  let skipNext = false;

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
      console.log(`[${i}] SECTION HEADER: "${raw}" -> ${hdr}, flushing prev=${section}`);
      if (section === 'education') flushEdu();
      if (section === 'experience') flushExp();
      if (section === 'projects') flushProj();
      section = hdr;
      continue;
    }

    if (section === 'base') {
      if (!data.name) { console.log(`[${i}] BASE name: "${raw}"`); data.name = raw; continue; }
      if (/^(性别|年龄|生日|籍贯|民族|政治|身高|体重)/.test(raw)) { console.log(`[${i}] BASE meta skip: "${raw}"`); continue; }
      const em = raw.match(/[\w.-]+@[\w.-]+\.\w+/);
      if (em && !data.email) { console.log(`[${i}] BASE email: "${em[0]}"`); data.email = em[0]; }
      const ph = raw.match(/\d{11}/);
      if (ph && !data.phone) { console.log(`[${i}] BASE phone: "${ph[0]}"`); data.phone = ph[0]; }
      if (!data.location) {
        const locM = raw.match(/武汉|北京|上海|深圳|广州|杭州|成都|南京|苏州|西安|长沙/);
        if (locM) { data.location = locM[0]; console.log(`[${i}] BASE location: "${locM[0]}"`); }
      }
      if (raw.length < 15 && !/\d{4}/.test(raw) && !raw.includes('|') && !data.summary
          && !/^(\d|电话|邮箱|性别|年龄)/.test(raw)) {
        console.log(`[${i}] BASE summary: "${raw}"`);
        data.summary = raw;
      } else {
        console.log(`[${i}] BASE unhandled: "${raw}"`);
      }
      continue;
    }

    if (section === 'education') {
      const { duration, rest } = extractDuration(raw);
      if (duration) {
        console.log(`[${i}] EDU duration="${duration}" rest="${rest}"`);
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
        console.log(`[${i}] EDU degree: "${raw}"`);
        if (currentEdu.school) currentEdu.degree = raw.replace(/\s+/g, ' ');
        else currentEdu.school = raw;
        continue;
      }
      if (currentEdu.school && !currentEdu.degree) {
        console.log(`[${i}] EDU degree (fallback): "${raw}"`);
        currentEdu.degree = raw;
      } else if (currentEdu.school) {
        console.log(`[${i}] EDU detail: "${raw}"`);
        currentEdu.details = currentEdu.details ? currentEdu.details + '；' + raw : raw;
      } else {
        console.log(`[${i}] EDU unhandled: "${raw}"`);
      }
      continue;
    }

    if (section === 'experience') {
      if (skipNext) { console.log(`[${i}] EXP skipNext=true -> SKIP`); skipNext = false; continue; }

      const { duration, rest } = extractDuration(raw);
      if (duration) {
        console.log(`[${i}] EXP duration="${duration}" rest="${rest}"`);
        flushExp();
        currentExp.duration = duration;
        if (rest.includes('|')) {
          const parts = rest.split('|');
          currentExp.company = parts[0].trim();
          currentExp.title = parts.slice(1).join('|').trim();
          console.log(`  -> company="${currentExp.company}" title="${currentExp.title}"`);
        } else if (rest.trim()) {
          currentExp.company = rest.trim();
          const next = lines[i+1];
          if (next && !isSectionHeader(next) && !extractDuration(next).duration && !/^\d+\./.test(next)) {
            if (next.includes('|')) {
              const tParts = next.split('|');
              currentExp.title = tParts[0].trim();
              console.log(`  -> title from pipe next="${currentExp.title}"`);
            } else if (isLikelyTitle(next)) {
              currentExp.title = next.trim();
              console.log(`  -> title from likely next="${currentExp.title}"`);
            } else {
              currentExp.company = currentExp.company + ' ' + next.trim();
              console.log(`  -> company append="${currentExp.company}"`);
            }
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
          console.log(`[${i}] EXP no-dur pipe: company="${currentExp.company}" title="${currentExp.title}"`);
        } else if (isLikelyTitle(raw)) {
          currentExp.title = raw.trim();
          console.log(`[${i}] EXP no-dur title: "${currentExp.title}"`);
        } else {
          currentExp.company = raw.trim();
          console.log(`[${i}] EXP no-dur company: "${currentExp.company}"`);
        }
        continue;
      }

      if (/^\d+\./.test(raw)) {
        pendingExpDetails.push(raw.replace(/^\d+\./, '').trim());
        console.log(`[${i}] EXP detail(^\\d+): "${raw}"`);
        continue;
      }

      pendingExpDetails.push(raw);
      console.log(`[${i}] EXP detail: "${raw}"`);
      continue;
    }

    if (section === 'projects') {
      if (skipNext) { console.log(`[${i}] PROJ skipNext=true -> SKIP`); skipNext = false; continue; }

      const { duration, rest } = extractDuration(raw);
      if (duration) {
        console.log(`[${i}] PROJ duration="${duration}" rest="${rest}"`);
        flushProj();
        currentProj.duration = duration;
        if (rest.includes('|')) {
          const parts = rest.split('|').map(p => p.trim()).filter(Boolean);
          currentProj.name = parts[0] || '';
          for (let j = 1; j < parts.length; j++) {
            if (!/\d{4}/.test(parts[j]) && parts[j].length > 1) {
              currentProj.role = parts[j];
              break;
            }
          }
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

      // 中段日期匹配: "项目名 2020.01-2021.12 公司"
      const midDur = raw.match(/(\d{4}\.\d{1,2}[-–−—]\d{4}\.\d{1,2})/);
      if (midDur && midDur.index !== undefined && midDur.index > 0) {
        flushProj();
        currentProj.name = raw.substring(0, midDur.index).trim();
        currentProj.duration = midDur[1];
        const after = raw.substring(midDur.index + midDur[1].length).trim();
        if (after) currentProj.role = after;
        console.log(`[${i}] PROJ mid-dur: name="${currentProj.name}" dur="${currentProj.duration}" role="${currentProj.role}"`);
        continue;
      }

      if (!currentProj.name) {
        if (/主要开发人员|主要负责人|独立开发|参与/.test(raw)) {
          console.log(`[${i}] PROJ role: "${raw}"`);
          currentProj.role = raw;
        } else {
          console.log(`[${i}] PROJ name: "${raw}"`);
          currentProj.name = raw;
        }
        continue;
      }

      if (!currentProj.role && /主要开发人员|主要负责人|独立开发|参与/.test(raw)) {
        console.log(`[${i}] PROJ role(2): "${raw}"`);
        currentProj.role = raw; continue;
      }

      if (/^[一-龥]{2,6}：/.test(raw) || /^开发/.test(raw)) {
        pendingProjDetails.push(raw);
        console.log(`[${i}] PROJ detail(structured): "${raw}"`);
        continue;
      }

      if (currentProj.name) {
        pendingProjDetails.push(raw);
        console.log(`[${i}] PROJ detail: "${raw.substring(0,60)}..."`);
      }
    }
  }

  if (section === 'education') flushEdu();
  if (section === 'experience') flushExp();
  if (section === 'projects') flushProj();

  console.log('\n=== FINAL PARSED RESULT ===');
  console.log('Name:', data.name);
  console.log('Email:', data.email);
  console.log('Phone:', data.phone);
  console.log('Location:', data.location);
  console.log('Summary:', data.summary);
  console.log('Skills:', JSON.stringify(data.skills));
  console.log('\nEducation:');
  data.education.forEach((e,i) => console.log(`  [${i}]`, JSON.stringify(e)));
  console.log('\nExperience:');
  data.experience.forEach((e,i) => console.log(`  [${i}]`, JSON.stringify(e)));
  console.log('\nProjects:');
  data.projects.forEach((p,i) => {
    console.log(`  [${i}] name="${p.name}" role="${p.role}" dur="${p.duration}"`);
    console.log(`       details(${p.details.length}):`, JSON.stringify(p.details.slice(0, 5)));
  });
}

main().catch(e => console.error(e));
