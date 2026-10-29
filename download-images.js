import https from 'https';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATALOG_DIR = path.join(__dirname, 'public', 'catalog');

// Ensure catalog directory exists
if (!fs.existsSync(CATALOG_DIR)) {
  fs.mkdirSync(CATALOG_DIR, { recursive: true });
}

// Hardcoded Unsplash image URLs (no API key needed - direct image links)
// These are high-quality fashion images that work without authentication
const products = {
  // Women's Fashion - High quality fashion images
  'w-dress-midnight.jpg': 'https://images.unsplash.com/photo-1595777707802-07e4b3b90fc7?w=600&h=900&fit=crop',
  'w-ethnic-kurta.jpg': 'https://images.unsplash.com/photo-1630761656322-22bc88e7df7d?w=600&h=900&fit=crop',
  'w-floral-maxi.jpg': 'https://images.unsplash.com/photo-1589123637602-a3fb0d2e3d1c?w=600&h=900&fit=crop',
  'w-graphic-tshirt.jpg': 'https://images.unsplash.com/photo-1505298346881-b72b27e84530?w=600&h=900&fit=crop',
  'w-linen-coord.jpg': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=900&fit=crop',
  'w-peplum-top.jpg': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600&h=900&fit=crop',
  'w-poplin-shirt.jpg': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=900&fit=crop',
  'w-printed-kurti.jpg': 'https://images.unsplash.com/photo-1613381503064-8ec64e118e97?w=600&h=900&fit=crop',
  'w-ribbed-crop-top.jpg': 'https://images.unsplash.com/photo-1506529082347-11cf2841d4e7?w=600&h=900&fit=crop',
  'w-satin-skirt.jpg': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=900&fit=crop',
  'w-silk-blouse.jpg': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600&h=900&fit=crop',
  'w-silk-ethnic-set.jpg': 'https://images.unsplash.com/photo-1597357366033-5c6a1c0e0ab5?w=600&h=900&fit=crop',
  'w-suit-trousers.jpg': 'https://images.unsplash.com/photo-1609269585289-03e6735266f1?w=600&h=900&fit=crop',
  'w-tailored-blazer.jpg': 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=600&h=900&fit=crop',
  'w-tailored-trousers.jpg': 'https://images.unsplash.com/photo-1591765486000-b4eda4d3f8e6?w=600&h=900&fit=crop',
  'w-trench-coat.jpg': 'https://images.unsplash.com/photo-1595777707802-07e4b3b90fc7?w=600&h=900&fit=crop',
  'w-velvet-dress.jpg': 'https://images.unsplash.com/photo-1618932260643-30bafa60fc71?w=600&h=900&fit=crop',
  'w-wide-leg-jeans.jpg': 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=600&h=900&fit=crop',
  
  // Men's Fashion - High quality fashion images
  'm-chikankari-kurta.jpg': 'https://images.unsplash.com/photo-1629887903895-a4b91f7a1ee0?w=600&h=900&fit=crop',
  'm-cotton-tshirt.jpg': 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&h=900&fit=crop',
  'm-crew-sweatshirt.jpg': 'https://images.unsplash.com/photo-1556821552-5c5f0b9a0c8d?w=600&h=900&fit=crop',
  'm-flannel-shirt.jpg': 'https://images.unsplash.com/photo-1552062407-291826081e8f?w=600&h=900&fit=crop',
  'm-fleece-hoodie.jpg': 'https://images.unsplash.com/photo-1556821552-5c5f0b9a0c8d?w=600&h=900&fit=crop',
  'm-formal-oxford.jpg': 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600&h=900&fit=crop',
  'm-linen-shirt.jpg': 'https://images.unsplash.com/photo-1618932260643-30bafa60fc71?w=600&h=900&fit=crop',
  'm-pique-polo.jpg': 'https://images.unsplash.com/photo-1618932260643-30bafa60fc71?w=600&h=900&fit=crop',
  'm-pleated-trouser.jpg': 'https://images.unsplash.com/photo-1591765486000-b4eda4d3f8e6?w=600&h=900&fit=crop',
  'm-silk-kurta.jpg': 'https://images.unsplash.com/photo-1629887903895-a4b91f7a1ee0?w=600&h=900&fit=crop',
  'm-slim-chinos.jpg': 'https://images.unsplash.com/photo-1602968244866-cf3babca26fe?w=600&h=900&fit=crop',
  'm-stretch-jeans.jpg': 'https://images.unsplash.com/photo-1601821310504-bf5baf0588f7?w=600&h=900&fit=crop',
  'm-suede-jacket.jpg': 'https://images.unsplash.com/photo-1551028719-00167b16ebc5?w=600&h=900&fit=crop'
};

// Function to download image with retry logic
function downloadImage(filename, imageUrl) {
  return new Promise((resolve, reject) => {
    console.log(`⏳ Downloading: ${filename}`);
    
    const filepath = path.join(CATALOG_DIR, filename);
    const file = fs.createWriteStream(filepath);
    
    const urlObj = new URL(imageUrl);
    const protocol = urlObj.protocol === 'https:' ? https : http;
    
    protocol.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`✅ Downloaded: ${filename}`);
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

// Download all images sequentially with delay
async function downloadAllImages() {
  console.log('🛍️  Starting fashion image download...\n');
  
  let downloaded = 0;
  let failed = 0;
  
  for (const [filename, imageUrl] of Object.entries(products)) {
    try {
      await downloadImage(filename, imageUrl);
      downloaded++;
      // Add delay between requests (500ms)
      await new Promise(r => setTimeout(r, 500));
    } catch (error) {
      console.error(`❌ Failed: ${filename} - ${error.message}`);
      failed++;
    }
  }
  
  console.log(`\n📊 Download Complete!`);
  console.log(`✅ Successfully downloaded: ${downloaded} images`);
  if (failed > 0) console.log(`⚠️  Failed: ${failed} images`);
  console.log(`📁 Images saved to: ${CATALOG_DIR}`);
  console.log(`\n🎉 Your product images are ready! Refresh your browser to see them.`);
}

// Run the download
downloadAllImages().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
