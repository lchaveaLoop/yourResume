import JSZip from 'jszip';
import { readFileSync } from 'fs';

async function main() {
  const buf = readFileSync('C:/Users/lc/.openclaw/media/inbound/刘唱-个人简历---4061f7fa-543b-4600-b000-e9cc8a320f62.docx');
  const zip = await JSZip.loadAsync(buf);

  // 列出 word/media/ 下的文件
  console.log('=== Media files in docx ===');
  const mediaFolder = zip.folder('word/media');
  if (mediaFolder) {
    Object.keys(mediaFolder.files).forEach(name => {
      console.log(`  - ${name}`);
    });

    const imageFiles = Object.keys(mediaFolder.files)
      .filter(name => /\.(png|jpg|jpeg)$/i.test(name))
      .sort();
    console.log(`\n=== Found ${imageFiles.length} image(s) ===`);

    for (const imgPath of imageFiles) {
      const file = mediaFolder.file(imgPath);
      if (!file) continue;
      
      const arrayBuf = await file.async('arraybuffer');
      const sizeKB = (arrayBuf.byteLength / 1024).toFixed(1);
      console.log(`  ${imgPath}: ${sizeKB} KB`);
      
      if (arrayBuf.byteLength > 200 * 1024) {
        console.log(`    -> Skipped (too large)`);
        continue;
      }
      
      console.log(`\nExtracting: ${imgPath}`);
      const blob = await file.async('base64');
      if (blob) {
        const ext = imgPath.split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = `data:${mime};base64,${blob}`;
        console.log(`Data URL length: ${dataUrl.length} chars`);
        console.log(`Preview: ${dataUrl.substring(0, 80)}...`);
        break;
      }
    }
  } else {
    console.log('No media folder found.');
  }
}

main();
