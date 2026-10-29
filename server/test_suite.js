import assert from 'assert';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.resolve(__dirname, '../public');

const PORT = process.env.PORT || 3001;
const BASE_URL = `http://localhost:${PORT}`;

async function runTests() {
  console.log('='.repeat(70));
  console.log('🧪 OMNIFIT COMPREHENSIVE AUTOMATED TEST SUITE — ENHANCED PLATFORM');
  console.log('='.repeat(70));

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

  // Fetch full catalog from backend
  const allProductsRes = await fetch(`${BASE_URL}/api/products`);
  const allProductsData = await allProductsRes.json();
  const allProducts = allProductsData.products || [];

  // ---------------------------------------------------------
  // 1. DATASET INTEGRITY & UNIQUE PRODUCT IDS
  // ---------------------------------------------------------
  console.log('\n--- 1. DATASET INTEGRITY & UNIQUE PRODUCT IDS ---');

  await test("Catalog contains comprehensive clothing items (>= 30 items)", async () => {
    assert.ok(allProducts.length >= 30, `Expected at least 30 products, got ${allProducts.length}`);
  });

  await test("Every product has a unique, non-empty ID", async () => {
    const ids = allProducts.map(p => p.id);
    const uniqueIds = new Set(ids);
    assert.strictEqual(uniqueIds.size, ids.length, `Duplicate product IDs found! Unique: ${uniqueIds.size}, Total: ${ids.length}`);
    for (const id of ids) {
      assert.ok(typeof id === 'string' && id.trim().length > 0, `Invalid product ID: ${id}`);
    }
  });

  await test("Every product is strictly Men's or Women's clothing (No kids, footwear, or accessories)", async () => {
    const validGenders = ['women', 'men', 'unisex'];
    for (const p of allProducts) {
      assert.ok(validGenders.includes(p.gender), `Product ${p.id} has invalid gender: "${p.gender}"`);
      assert.strictEqual(p.category, 'clothing', `Product ${p.id} is not clothing: "${p.category}"`);
      assert.ok(p.gender !== 'kids', `Product ${p.id} is kids product`);
      assert.ok(p.category !== 'footwear', `Product ${p.id} is footwear`);
      assert.ok(p.category !== 'accessories', `Product ${p.id} is accessory`);
    }
  });

  // ---------------------------------------------------------
  // 2. IMAGE MAPPING & LOCAL ASSET VERIFICATION
  // ---------------------------------------------------------
  console.log('\n--- 2. IMAGE MAPPING & LOCAL ASSET VERIFICATION ---');

  await test("Every product image exists as a real file on disk in public/", async () => {
    for (const p of allProducts) {
      assert.ok(p.image, `Product ${p.id} is missing an image path`);
      const relativePath = p.image.startsWith('/') ? p.image.slice(1) : p.image;
      const fullPath = path.resolve(PUBLIC_DIR, relativePath);
      assert.ok(fs.existsSync(fullPath), `Image file missing on disk for product ${p.id}: ${fullPath}`);
    }
  });

  await test("Neutral fallback image exists on disk in public/fallback-product.svg", async () => {
    const fallbackPath = path.resolve(PUBLIC_DIR, 'fallback-product.svg');
    assert.ok(fs.existsSync(fallbackPath), `Fallback image missing: ${fallbackPath}`);
  });

  await test("All product images are realistic high-resolution fashion photographs (no cartoon SVGs)", async () => {
    for (const p of allProducts) {
      assert.ok(!p.image.endsWith('.svg'), `Product ${p.id} must not use cartoon SVG illustration: ${p.image}`);
      assert.ok(p.image.endsWith('.jpg') || p.image.endsWith('.jpeg') || p.image.endsWith('.png'), `Product ${p.id} image must be a photo: ${p.image}`);
      const relativePath = p.image.startsWith('/') ? p.image.slice(1) : p.image;
      const fullPath = path.resolve(PUBLIC_DIR, relativePath);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 20000, `Image for ${p.id} must be high-resolution photo (>20KB): ${stat.size} bytes`);
    }
  });

  await test("Every product has a distinct, unique photographic asset (zero duplicate photos)", async () => {
    const imageSet = new Set();
    for (const p of allProducts) {
      assert.ok(!imageSet.has(p.image), `Duplicate image path found across products: ${p.image} in ${p.id}`);
      imageSet.add(p.image);
    }
  });

  // ---------------------------------------------------------
  // 3. INDIAN RUPEE (INR) PRICING CONFORMANCE
  // ---------------------------------------------------------
  console.log('\n--- 3. INDIAN RUPEE (INR) PRICING CONFORMANCE ---');

  await test("All products have realistic Indian retail prices (₹500 to ₹10,000)", async () => {
    for (const p of allProducts) {
      assert.ok(typeof p.price === 'number', `Product ${p.id} price is not a number`);
      assert.ok(p.price >= 500 && p.price <= 10000, `Product ${p.id} price is not in realistic INR range: ₹${p.price}`);
      assert.strictEqual(Math.round(p.price), p.price, `Product ${p.id} price should be an integer in INR`);
    }
  });

  // ---------------------------------------------------------
  // 4. GENDER & CATEGORY FILTERING INTEGRITY
  // ---------------------------------------------------------
  console.log('\n--- 4. GENDER & CATEGORY FILTERING INTEGRITY ---');

  await test("Women collection contains ZERO male products", async () => {
    const womenRes = await fetch(`${BASE_URL}/api/products?gender=women`);
    const womenData = await womenRes.json();
    assert.ok(womenData.success);
    assert.ok(womenData.products.length > 0);
    for (const p of womenData.products) {
      assert.ok(p.gender === 'women' || p.gender === 'unisex', `Found non-women product: ${p.id} (${p.gender})`);
    }
  });

  await test("Men collection contains ZERO female products", async () => {
    const menRes = await fetch(`${BASE_URL}/api/products?gender=men`);
    const menData = await menRes.json();
    assert.ok(menData.success);
    assert.ok(menData.products.length > 0);
    for (const p of menData.products) {
      assert.ok(p.gender === 'men' || p.gender === 'unisex', `Found non-men product: ${p.id} (${p.gender})`);
    }
  });

  await test("Querying removed departments (kids, footwear, accessories) returns 0 results", async () => {
    for (const dep of ['kids', 'footwear', 'accessories']) {
      const res = await fetch(`${BASE_URL}/api/products?gender=${dep}`);
      const data = await res.json();
      assert.strictEqual(data.products.length, 0, `Department ${dep} should return 0 items`);
    }
  });

  await test("All required Men categories exist in catalog", async () => {
    const menSubs = allProducts.filter(p => p.gender === 'men').map(p => p.subcategory);
    const required = ['casual_shirts', 'formal_shirts', 't-shirts', 'polo_tshirts', 'jeans', 'trousers', 'chinos', 'hoodies', 'sweatshirts', 'jackets', 'kurtas'];
    for (const req of required) {
      assert.ok(menSubs.includes(req), `Men category missing from catalog: ${req}`);
    }
  });

  await test("All required Women categories exist in catalog", async () => {
    const womenSubs = allProducts.filter(p => p.gender === 'women').map(p => p.subcategory);
    const required = ['tops', 't-shirts', 'shirts', 'jeans', 'trousers', 'dresses', 'skirts', 'kurtis', 'kurtas', 'ethnic_sets', 'coord_sets', 'jackets'];
    for (const req of required) {
      assert.ok(womenSubs.includes(req), `Women category missing from catalog: ${req}`);
    }
  });

  // ---------------------------------------------------------
  // 5. USER AUTHENTICATION & INDIAN ADDRESS CHECKOUT
  // ---------------------------------------------------------
  console.log('\n--- 5. USER AUTHENTICATION & INDIAN ADDRESS CHECKOUT ---');

  let testToken = '';
  let testUserId = '';

  await test("Register new customer account", async () => {
    const email = `test_inr_${Date.now()}@omnifit.in`;
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Arjun Sharma',
        email,
        password: 'password123'
      })
    });
    const data = await res.json();
    assert.ok(data.success, `Registration failed: ${data.error}`);
    assert.ok(data.token, 'Expected auth token');
    testToken = data.token;
    testUserId = data.user.id;
  });

  let createdOrderId = '';

  await test("Add to cart & place order with Indian Address & 5% GST", async () => {
    const item = allProducts[0];
    const res = await fetch(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        items: [
          {
            productId: item.id,
            name: item.name,
            brand: item.brand,
            image: item.image,
            price: item.price,
            quantity: 1,
            selectedSize: 'M',
            selectedColor: 'Standard'
          }
        ],
        shippingAddress: {
          name: 'Arjun Sharma',
          street: '42, Lavelle Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560001',
          country: 'India',
          phone: '+91 98765 43210'
        },
        deliveryMethod: 'prime_standard'
      })
    });

    const data = await res.json();
    assert.ok(data.success, `Order placement failed: ${data.error}`);
    assert.ok(data.order, 'Order object missing');
    assert.strictEqual(data.order.shippingAddress.country, 'India');
    assert.strictEqual(data.order.shippingAddress.zipCode, '560001');
    assert.strictEqual(data.order.deliveryFee, 0); // Free delivery
    assert.strictEqual(data.order.tax, Math.round(item.price * 0.05)); // 5% GST
    assert.strictEqual(data.order.total, item.price + data.order.tax);
    createdOrderId = data.order.id;
  });

  // ---------------------------------------------------------
  // 6. ADMIN PORTAL & SYNCHRONIZED ORDER WORKFLOW
  // ---------------------------------------------------------
  console.log('\n--- 6. ADMIN PORTAL & SYNCHRONIZED ORDER WORKFLOW ---');

  let adminToken = '';

  await test("Admin login using credentials admin@omnifit.com / admin123", async () => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@omnifit.com',
        password: 'admin123'
      })
    });
    const data = await res.json();
    assert.ok(data.success, `Admin login failed: ${data.error}`);
    assert.strictEqual(data.user.role, 'admin');
    adminToken = data.token;
  });

  await test("Order placed by customer is immediately visible to Admin", async () => {
    const res = await fetch(`${BASE_URL}/api/orders`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert.ok(data.success);
    const found = data.orders.find(o => o.id === createdOrderId);
    assert.ok(found, `Newly created order ${createdOrderId} was not visible to admin`);
  });

  await test("Admin updates order status to 'Confirmed' and customer sees update", async () => {
    const patchRes = await fetch(`${BASE_URL}/api/admin/orders/${createdOrderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'Confirmed', note: 'Order confirmed by fulfillment team' })
    });
    const patchData = await patchRes.json();
    assert.ok(patchData.success, `Status update failed: ${patchData.error}`);
    assert.strictEqual(patchData.order.status, 'Confirmed');

    // Customer checks their own order
    const custRes = await fetch(`${BASE_URL}/api/orders/${createdOrderId}`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    const custData = await custRes.json();
    assert.ok(custData.success);
    assert.strictEqual(custData.order.status, 'Confirmed', 'Customer does not see updated status');
  });

  await test("Admin can fetch customer accounts via /api/admin/users without password leakage", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.users.length > 0);
    for (const u of data.users) {
      assert.strictEqual(u.passwordHash, undefined, "Security violation: passwordHash exposed!");
    }
  });

  await test("Customer cannot access /api/admin/users (RBAC enforced)", async () => {
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { 'Authorization': `Bearer ${testToken}` }
    });
    assert.strictEqual(res.status, 403, "Customer should be forbidden from admin users endpoint");
  });

  // ---------------------------------------------------------
  // 7. AI STYLIST ASSISTANT VALIDATION
  // ---------------------------------------------------------
  console.log('\n--- 7. AI STYLIST ASSISTANT VALIDATION ---');

  await test("AI Stylist: Office / presentation query under ₹3,000", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "Suggest an outfit for a college presentation under 3000",
        activeGender: "men"
      })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.recommendedProducts.length > 0);
    assert.ok(data.reply.includes('₹'), 'Response should include INR pricing');
    for (const p of data.recommendedProducts) {
      assert.ok(p.price <= 3000, `Item ${p.name} exceeds budget: ₹${p.price}`);
    }
  });

  await test("AI Stylist: Wedding / festive ethnic query", async () => {
    const res = await fetch(`${BASE_URL}/api/ai/assistant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: "I need traditional Indian wear for a family wedding",
        activeGender: "women"
      })
    });
    const data = await res.json();
    assert.ok(data.success);
    assert.ok(data.recommendedProducts.length > 0);
    const subcats = data.recommendedProducts.map(p => p.subcategory);
    const hasEthnic = subcats.some(s => ['kurtas', 'kurtis', 'ethnic_sets'].includes(s));
    assert.ok(hasEthnic, "Expected ethnic / kurta recommendations");
  });

  // ---------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------
  console.log('\n' + '='.repeat(70));
  console.log(`📊 FINAL TEST REPORT: ${passed} PASSED, ${failed} FAILED`);
  console.log('='.repeat(70));

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch(err => {
  console.error("Test Suite Fatal Error:", err);
  process.exit(1);
});
