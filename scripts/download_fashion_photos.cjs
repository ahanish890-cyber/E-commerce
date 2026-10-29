const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const catalogDir = path.join(__dirname, '..', 'public', 'catalog');
const publicDir = path.join(__dirname, '..', 'public');

const downloads = [
  // Men's Products
  {
    id: 'm-shirt-1',
    url: 'https://images.pexels.com/photos/1310497/pexels-photo-1310497.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-flannel-shirt.jpg',
    alsoCopyPublic: 'Dress-1.png'
  },
  {
    id: 'm-shirt-2',
    url: 'https://images.pexels.com/photos/5384442/pexels-photo-5384442.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-linen-shirt.jpg',
    alsoCopyPublic: 'Dress-2.png'
  },
  {
    id: 'm-formal-1',
    url: 'https://images.pexels.com/photos/17793444/pexels-photo-17793444.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-formal-oxford.jpg'
  },
  {
    id: 'm-tshirt-1',
    url: 'https://images.pexels.com/photos/30113171/pexels-photo-30113171.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-cotton-tshirt.jpg'
  },
  {
    id: 'm-polo-1',
    url: 'https://images.pexels.com/photos/2102587/pexels-photo-2102587.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-pique-polo.jpg'
  },
  {
    id: 'm-jean-1',
    url: 'https://images.pexels.com/photos/2244954/pexels-photo-2244954.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-stretch-jeans.jpg'
  },
  {
    id: 'm-trouser-1',
    url: 'https://images.pexels.com/photos/30291993/pexels-photo-30291993.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-pleated-trouser.jpg'
  },
  {
    id: 'm-chino-1',
    url: 'https://images.pexels.com/photos/8054457/pexels-photo-8054457.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-slim-chinos.jpg'
  },
  {
    id: 'm-hoodie-1',
    url: 'https://images.pexels.com/photos/30644130/pexels-photo-30644130.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-fleece-hoodie.jpg'
  },
  {
    id: 'm-sweatshirt-1',
    url: 'https://images.pexels.com/photos/17366367/pexels-photo-17366367.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-crew-sweatshirt.jpg'
  },
  {
    id: 'm-jacket-1',
    url: 'https://images.pexels.com/photos/11007789/pexels-photo-11007789.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-suede-jacket.jpg',
    alsoCopyPublic: 'Dress-3.png'
  },
  {
    id: 'm-kurta-2',
    url: 'https://images.pexels.com/photos/40341347/pexels-photo-40341347.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'm-chikankari-kurta.jpg'
  },

  // Women's Products
  {
    id: 'w-top-3',
    url: 'https://images.pexels.com/photos/20708688/pexels-photo-20708688.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-peplum-top.jpg'
  },
  {
    id: 'w-tshirt-1',
    url: 'https://images.pexels.com/photos/10816834/pexels-photo-10816834.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-graphic-tshirt.jpg'
  },
  {
    id: 'w-shirt-1',
    url: 'https://images.pexels.com/photos/12401676/pexels-photo-12401676.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-poplin-shirt.jpg'
  },
  {
    id: 'w-jean-1',
    url: 'https://images.pexels.com/photos/29177114/pexels-photo-29177114.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-wide-leg-jeans.jpg'
  },
  {
    id: 'w-trouser-1',
    url: 'https://images.pexels.com/photos/15633556/pexels-photo-15633556.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-tailored-trousers.jpg'
  },
  {
    id: 'w-skirt-1',
    url: 'https://images.pexels.com/photos/29971932/pexels-photo-29971932.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-satin-skirt.jpg'
  },
  {
    id: 'w-kurti-1',
    url: 'https://images.pexels.com/photos/30378033/pexels-photo-30378033.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-printed-kurti.jpg'
  },
  {
    id: 'w-ethnic-2',
    url: 'https://images.pexels.com/photos/29774640/pexels-photo-29774640.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-silk-ethnic-set.jpg'
  },
  {
    id: 'w-coord-1',
    url: 'https://images.pexels.com/photos/11270275/pexels-photo-11270275.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-linen-coord.jpg'
  },
  {
    id: 'w-blazer-1',
    url: 'https://images.pexels.com/photos/8308933/pexels-photo-8308933.jpeg?auto=compress&cs=tinysrgb&w=800',
    dest: 'w-tailored-blazer.jpg'
  }
];

console.log(`Starting download of ${downloads.length} realistic fashion photographs...`);

for (const item of downloads) {
  const destPath = path.join(catalogDir, item.dest);
  console.log(`Downloading [${item.id}] -> ${item.dest}...`);
  try {
    execSync(`curl.exe -k -s -L -o "${destPath}" "${item.url}"`);
    const stat = fs.statSync(destPath);
    console.log(`  ✓ Successfully saved ${item.dest} (${(stat.size / 1024).toFixed(1)} KB)`);

    if (item.alsoCopyPublic) {
      const pubPath = path.join(publicDir, item.alsoCopyPublic);
      fs.copyFileSync(destPath, pubPath);
      console.log(`  ✓ Mirrored to public/${item.alsoCopyPublic}`);
    }
  } catch (err) {
    console.error(`  ✗ Failed to download ${item.id}:`, err.message);
  }
}

// Clean up unused cartoon SVGs in public/catalog
const svgFilesToRemove = [
  'm-chikankari-kurta.svg',
  'm-cotton-tshirt.svg',
  'm-crew-sweatshirt.svg',
  'm-fleece-hoodie.svg',
  'm-formal-oxford.svg',
  'm-pique-polo.svg',
  'm-pleated-trouser.svg',
  'm-slim-chinos.svg',
  'm-stretch-jeans.svg',
  'w-graphic-tshirt.svg',
  'w-linen-coord.svg',
  'w-peplum-top.svg',
  'w-poplin-shirt.svg',
  'w-printed-kurti.svg',
  'w-satin-skirt.svg',
  'w-silk-ethnic-set.svg',
  // obsolete categories
  'a-aviator-sunglasses.svg',
  'a-chronograph-watch.svg',
  'a-leather-belt.svg',
  'a-leather-tote.svg',
  'f-chelsea-boots.svg',
  'f-stiletto-pumps.svg',
  'k-organic-romper.svg'
];

console.log('\nCleaning up old cartoon SVG files...');
for (const svg of svgFilesToRemove) {
  const p = path.join(catalogDir, svg);
  if (fs.existsSync(p)) {
    fs.unlinkSync(p);
    console.log(`  ✓ Removed ${svg}`);
  }
}

console.log('\n✅ All fashion photography downloaded and catalog cleaned up!');

