import JSZip from 'jszip';
import { readFileSync } from 'fs';

const buf = readFileSync('C:/Users/lc/.openclaw/media/inbound/刘唱-个人简历---4061f7fa-543b-4600-b000-e9cc8a320f62.docx');
const zip = await JSZip.loadAsync(buf);
const xml = await zip.file('word/document.xml')?.async('string');

// 提取所有 <w:t> 标签内的文本
const paras = xml.split(/<\/w:p>/);
const lines = [];

for (const para of paras) {
  const ts = para.match(/<w:t[^>]*>([^<]*)<\/w:t>/g) || [];
  const line = ts.map(m => m.replace(/<w:t[^>]*>([^<]*)<\/w:t>/, '$1')).join('');
  if (line.trim()) lines.push(line);
}

console.log('=== ALL PARAGRAPHS ===');
lines.forEach((l, i) => console.log(`[${i}] "${l}"`));
