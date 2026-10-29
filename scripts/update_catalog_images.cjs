const fs = require('fs');
const path = require('path');

const imageMap = {
  'm-shirt-1': '/catalog/m-flannel-shirt.jpg',
  'm-shirt-2': '/catalog/m-linen-shirt.jpg',
  'm-formal-1': '/catalog/m-formal-oxford.jpg',
  'm-tshirt-1': '/catalog/m-cotton-tshirt.jpg',
  'm-polo-1': '/catalog/m-pique-polo.jpg',
  'm-jean-1': '/catalog/m-stretch-jeans.jpg',
  'm-trouser-1': '/catalog/m-pleated-trouser.jpg',
  'm-chino-1': '/catalog/m-slim-chinos.jpg',
  'm-hoodie-1': '/catalog/m-fleece-hoodie.jpg',
  'm-sweatshirt-1': '/catalog/m-crew-sweatshirt.jpg',
  'm-jacket-1': '/catalog/m-suede-jacket.jpg',
  'm-kurta-1': '/catalog/m-silk-kurta.jpg',
  'm-kurta-2': '/catalog/m-chikankari-kurta.jpg',

  'w-coat-1': '/catalog/w-trench-coat.jpg',
  'w-dress-1': '/catalog/w-dress-midnight.jpg',
  'w-dress-2': '/catalog/w-velvet-dress.jpg',
  'w-dress-3': '/catalog/w-floral-maxi.jpg',
  'w-top-1': '/catalog/w-silk-blouse.jpg',
  'w-top-2': '/catalog/w-ribbed-crop-top.jpg',
  'w-top-3': '/catalog/w-peplum-top.jpg',
  'w-tshirt-1': '/catalog/w-graphic-tshirt.jpg',
  'w-shirt-1': '/catalog/w-poplin-shirt.jpg',
  'w-jean-1': '/catalog/w-wide-leg-jeans.jpg',
  'w-trouser-1': '/catalog/w-tailored-trousers.jpg',
  'w-trouser-2': '/catalog/w-suit-trousers.jpg',
  'w-skirt-1': '/catalog/w-satin-skirt.jpg',
  'w-kurti-1': '/catalog/w-printed-kurti.jpg',
  'w-ethnic-1': '/catalog/w-ethnic-kurta.jpg',
  'w-ethnic-2': '/catalog/w-silk-ethnic-set.jpg',
  'w-coord-1': '/catalog/w-linen-coord.jpg',
  'w-blazer-1': '/catalog/w-tailored-blazer.jpg'
};

// 1. Update products.json
const productsJsonPath = path.join(__dirname, '..', 'server', 'data', 'products.json');
const products = JSON.parse(fs.readFileSync(productsJsonPath, 'utf8'));

products.forEach(p => {
  if (imageMap[p.id]) {
    p.image = imageMap[p.id];
  }
});

fs.writeFileSync(productsJsonPath, JSON.stringify(products, null, 2), 'utf8');
console.log('✅ Updated server/data/products.json with new photo paths');

// 2. Update constants.tsx
const constantsPath = path.join(__dirname, '..', 'constants.tsx');
let constantsContent = fs.readFileSync(constantsPath, 'utf8');

// Replace all .svg catalog paths with .jpg in constants.tsx
Object.entries(imageMap).forEach(([id, img]) => {
  // Find id in constants and replace its image property
  const regex = new RegExp(`(id:\\s*['"]${id}['"][\\s\\S]*?image:\\s*['"])([^'"]+)(['"])`);
  constantsContent = constantsContent.replace(regex, `$1${img}$3`);
});

fs.writeFileSync(constantsPath, constantsContent, 'utf8');
console.log('✅ Updated constants.tsx with new photo paths');

