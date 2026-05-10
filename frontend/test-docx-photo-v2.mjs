import JSZip from 'jszip';
import { readFileSync } from 'fs';

async function main() {
  try {
    const buf = readFileSync('C:/Users/lc/.openclaw/media/inbound/刘唱-个人简历---4061f7fa-543b-4600-b000-e9cc8a320f62.docx');
    const zip = await JSZip.loadAsync(buf);

    console.log('=== Extracting first small image ===');
    const mediaFolder = zip.folder('word/media');
    if (!mediaFolder) {
      console.log('No media folder.');
      return;
    }

    const files = mediaFolder.files;
    const imageNames = Object.keys(files).filter(n => /\.(png|jpg|jpeg)$/i.test(n)).sort();
    console.log(`Found ${imageNames.length} images.`);

    for (const name of imageNames) {
      console.log(`Trying: ${name}`);
      try {
        const file = files[name];
        if (!file || file.dir) continue;
        
        // 直接读 base64，如果太慢就是文件太大
        const blob = await Promise.race([
          file.async('base64'),
          new Promise((_, reject) => setTimeout(() => reject('timeout'), 2000))
        ]);
        
        const ext = name.split('.').pop()?.toLowerCase();
        const mime = ext === 'png' ? 'image/png' : 'image/jpeg';
        const dataUrl = `data:${mime};base64,${blob}`;
        console.log(`✓ Extracted: ${name} (${dataUrl.length} chars)`);
        console.log(`Preview: ${dataUrl.substring(0, 80)}...`);
        break;
      } catch (e) {
        console.log(`  ✗ Skipped (${e})`);
      }
    }
  } catch (e) {
    console.error('Error:', e);
  }
}

main();
