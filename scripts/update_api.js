import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiPath = path.resolve(__dirname, '../server/api.js');

let apiCode = fs.readFileSync(apiPath, 'utf-8');

// 1. Update /api/products gender filtering
const oldGenderBlock = `    if (gender && gender !== 'all') {
      const g = gender.toLowerCase();
      if (g === 'footwear') {
        products = products.filter(p => (p.category || '').toLowerCase() === 'footwear');
      } else if (g === 'accessories') {
        products = products.filter(p => (p.category || '').toLowerCase() === 'accessories');
      } else if (g === 'kids') {
        products = products.filter(p => (p.gender || '').toLowerCase() === 'kids');
      } else if (g === 'women') {
        products = products.filter(p => {
          const prodGender = (p.gender || '').toLowerCase();
          return prodGender === 'women' || prodGender === 'unisex';
        });
      } else if (g === 'men') {
        products = products.filter(p => {
          const prodGender = (p.gender || '').toLowerCase();
          return prodGender === 'men' || prodGender === 'unisex';
        });
      } else if (g === 'unisex') {
        products = products.filter(p => (p.gender || '').toLowerCase() === 'unisex');
      }
    }`;

const newGenderBlock = `    if (gender && gender !== 'all') {
      const g = gender.toLowerCase();
      if (g === 'women') {
        products = products.filter(p => {
          const prodGender = (p.gender || '').toLowerCase();
          return prodGender === 'women' || prodGender === 'unisex';
        });
      } else if (g === 'men') {
        products = products.filter(p => {
          const prodGender = (p.gender || '').toLowerCase();
          return prodGender === 'men' || prodGender === 'unisex';
        });
      } else if (g === 'unisex') {
        products = products.filter(p => (p.gender || '').toLowerCase() === 'unisex');
      } else {
        // Any removed category returns empty array
        products = [];
      }
    }`;

if (apiCode.includes(oldGenderBlock)) {
  apiCode = apiCode.replace(oldGenderBlock, newGenderBlock);
  console.log('✅ Replaced gender filtering in server/api.js');
} else {
  console.log('⚠️ oldGenderBlock not found, check api.js');
}

// 2. Update subcategory filtering
const oldSubcatBlock = `    if (subcategory && subcategory !== 'all') {
      const sub = subcategory.toLowerCase();
      products = products.filter(p => {
        const pSub = (p.subcategory || '').toLowerCase();
        if (sub === 'dresses') return pSub === 'dresses';
        if (sub === 'shirts') {
          return pSub === 'shirts' || ((!gender || gender === 'all') && pSub === 'tops');
        }
        if (sub === 'tops') return pSub === 'tops';
        if (sub === 'jackets') return pSub === 'jackets' || pSub === 'coats';
        if (sub === 'jeans') return pSub === 'jeans' || pSub === 'denim';
        if (sub === 'sneakers') return pSub === 'sneakers';
        if (sub === 'bags') return pSub === 'bags' || pSub === 'totes';
        return pSub === sub;
      });
    }`;

const newSubcatBlock = `    if (subcategory && subcategory !== 'all') {
      const sub = subcategory.toLowerCase();
      products = products.filter(p => {
        const pSub = (p.subcategory || '').toLowerCase();
        if (sub === 'dresses') return pSub === 'dresses';
        if (sub === 'casual_shirts') return pSub === 'casual_shirts';
        if (sub === 'formal_shirts') return pSub === 'formal_shirts';
        if (sub === 'shirts') return pSub === 'shirts' || pSub === 'casual_shirts' || pSub === 'formal_shirts';
        if (sub === 'tops') return pSub === 'tops';
        if (sub === 't-shirts') return pSub === 't-shirts';
        if (sub === 'polo_tshirts') return pSub === 'polo_tshirts';
        if (sub === 'jeans') return pSub === 'jeans';
        if (sub === 'trousers') return pSub === 'trousers';
        if (sub === 'chinos') return pSub === 'chinos';
        if (sub === 'hoodies') return pSub === 'hoodies';
        if (sub === 'sweatshirts') return pSub === 'sweatshirts';
        if (sub === 'jackets') return pSub === 'jackets' || pSub === 'coats';
        if (sub === 'kurtis') return pSub === 'kurtis';
        if (sub === 'kurtas') return pSub === 'kurtas' || pSub === 'kurtis';
        if (sub === 'ethnic_sets') return pSub === 'ethnic_sets';
        if (sub === 'coord_sets') return pSub === 'coord_sets';
        if (sub === 'skirts') return pSub === 'skirts';
        return pSub === sub;
      });
    }`;

if (apiCode.includes(oldSubcatBlock)) {
  apiCode = apiCode.replace(oldSubcatBlock, newSubcatBlock);
  console.log('✅ Replaced subcategory filtering in server/api.js');
}

// 3. Update Order creation delivery fee and taxes
const oldFeeBlock = `    const deliveryFee = deliveryMethod === 'express' ? 9.99 : 0.00; // Standard & Prime are Free
    const tax = Math.round(subtotal * 0.08 * 100) / 100; // 8% sales tax
    const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;`;

const newFeeBlock = `    const deliveryFee = deliveryMethod === 'express' ? 149 : 0; // Standard & Prime are Free in India
    const tax = Math.round(subtotal * 0.05); // 5% GST for Indian apparel
    const total = subtotal + deliveryFee + tax;`;

if (apiCode.includes(oldFeeBlock)) {
  apiCode = apiCode.replace(oldFeeBlock, newFeeBlock);
  console.log('✅ Updated order fee & tax calculations in server/api.js');
}

// 4. Add /api/admin/users endpoint if missing
if (!apiCode.includes('/api/admin/users')) {
  const adminTarget = `// Admin status update\napp.patch('/api/admin/orders/:id/status'`;
  const adminUsersEndpoint = `// Admin user management endpoint
app.get('/api/admin/users', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session || session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin authorization required' });
    }

    const users = readData('users.json');
    const orders = readData('orders.json');

    const orderCountByUser = {};
    orders.forEach(o => {
      if (o.userId) {
        orderCountByUser[o.userId] = (orderCountByUser[o.userId] || 0) + 1;
      }
    });

    const safeUsers = users.map(u => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || 'customer',
      createdAt: u.createdAt,
      addresses: u.addresses || [],
      orderCount: orderCountByUser[u.id] || 0
    }));

    res.json({ success: true, count: safeUsers.length, users: safeUsers });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});\n\n// Admin status update\napp.patch('/api/admin/orders/:id/status'`;

  apiCode = apiCode.replace(adminTarget, adminUsersEndpoint);
  console.log('✅ Added /api/admin/users endpoint to server/api.js');
}

// 5. Replace AI assistant endpoint with smart stylist engine
const assistantStart = apiCode.indexOf("app.post('/api/ai/assistant'");
const assistantEnd = apiCode.indexOf("// Virtual Try-On: Dual-Mode Engine", assistantStart);

if (assistantStart !== -1 && assistantEnd !== -1) {
  const newAssistantEndpoint = `app.post('/api/ai/assistant', (req, res) => {
  try {
    const { message, activeGender, budget: explicitBudget, occasion: explicitOccasion } = req.body;
    const products = readData('products.json');
    const msg = (message || '').toLowerCase();

    // 1. Gender filtering
    let targetGender = activeGender && activeGender !== 'all' ? activeGender : null;
    if (!targetGender) {
      if (/\\b(men|man|guy|gentleman|boy)\\b/i.test(msg) && !/\\b(women|woman|lady|girl)\\b/i.test(msg)) {
        targetGender = 'men';
      } else if (/\\b(women|woman|lady|girl)\\b/i.test(msg)) {
        targetGender = 'women';
      }
    }

    let filtered = products;
    if (targetGender && targetGender !== 'all') {
      filtered = filtered.filter(p => p.gender === targetGender || p.gender === 'unisex');
    }

    // 2. Budget parsing
    let budget = explicitBudget ? Number(explicitBudget) : null;
    if (!budget) {
      const budgetMatch = msg.match(/(?:under|below|less\\s+than|within|budget\\s*(?:of)?|upto|up\\s+to|max|around)\\s*(?:₹|rs\\.?|inr)?\\s*([0-9]+(?:,[0-9]+)?)/i)
        || msg.match(/(?:₹|rs\\.?)\\s*([0-9]+(?:,[0-9]+)?)/i);
      if (budgetMatch && budgetMatch[1]) {
        budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      }
    }

    // 3. Occasion & Style intent detection
    const isOffice = explicitOccasion === 'office' || /\\b(office|work|formal|presentation|interview|meeting|corporate|business|conference)\\b/i.test(msg);
    const isParty = explicitOccasion === 'party' || /\\b(party|evening|cocktail|night\\s*out|dinner|glamour|club)\\b/i.test(msg);
    const isWeddingOrFestive = explicitOccasion === 'wedding' || explicitOccasion === 'festival' || /\\b(wedding|marriage|sangeet|reception|festival|festive|diwali|eid|puja|ethnic|traditional|kurta|kurti|anarkali)\\b/i.test(msg);
    const isCollege = explicitOccasion === 'college' || /\\b(college|campus|class|lecture|study)\\b/i.test(msg);
    const isCasual = explicitOccasion === 'casual' || /\\b(casual|outing|weekend|chill|daily|summer|brunch|streetwear)\\b/i.test(msg);

    let matchedItems = [];

    if (isWeddingOrFestive) {
      matchedItems = filtered.filter(p => 
        p.subcategory === 'kurtas' || 
        p.subcategory === 'kurtis' || 
        p.subcategory === 'ethnic_sets' || 
        (p.occasion || '').toLowerCase().includes('wedding') ||
        (p.occasion || '').toLowerCase().includes('festival')
      );
    } else if (isOffice) {
      matchedItems = filtered.filter(p => 
        p.subcategory === 'formal_shirts' || 
        p.subcategory === 'trousers' || 
        p.subcategory === 'coord_sets' || 
        (p.subcategory === 'jackets' && (p.name.includes('Blazer') || p.name.includes('Trench'))) ||
        p.subcategory === 'shirts' ||
        (p.occasion || '').toLowerCase().includes('office') ||
        (p.occasion || '').toLowerCase().includes('presentation')
      );
    } else if (isParty) {
      matchedItems = filtered.filter(p => 
        p.subcategory === 'dresses' || 
        p.subcategory === 'skirts' || 
        (p.subcategory === 'jackets' && p.name.includes('Suede')) ||
        (p.occasion || '').toLowerCase().includes('party') ||
        (p.style || '').toLowerCase().includes('glamour')
      );
    } else if (isCollege) {
      matchedItems = filtered.filter(p => 
        p.subcategory === 't-shirts' || 
        p.subcategory === 'jeans' || 
        p.subcategory === 'chinos' || 
        p.subcategory === 'hoodies' || 
        p.subcategory === 'sweatshirts' || 
        p.subcategory === 'casual_shirts' ||
        p.subcategory === 'tops' ||
        (p.occasion || '').toLowerCase().includes('college')
      );
    } else if (isCasual) {
      matchedItems = filtered.filter(p => 
        p.subcategory === 'casual_shirts' || 
        p.subcategory === 'polo_tshirts' || 
        p.subcategory === 't-shirts' || 
        p.subcategory === 'jeans' || 
        p.subcategory === 'chinos' || 
        p.subcategory === 'tops' || 
        p.subcategory === 'dresses'
      );
    } else {
      const subterms = ['shirt', 't-shirt', 'polo', 'jean', 'trouser', 'chino', 'hoodie', 'sweatshirt', 'dress', 'skirt', 'kurta', 'kurti', 'jacket', 'blazer'];
      const foundSub = subterms.find(t => msg.includes(t));
      if (foundSub) {
        matchedItems = filtered.filter(p => 
          p.subcategory.includes(foundSub) || 
          p.name.toLowerCase().includes(foundSub)
        );
      } else {
        matchedItems = filtered;
      }
    }

    if (!matchedItems.length) {
      matchedItems = filtered;
    }

    let withinBudget = matchedItems;
    let budgetConstrained = false;
    if (budget && budget > 0) {
      const filteredByBudget = matchedItems.filter(p => p.price <= budget);
      if (filteredByBudget.length > 0) {
        withinBudget = filteredByBudget;
      } else {
        budgetConstrained = true;
        withinBudget = [...matchedItems].sort((a, b) => a.price - b.price);
      }
    }

    const recommendedProducts = withinBudget.slice(0, 3);
    const formatPrice = (amt) => \`₹\${Math.round(amt).toLocaleString('en-IN')}\`;
    let reply = '';

    if (budgetConstrained && budget) {
      reply = \`I searched our verified catalog, but couldn't find items strictly under \${formatPrice(budget)}. Here are our closest, highest-value styles that match your occasion perfectly:\\n\\n\`;
    } else if (isWeddingOrFestive) {
      reply = \`For your festive/wedding celebration, here are regal, handcrafted ethnic pieces from our verified collection:\\n\\n\`;
    } else if (isOffice) {
      reply = \`For office and presentations, structured tailoring and breathable cottons project confidence and comfort. Here are top recommended pieces:\\n\\n\`;
    } else if (isCollege) {
      reply = \`For college and campus wear, durability, breathable fabrics, and effortless casual layering are key. Here are ideal pieces:\\n\\n\`;
    } else if (isParty) {
      reply = \`For evening parties and cocktails, here are sophisticated statement pieces featuring luxe textures and sculpted silhouettes:\\n\\n\`;
    } else {
      reply = \`Here are curated fashion recommendations matching your style criteria from our authentic OmniFit collection:\\n\\n\`;
    }

    recommendedProducts.forEach((p, i) => {
      reply += \`\${i + 1}. **\${p.name}** (\${formatPrice(p.price)}) – \${p.material || 'Premium Fabric'} in \${p.fit || 'Regular Fit'}. \${p.description.substring(0, 95)}...\\n\`;
    });

    const topItem = recommendedProducts.find(p => ['casual_shirts', 'formal_shirts', 'shirts', 'tops', 't-shirts', 'polo_tshirts', 'hoodies', 'sweatshirts', 'kurtas', 'kurtis'].includes(p.subcategory));
    const bottomItem = filtered.find(p => ['jeans', 'trousers', 'chinos', 'skirts'].includes(p.subcategory) && p.id !== topItem?.id);
    
    if (topItem && bottomItem) {
      reply += \`\\n💡 **Suggested Outfit Pairing:** Pair the **\${topItem.name}** (\${formatPrice(topItem.price)}) with the **\${bottomItem.name}** (\${formatPrice(bottomItem.price)}) for a balanced, complete look!\`;
    }

    res.json({
      success: true,
      reply,
      recommendedProducts
    });
  } catch (error) {
    console.error('AI Stylist error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});\n\n`;

  apiCode = apiCode.substring(0, assistantStart) + newAssistantEndpoint + apiCode.substring(assistantEnd);
  console.log('✅ Replaced /api/ai/assistant in server/api.js');
}

fs.writeFileSync(apiPath, apiCode, 'utf-8');
console.log('✅ server/api.js successfully updated!');

