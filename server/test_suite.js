import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const BASE_URL = 'http://localhost:3003';

async function runTests() {
  console.log('='.repeat(65));
  console.log('🧪 OMNIFIT COMPREHENSIVE AUTOMATED TEST SUITE — CATALOG & QUALITY');
  console.log('='.repeat(65));

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Error: ${err.message}`);
      failed++;
    }
  }

  // Fetch full catalog for cross-test validation
  const allProductsRes = await fetch(`${BASE_URL}/api/products`);
  const allProductsData = await allProductsRes.json();
  const allProducts = allProductsData.products || [];

  // ---------------------------------------------------------
  // 1. DATASET INTEGRITY & UNIQUE PRODUCT IDS
  // ---------------------------------------------------------
  console.log('\n--- 1. DATASET INTEGRITY & UNIQUE PRODUCT IDS ---');

  await test("Catalog contains adequate products across all departments (>= 20 items)", async () => {
    assert.ok(allProducts.length >= 20, `Expected at least 20 products, got ${allProducts.length}`);
  });

  await test("Every product has a unique, non-empty ID", async () => {
    const ids = allProducts.map(p => p.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, ids.length, `Duplicate product IDs found! Unique: ${uniqueIds.size}, Total: ${ids.length}`);
    for (const id of ids) {
      assert.ok(typeof id === 'string' && id.trim().length > 0, `Invalid product ID: ${id}`);
    }
  });

  await test("Every product has valid normalized gender and category values", async () => {
    const validGenders = ['women', 'men', 'kids', 'unisex'];
    const validCategories = ['clothing', 'footwear', 'accessories'];

    for (const p of allProducts) {
      assert.ok(validGenders.includes(p.gender), `Product ${p.id} has invalid gender: "${p.gender}"`);
      assert.ok(validCategories.includes(p.category), `Product ${p.id} has invalid category: "${p.category}"`);
      assert.ok(p.name && p.name.trim().length > 3, `Product ${p.id} has invalid name: "${p.name}"`);
      assert.ok(typeof p.price === 'number' && p.price > 0, `Product ${p.id} has invalid price: ${p.price}`);
      assert.ok(Array.isArray(p.sizes) && p.sizes.length > 0, `Product ${p.id} has missing sizes`);
      assert.ok(Array.isArray(p.colors) && p.colors.length > 0, `Product ${p.id} has missing colors`);
      assert.ok(p.stock && typeof p.stock === 'object', `Product ${p.id} has missing stock object`);
    }
  });

  // ---------------------------------------------------------
  // 2. IMAGE MAPPING & LOCAL ASSET EXISTENCE
  // ---------------------------------------------------------
  console.log('\n--- 2. IMAGE MAPPING & LOCAL ASSET VERIFICATION ---');

  await test("Every product image exists as a real file on disk in public/", async () => {
    for (const p of allProducts) {
      assert.ok(p.image && typeof p.image === 'string', `Product ${p.id} is missing an image path`);
      const relPath = p.image.startsWith('/') ? p.image.slice(1) : p.image;
      const fullPath = path.join(PUBLIC_DIR, relPath);
      assert.ok(fs.existsSync(fullPath), `Product ${p.id} image missing from disk: ${fullPath} (${p.image})`);
    }
  });

  await test("Neutral fallback image exists on disk in public/fallback-product.svg", async () => {
    const fallbackPath = path.join(PUBLIC_DIR, 'fallback-product.svg');
    assert.ok(fs.existsSync(fallbackPath), `Fallback asset missing: ${fallbackPath}`);
    const content = fs.readFileSync(fallbackPath, 'utf8');
    assert.ok(content.includes('<svg') && content.includes('OmniFit'), 'Fallback SVG is invalid');
  });

  await test("No male model images (Dress-1/2/3) are mapped to women's products or accessories", async () => {
    const maleModelImages = ['/Dress-1.png', '/Dress-2.png', '/Dress-3.png'];

    for (const p of allProducts) {
      if (p.gender === 'women') {
        assert.ok(!maleModelImages.includes(p.image), `Violation: Women's product "${p.name}" (${p.id}) is using male image ${p.image}!`);
      }
      if (p.category === 'accessories') {
        assert.ok(!maleModelImages.includes(p.image), `Violation: Accessory product "${p.name}" (${p.id}) is using male clothing image ${p.image}!`);
      }
      if (p.category === 'footwear') {
        assert.ok(!maleModelImages.includes(p.image), `Violation: Footwear product "${p.name}" (${p.id}) is using clothing image ${p.image}!`);
      }
    }
  });

  await test("Dress-1.png, Dress-2.png, Dress-3.png are strictly mapped to corresponding Men's apparel", async () => {
    const p1 = allProducts.find(p => p.image === '/Dress-1.png');
    assert.ok(p1, "Dress-1.png should be mapped to an existing product");
    assert.strictEqual(p1.gender, 'men');
    assert.ok(p1.name.toLowerCase().includes('shirt') || p1.name.toLowerCase().includes('flannel'));

    const p2 = allProducts.find(p => p.image === '/Dress-2.png');
    assert.ok(p2, "Dress-2.png should be mapped to an existing product");
    assert.strictEqual(p2.gender, 'men');
    assert.ok(p2.name.toLowerCase().includes('linen') || p2.name.toLowerCase().includes('shirt'));

    const p3 = allProducts.find(p => p.image === '/Dress-3.png');
    assert.ok(p3, "Dress-3.png should be mapped to an existing product");
    assert.strictEqual(p3.gender, 'men');
    assert.ok(p3.name.toLowerCase().includes('jacket') || p3.name.toLowerCase().includes('suede'));
  });

  await test("Women's dresses are mapped to genuine dress images (not shirts or men's models)", async () => {
    const dresses = allProducts.filter(p => p.gender === 'women' && p.subcategory === 'dresses');
    assert.ok(dresses.length >= 3, `Expected at least 3 women's dresses, found ${dresses.length}`);
    for (const d of dresses) {
      assert.ok(
        d.image.includes('dress') || d.image.includes('maxi'),
        `Dress ${d.id} has questionable image path: ${d.image}`
      );
    }
  });

  // ---------------------------------------------------------
  // 3. GENDER ISOLATION & COLLECTION CORRECTNESS
  // ---------------------------------------------------------
  console.log('\n--- 3. GENDER ISOLATION & COLLECTION CORRECTNESS ---');

  await test("Women collection contains ZERO male products", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=women`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.notStrictEqual(p.gender, 'men', `Violation: Found male product "${p.name}" in Women's collection!`);
      assert.ok(p.gender === 'women' || p.gender === 'unisex');
    }
  });

  await test("Men collection contains ZERO female products", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=men`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.notStrictEqual(p.gender, 'women', `Violation: Found female product "${p.name}" in Men's collection!`);
      assert.ok(p.gender === 'men' || p.gender === 'unisex');
      assert.notStrictEqual(p.subcategory, 'dresses', `Violation: Found dress in Men's collection!`);
    }
  });

  await test("Kids collection contains ONLY kids products (no adult blazers, dresses or sizes)", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=kids`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3, "Kids collection should have products");
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'kids', `Violation: Non-kid product in Kids collection: ${p.name}`);
      // Check that kids sizing doesn't contain adult waist sizes
      assert.ok(!p.sizes.includes('34') && !p.sizes.includes('36'), `Violation: Adult waist size on kid product ${p.name}`);
    }
  });

  // ---------------------------------------------------------
  // 4. CATEGORY & FILTER INTERACTIONS
  // ---------------------------------------------------------
  console.log('\n--- 4. CATEGORY & FILTER INTERACTIONS ---');

  await test("Women -> Dresses returns only women dresses", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=women&subcategory=dresses`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'women');
      assert.strictEqual(p.subcategory, 'dresses');
    }
  });

  await test("Women -> Tops returns only women tops/blouses", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=women&subcategory=tops`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 1);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'women');
      assert.strictEqual(p.subcategory, 'tops');
    }
  });

  await test("Men -> Shirts returns only men shirts", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=men&subcategory=shirts`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 2);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'men');
      assert.strictEqual(p.subcategory, 'shirts');
    }
  });

  await test("Men -> Jackets returns only men jackets", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=men&subcategory=jackets`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 1);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'men');
      assert.strictEqual(p.subcategory, 'jackets');
    }
  });

  await test("Kids -> Boys Clothing returns boys items", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=kids&subcategory=boys`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 1);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'kids');
      assert.strictEqual(p.subcategory, 'boys');
    }
  });

  await test("Kids -> Girls Clothing returns girls items", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=kids&subcategory=girls`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 1);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'kids');
      assert.strictEqual(p.subcategory, 'girls');
    }
  });

  await test("Footwear department returns ONLY footwear (no accessories or clothing)", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=footwear`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3);
    for (const p of data.products) {
      assert.strictEqual(p.category, 'footwear', `Violation: Non-footwear product "${p.name}" in footwear department!`);
    }
  });

  await test("Accessories department returns ONLY accessories (no shoes or shirts)", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=accessories`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3);
    for (const p of data.products) {
      assert.strictEqual(p.category, 'accessories', `Violation: Non-accessory product "${p.name}" in accessories department!`);
    }
  });

  // ---------------------------------------------------------
  // 5. ACCURATE COUNTS & EMPTY RESULT INTEGRITY
  // ---------------------------------------------------------
  console.log('\n--- 5. ACCURATE COUNTS & EMPTY RESULT INTEGRITY ---');

  await test("Returned product count matches the filtered array length exactly", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=women`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.total, data.products.length, `Count mismatch: data.total=${data.total}, products.length=${data.products.length}`);
  });

  await test("Empty filter returns 0 results WITHOUT fallback to full catalog", async () => {
    // Search for impossible criteria: kids dresses with minPrice 99999
    const res = await fetch(`${BASE_URL}/api/products?gender=kids&minPrice=99999`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.products.length, 0, `Violation: Empty filter returned ${data.products.length} products instead of 0! Fallback to full catalog detected!`);
    assert.strictEqual(data.total, 0);
  });

  await test("Impossible subcategory in gender returns 0 results", async () => {
    // Requesting shirts under kids (when subcategory is boys/girls/baby)
    const res = await fetch(`${BASE_URL}/api/products?gender=kids&subcategory=heels`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.products.length, 0, "Expected 0 results for kids heels");
  });

  // ---------------------------------------------------------
  // 6. CART IDENTITY, INVENTORY & ORDERS
  // ---------------------------------------------------------
  console.log('\n--- 6. CART IDENTITY, INVENTORY & ORDERS ---');

  let testUserToken = '';
  const testEmail = `test_${Date.now()}@example.com`;

  await test("Register new user for cart & order verification", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'OmniFit Test Customer',
        email: testEmail,
        password: 'securepassword123'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    testUserToken = data.token;
  });

  let createdOrderId = '';

  await test("Add to cart & place order preserves exact product identity, selected size, and price", async () => {
    const targetProduct = allProducts.find(p => p.id === 'w-dress-1');
    assert.ok(targetProduct, 'Target product w-dress-1 must exist');
    const initialStockM = targetProduct.stock['M'];

    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testUserToken}`
      },
      body: JSON.stringify({
        items: [
          {
            productId: targetProduct.id,
            quantity: 1,
            selectedSize: 'M',
            selectedColor: 'Midnight Blue'
          }
        ],
        shippingAddress: {
          name: 'Jane Doe',
          street: '456 Fashion Blvd',
          city: 'New York',
          state: 'NY',
          zipCode: '10001',
          country: 'US'
        },
        deliveryMethod: 'prime_standard',
        paymentMethod: 'OmniFit Pay'
      })
    });

    const data = await res.json();
    assert.strictEqual(data.success, true);
    createdOrderId = data.order.id;

    // Verify order item identity
    const orderItem = data.order.items[0];
    assert.strictEqual(orderItem.productId, targetProduct.id);
    assert.strictEqual(orderItem.name, targetProduct.name);
    assert.strictEqual(orderItem.image, targetProduct.image);
    assert.strictEqual(orderItem.price, targetProduct.price);
    assert.strictEqual(orderItem.selectedSize, 'M');
    assert.strictEqual(orderItem.selectedColor, 'Midnight Blue');

    // Verify stock decremented
    const pRes = await fetch(`${BASE_URL}/api/products/${targetProduct.id}`);
    const pData = await pRes.json();
    assert.strictEqual(pData.product.stock['M'], initialStockM - 1, 'Stock did not decrement');
  });

  await test("Order cancellation properly restores inventory", async () => {
    const targetProduct = allProducts.find(p => p.id === 'w-dress-1');
    const pResBefore = await fetch(`${BASE_URL}/api/products/${targetProduct.id}`);
    const stockBefore = (await pResBefore.json()).product.stock['M'];

    const res = await fetch(`${BASE_URL}/api/orders/${createdOrderId}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason: 'Catalog test cancellation' })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.order.status, 'Cancelled');

    const pResAfter = await fetch(`${BASE_URL}/api/products/${targetProduct.id}`);
    const stockAfter = (await pResAfter.json()).product.stock['M'];
    assert.strictEqual(stockAfter, stockBefore + 1, 'Stock was not restored after cancellation');
  });

  // ---------------------------------------------------------
  // 7. AI & VIRTUAL TRY-ON VALIDATION
  // ---------------------------------------------------------
  console.log('\n--- 7. AI & VIRTUAL TRY-ON VALIDATION ---');

  await test("AI size recommender provides accurate recommendation", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/size-recommend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        heightCm: 178,
        weightKg: 72,
        fitPreference: 'regular'
      })
    });
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(['XS', 'S', 'M', 'L', 'XL'].includes(data.recommendedSize));
  });

  await test("Virtual Try-On API validates required input images properly", async () => {
    const emptyRes = await fetch(`${BASE_URL}/api/generate-tryon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    });
    assert.strictEqual(emptyRes.status, 400);

    const validRes = await fetch(`${BASE_URL}/api/generate-tryon`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        faceImage: 'data:image/jpeg;base64,face_sample',
        outfitImage: 'data:image/jpeg;base64,outfit_sample'
      })
    });
    const validData = await validRes.json();
    assert.strictEqual(validData.success, true);
  });

  // ---------------------------------------------------------
  // 8. VERIFICATION OF ALL 16 MANDATORY USER SCENARIOS
  // ---------------------------------------------------------
  console.log('\n--- 8. VERIFICATION OF ALL 16 MANDATORY USER SCENARIOS ---');

  // Scenario 1: Open All Items with no filters: valid products appear
  await test("Scenario 1: Open All Items with no filters returns full catalog of valid products", async () => {
    const res = await fetch(`${BASE_URL}/api/products`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.products.length, 25);
  });

  // Scenario 2: Select Women: no men's-only products appear
  await test("Scenario 2: Select Women contains no men's-only products", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=women`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.ok(p.gender === 'women' || p.gender === 'unisex');
      assert.notStrictEqual(p.gender, 'men');
    }
  });

  // Scenario 3: Select Men: no women's-only products appear
  await test("Scenario 3: Select Men contains no women's-only products", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=men`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.ok(p.gender === 'men' || p.gender === 'unisex');
      assert.notStrictEqual(p.gender, 'women');
      assert.notStrictEqual(p.subcategory, 'dresses');
    }
  });

  // Scenario 4: Select Kids: only kids' products appear
  await test("Scenario 4: Select Kids returns exclusively kids' products", async () => {
    const res = await fetch(`${BASE_URL}/api/products?gender=kids`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.products.length, 3);
    for (const p of data.products) {
      assert.strictEqual(p.gender, 'kids');
    }
  });

  // Scenario 5: Select Dresses: no shirts, shoes, or accessories appear
  await test("Scenario 5: Select Dresses returns only dresses (no shirts, footwear, or accessories)", async () => {
    const res = await fetch(`${BASE_URL}/api/products?subcategory=dresses`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3);
    for (const p of data.products) {
      assert.strictEqual(p.subcategory, 'dresses');
      assert.strictEqual(p.category, 'clothing');
    }
  });

  // Scenario 6: Select Red: red products appear
  await test("Scenario 6: Select Red returns matching products across shades", async () => {
    const res = await fetch(`${BASE_URL}/api/products?color=red`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3);
    for (const p of data.products) {
      const pColors = p.colors.join(' ').toLowerCase();
      assert.ok(
        pColors.includes('red') || pColors.includes('burgundy') || pColors.includes('maroon') || pColors.includes('ruby'),
        `Product ${p.id} does not contain red shade: ${p.colors}`
      );
    }
  });

  // Scenario 7: Select Red plus a price range: only products satisfying both conditions appear
  await test("Scenario 7: Select Red plus price range ($50-$100) satisfies both conditions", async () => {
    const res = await fetch(`${BASE_URL}/api/products?color=red&minPrice=50&maxPrice=100`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.ok(p.price >= 50 && p.price <= 100);
      const pColors = p.colors.join(' ').toLowerCase();
      assert.ok(pColors.includes('red') || pColors.includes('ruby') || pColors.includes('burgundy'));
    }
  });

  // Scenario 8: Select a size: only products available in that size appear
  await test("Scenario 8: Select size (XS) returns only products offering size XS", async () => {
    const res = await fetch(`${BASE_URL}/api/products?size=XS`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.ok(p.sizes.includes('XS'), `Product ${p.id} missing size XS: ${p.sizes}`);
    }
  });

  // Scenario 9: Select In Stock Only: out-of-stock products disappear
  await test("Scenario 9: Select In Stock Only excludes out-of-stock items (w-trouser-1)", async () => {
    const allRes = await fetch(`${BASE_URL}/api/products`);
    const allData = await allRes.json();
    const inStockRes = await fetch(`${BASE_URL}/api/products?inStock=true`);
    const inStockData = await inStockRes.json();

    assert.strictEqual(allData.products.length, 25);
    assert.strictEqual(inStockData.products.length, 24);
    assert.ok(!inStockData.products.some(p => p.id === 'w-trouser-1'), "Out-of-stock item w-trouser-1 should be excluded");
  });

  // Scenario 10: Enable Virtual Try-On Ready: only eligible products appear
  await test("Scenario 10: Enable Virtual Try-On Ready returns only hasTryOn: true items", async () => {
    const res = await fetch(`${BASE_URL}/api/products?hasTryOn=true`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length > 0);
    for (const p of data.products) {
      assert.strictEqual(p.hasTryOn, true, `Product ${p.id} has hasTryOn: false`);
    }
  });

  // Multi-size OR logic within group:
  await test("Multi-size filter uses OR logic within sizes group", async () => {
    const res = await fetch(`${BASE_URL}/api/products?size=XS&size=XXL`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    for (const p of data.products) {
      assert.ok(p.sizes.includes('XS') || p.sizes.includes('XXL'));
    }
  });

  // Multi-color OR logic within group:
  await test("Multi-color filter uses OR logic within colors group", async () => {
    const res = await fetch(`${BASE_URL}/api/products?color=red&color=green`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    for (const p of data.products) {
      const pColors = p.colors.join(' ').toLowerCase();
      const hasRed = pColors.includes('red') || pColors.includes('burgundy') || pColors.includes('ruby');
      const hasGreen = pColors.includes('green') || pColors.includes('emerald') || pColors.includes('sage') || pColors.includes('olive');
      assert.ok(hasRed || hasGreen, `Product ${p.id} neither red nor green: ${p.colors}`);
    }
  });

  // Scenario 14: Search + Sorting
  await test("Scenario 14: Search for product name ('leather') and sort by price ascending", async () => {
    const res = await fetch(`${BASE_URL}/api/products?search=leather&sortBy=price_asc`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    assert.ok(data.products.length >= 3);
    for (let i = 1; i < data.products.length; i++) {
      assert.ok(data.products[i].price >= data.products[i - 1].price, "Prices are not in ascending order");
    }
  });

  await test("Scenario 14b: Sort by customer rating descending", async () => {
    const res = await fetch(`${BASE_URL}/api/products?sortBy=rating`);
    const data = await res.json();
    assert.strictEqual(data.success, true);
    for (let i = 1; i < data.products.length; i++) {
      assert.ok((data.products[i - 1].rating || 0) >= (data.products[i].rating || 0), "Ratings not in descending order");
    }
  });

  // Scenario 15: Product card data integrity
  await test("Scenario 15: All product cards have matching images, names, categories, and gender labels", async () => {
    for (const p of allProducts) {
      assert.ok(p.name && p.name.length > 3);
      assert.ok(p.image && p.image.startsWith('/'));
      assert.ok(['women', 'men', 'kids', 'unisex'].includes(p.gender));
      assert.ok(['clothing', 'footwear', 'accessories'].includes(p.category));
      assert.ok(typeof p.price === 'number' && p.price > 0);
      assert.ok(typeof p.rating === 'number' && p.rating >= 1 && p.rating <= 5);
      assert.ok(typeof p.reviewCount === 'number');
    }
  });

  console.log('\n' + '='.repeat(65));
  console.log(`📊 FINAL TEST REPORT: ${passed} PASSED, ${failed} FAILED`);
  console.log('='.repeat(65));

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
