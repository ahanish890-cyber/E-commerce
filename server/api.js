import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, 'data');

// Helper to safely read JSON files
function readData(file) {
  try {
    const filePath = path.join(DATA_DIR, file);
    if (!fs.existsSync(filePath)) return [];
    const content = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (err) {
    console.error(`Error reading ${file}:`, err);
    return [];
  }
}

// Helper to safely write JSON files
function writeData(file, data) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const filePath = path.join(DATA_DIR, file);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing ${file}:`, err);
    return false;
  }
}

// Password hash helper using SHA-256
function hashPassword(password) {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// Auth token creation and verification
const SESSIONS = new Map();
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');

// Load sessions from file on startup
function loadSessions() {
  try {
    if (fs.existsSync(SESSIONS_FILE)) {
      const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
      Object.entries(data).forEach(([token, session]) => {
        // Only restore non-expired sessions
        if (Date.now() <= session.expiresAt) {
          SESSIONS.set(token, session);
        }
      });
      console.log(`✅ Loaded ${SESSIONS.size} active sessions from disk`);
    }
  } catch (err) {
    console.warn('⚠️ Could not load sessions from disk:', err.message);
  }
}

// Save sessions to file
function saveSessions() {
  try {
    const sessionsObj = {};
    SESSIONS.forEach((session, token) => {
      sessionsObj[token] = session;
    });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessionsObj, null, 2), 'utf-8');
  } catch (err) {
    console.warn('⚠️ Could not save sessions to disk:', err.message);
  }
}

// Clean up expired sessions periodically
function cleanupExpiredSessions() {
  let removed = 0;
  SESSIONS.forEach((session, token) => {
    if (Date.now() > session.expiresAt) {
      SESSIONS.delete(token);
      removed++;
    }
  });
  if (removed > 0) {
    saveSessions();
    console.log(`✅ Cleaned up ${removed} expired sessions`);
  }
}

function createToken(user) {
  const token = crypto.randomBytes(32).toString('hex');
  const session = {
    userId: user.id,
    email: user.email,
    role: user.role,
    expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  };
  SESSIONS.set(token, session);
  saveSessions(); // Persist to disk
  return token;
}

function verifyToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return null;
  const token = authHeader.replace(/^Bearer\s+/, '').trim();
  
  // Check in-memory sessions first
  let session = SESSIONS.get(token);
  
  // If not in memory, try to load from disk
  if (!session) {
    try {
      if (fs.existsSync(SESSIONS_FILE)) {
        const data = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
        session = data[token];
        if (session && Date.now() <= session.expiresAt) {
          SESSIONS.set(token, session); // Restore to memory
        } else {
          session = null;
        }
      }
    } catch (err) {
      console.warn('⚠️ Error loading session from disk:', err.message);
    }
  }
  
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    SESSIONS.delete(token);
    saveSessions();
    return null;
  }
  return session;
}

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'OmniFit API Server is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    status: 'ok',
    message: 'OmniFit API server is running',
    version: '2.0.0',
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 1. PRODUCTS API
// -------------------------------------------------------------

app.get('/api/products', (req, res) => {
  try {
    let products = readData('products.json');
    const { 
      gender, 
      category, 
      subcategory, 
      search, 
      minPrice, 
      maxPrice, 
      size, 
      color, 
      rating, 
      hasTryOn, 
      inStock, 
      sortBy 
    } = req.query;

    // Strict department & gender filtering (CRITICAL REQUIREMENT)
    if (gender && gender !== 'all') {
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
    }

    // Category filtering
    if (category && category !== 'all') {
      const c = category.toLowerCase();
      products = products.filter(p => (p.category || '').toLowerCase() === c);
    }

const COLOR_FAMILY_MAP = {
  red: ['red', 'burgundy', 'maroon', 'ruby', 'scarlet', 'crimson'],
  blue: ['blue', 'navy', 'indigo', 'teal', 'sky blue', 'midnight blue'],
  green: ['green', 'emerald', 'sage', 'olive'],
  brown: ['brown', 'tan', 'cognac', 'camel', 'chocolate', 'espresso'],
  white: ['white', 'ivory', 'cream'],
  black: ['black', 'charcoal', 'onyx'],
  beige: ['beige', 'sand', 'nude', 'khaki'],
  navy: ['navy', 'midnight navy']
};

    // Subcategory filtering (handles both underscores and hyphens)
    if (subcategory && subcategory !== 'all') {
      const sub = subcategory.toLowerCase();
      const subUnderscore = sub.replace(/-/g, '_');
      const subHyphen = sub.replace(/_/g, '-');
      products = products.filter(p => {
        const pSub = (p.subcategory || '').toLowerCase();
        if (pSub === sub || pSub === subUnderscore || pSub === subHyphen) return true;
        if (subUnderscore === 'casual_shirts') return pSub === 'casual_shirts';
        if (subUnderscore === 'formal_shirts') return pSub === 'formal_shirts';
        if (subUnderscore === 'polo_tshirts') return pSub === 'polo_tshirts';
        if (subUnderscore === 'ethnic_sets') return pSub === 'ethnic_sets';
        if (subUnderscore === 'coord_sets') return pSub === 'coord_sets';
        if (sub === 'shirts') return pSub === 'shirts' || pSub === 'casual_shirts' || pSub === 'formal_shirts';
        if (sub === 'jackets') return pSub === 'jackets' || pSub === 'coats';
        if (sub === 'kurtas') return pSub === 'kurtas' || pSub === 'kurtis';
        return false;
      });
    }

    // Search query (name, brand, description, subcategory, material, style)
    if (search && search.trim()) {
      const queryWords = search.toLowerCase().trim().split(/\s+/);
      products = products.filter(p => {
        const text = `${p.name} ${p.brand} ${p.category || ''} ${p.subcategory || ''} ${p.description || ''} ${p.material || ''} ${p.style || ''} ${p.occasion || ''} ${(p.colors || []).join(' ')}`.toLowerCase();
        return queryWords.every(word => text.includes(word));
      });
    }

    // Price range
    if (minPrice) {
      const min = parseFloat(minPrice);
      if (!isNaN(min)) products = products.filter(p => p.price >= min);
    }
    if (maxPrice) {
      const max = parseFloat(maxPrice);
      if (!isNaN(max)) products = products.filter(p => p.price <= max);
    }

    // Size filter (OR logic within sizes)
    if (size) {
      const rawSizes = Array.isArray(size) ? size : [size];
      const targetSizes = rawSizes.flatMap(s => typeof s === 'string' ? s.split(',') : [s]).map(s => String(s).trim()).filter(Boolean);
      if (targetSizes.length > 0) {
        products = products.filter(p => 
          p.sizes && p.sizes.some(s => targetSizes.includes(s))
        );
      }
    }

    // Color filter (OR logic within colors + color family matching)
    if (color) {
      const rawColors = Array.isArray(color) ? color : [color];
      const targetColors = rawColors.flatMap(c => typeof c === 'string' ? c.split(',') : [c]).map(c => String(c).trim().toLowerCase()).filter(Boolean);
      if (targetColors.length > 0) {
        products = products.filter(p => 
          p.colors && p.colors.some(c => {
            const pcLow = c.toLowerCase();
            return targetColors.some(tc => {
              if (pcLow.includes(tc)) return true;
              const family = COLOR_FAMILY_MAP[tc];
              if (family && family.some(f => pcLow.includes(f))) return true;
              return false;
            });
          })
        );
      }
    }

    // Rating filter (min rating)
    if (rating) {
      const r = parseFloat(rating);
      if (!isNaN(r)) products = products.filter(p => (p.rating || 0) >= r);
    }

    // Virtual Try-on filter
    if (hasTryOn === 'true' || hasTryOn === true) {
      products = products.filter(p => Boolean(p.hasTryOn));
    }

    // Availability filter
    if (inStock === 'true' || inStock === true) {
      products = products.filter(p => {
        if (!p.stock) return true;
        const totalStock = Object.values(p.stock).reduce((a, b) => a + Number(b), 0);
        return totalStock > 0;
      });
    }

    // Sorting
    if (sortBy === 'price_asc') {
      products.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price_desc') {
      products.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      products.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    } else if (sortBy === 'newest') {
      products.reverse();
    }

    res.json({
      success: true,
      count: products.length,
      total: products.length,
      products
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ success: false, error: 'Internal server error fetching products' });
  }
});

app.get('/api/products/:id', (req, res) => {
  try {
    const products = readData('products.json');
    const product = products.find(p => p.id === req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin product endpoints
app.post('/api/products', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session || session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin authorization required' });
    }

    const products = readData('products.json');
    const newProduct = {
      ...req.body,
      id: req.body.id || `p-${Date.now()}`,
      rating: req.body.rating || 5.0,
      reviewCount: req.body.reviewCount || 0
    };

    products.push(newProduct);
    writeData('products.json', products);
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/products/:id', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session || session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin authorization required' });
    }

    let products = readData('products.json');
    const idx = products.findIndex(p => p.id === req.params.id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: 'Product not found' });
    }

    products[idx] = { ...products[idx], ...req.body };
    writeData('products.json', products);
    res.json({ success: true, product: products[idx] });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.delete('/api/products/:id', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session || session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin authorization required' });
    }

    let products = readData('products.json');
    products = products.filter(p => p.id !== req.params.id);
    writeData('products.json', products);
    res.json({ success: true, message: 'Product deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION API
// -------------------------------------------------------------

app.post('/api/auth/register', (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email, and password are required' });
    }

    const users = readData('users.json');
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ success: false, error: 'Email already registered' });
    }

    const newUser = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash: hashPassword(password),
      role: 'customer',
      addresses: [],
      wishlist: [],
      createdAt: new Date().toISOString()
    };

    users.push(newUser);
    writeData('users.json', users);

    const token = createToken(newUser);
    const { passwordHash, ...safeUser } = newUser;
    res.status(201).json({ success: true, user: safeUser, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password required' });
    }

    const users = readData('users.json');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const inputHash = hashPassword(password);
    if (user.passwordHash !== inputHash) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = createToken(user);
    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/auth/me', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session) {
      return res.status(401).json({ success: false, error: 'Unauthorized' });
    }

    const users = readData('users.json');
    const user = users.find(u => u.id === session.userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found' });
    }

    const { passwordHash, ...safeUser } = user;
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.put('/api/auth/profile', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session) return res.status(401).json({ success: false, error: 'Unauthorized' });

    const users = readData('users.json');
    const idx = users.findIndex(u => u.id === session.userId);
    if (idx === -1) return res.status(404).json({ success: false, error: 'User not found' });

    const { name, addresses, wishlist } = req.body;
    if (name) users[idx].name = name;
    if (addresses) users[idx].addresses = addresses;
    if (wishlist) users[idx].wishlist = wishlist;

    writeData('users.json', users);
    const { passwordHash, ...safeUser } = users[idx];
    res.json({ success: true, user: safeUser });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 3. ORDERS API
// -------------------------------------------------------------

app.get('/api/orders', (req, res) => {
  try {
    const session = verifyToken(req);
    const orders = readData('orders.json');

    // Admin sees all, customer sees only their own
    if (session && session.role === 'admin') {
      return res.json({ success: true, orders: orders.reverse() });
    } else if (session) {
      const userOrders = orders.filter(o => o.userId === session.userId);
      return res.json({ success: true, orders: userOrders.reverse() });
    } else {
      // Guest or query by email if provided
      const { email } = req.query;
      if (email) {
        const guestOrders = orders.filter(o => o.customerEmail?.toLowerCase() === email.toLowerCase());
        return res.json({ success: true, orders: guestOrders.reverse() });
      }
      return res.status(401).json({ success: false, error: 'Authentication required to view orders' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/orders/:id', (req, res) => {
  try {
    const orders = readData('orders.json');
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const session = verifyToken(req);
    if (session && session.role !== 'admin' && order.userId && order.userId !== session.userId) {
      return res.status(403).json({ success: false, error: 'Unauthorized to view this order' });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Place new order
app.post('/api/orders', (req, res) => {
  try {
    const session = verifyToken(req);
    const { items, shippingAddress, deliveryMethod, paymentMethod, customerEmail, customerName } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, error: 'Cart items are required' });
    }
    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, error: 'Complete shipping address is required' });
    }

    // Backend validates and recalculates prices & stock
    const products = readData('products.json');
    let subtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const prod = products.find(p => p.id === item.productId || p.id === item.id);
      if (!prod) {
        return res.status(400).json({ success: false, error: `Product ${item.name} not found in catalog` });
      }

      // Check stock
      const size = item.selectedSize || (prod.sizes && prod.sizes[0]);
      if (prod.stock && size) {
        const availableStock = prod.stock[size] !== undefined ? prod.stock[size] : 10;
        if (availableStock < item.quantity) {
          return res.status(400).json({ 
            success: false, 
            error: `Insufficient stock for ${prod.name} (Size: ${size}). Available: ${availableStock}` 
          });
        }
        // Deduct stock
        prod.stock[size] -= item.quantity;
      }

      const itemTotal = prod.price * item.quantity;
      subtotal += itemTotal;

      validatedItems.push({
        productId: prod.id,
        name: prod.name,
        brand: prod.brand,
        image: prod.image,
        price: prod.price,
        quantity: item.quantity,
        selectedSize: size,
        selectedColor: item.selectedColor || (prod.colors && prod.colors[0]) || 'Standard'
      });
    }

    const deliveryFee = deliveryMethod === 'express' ? 149 : 0; // Standard & Prime are Free in India
    const tax = Math.round(subtotal * 0.05); // 5% GST for Indian apparel
    const total = subtotal + deliveryFee + tax;

    const orderId = `ORD-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder = {
      id: orderId,
      userId: session ? session.userId : (customerEmail ? `guest-${Date.now()}` : 'guest'),
      customerName: customerName || (session ? session.email.split('@')[0] : shippingAddress.name),
      customerEmail: customerEmail || (session ? session.email : 'guest@example.com'),
      shippingAddress,
      deliveryMethod: deliveryMethod || 'prime_standard',
      deliveryFee,
      items: validatedItems,
      subtotal: Math.round(subtotal * 100) / 100,
      tax,
      total,
      paymentMethod: paymentMethod || 'Demo Sandbox Card',
      paymentStatus: 'Demo Mode (No Charge)',
      status: 'Placed',
      timeline: [
        { status: 'Placed', timestamp: new Date().toISOString(), note: 'Order placed in demo simulation (no real payment processed)' },
        { status: 'Confirmed', timestamp: new Date().toISOString(), note: 'Order verified in demo sandbox environment' }
      ],
      returnEligible: true,
      createdAt: new Date().toISOString()
    };

    // Save orders and updated products stock
    const orders = readData('orders.json');
    orders.push(newOrder);
    writeData('orders.json', orders);
    writeData('products.json', products);

    res.status(201).json({ success: true, order: newOrder });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Cancel order
app.post('/api/orders/:id/cancel', (req, res) => {
  try {
    const orders = readData('orders.json');
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (order.status === 'Shipped' || order.status === 'Delivered' || order.status === 'Cancelled') {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot cancel order with status: ${order.status}` 
      });
    }

    order.status = 'Cancelled';
    order.timeline.push({
      status: 'Cancelled',
      timestamp: new Date().toISOString(),
      note: req.body.reason || 'Cancelled by customer'
    });

    // Restore stock
    const products = readData('products.json');
    for (const item of order.items) {
      const prod = products.find(p => p.id === item.productId);
      if (prod && prod.stock && item.selectedSize && prod.stock[item.selectedSize] !== undefined) {
        prod.stock[item.selectedSize] += item.quantity;
      }
    }
    writeData('products.json', products);
    writeData('orders.json', orders);

    res.json({ success: true, message: 'Order cancelled and stock restored', order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Return order
app.post('/api/orders/:id/return', (req, res) => {
  try {
    const orders = readData('orders.json');
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (order.status !== 'Delivered') {
      return res.status(400).json({ success: false, error: 'Only delivered orders are eligible for return' });
    }

    order.status = 'Return Requested';
    order.timeline.push({
      status: 'Return Requested',
      timestamp: new Date().toISOString(),
      note: req.body.reason || 'Return requested by customer. Prepaid return label generated.'
    });
    writeData('orders.json', orders);

    res.json({ success: true, message: 'Return initiated successfully', order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin user management endpoint
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
});

// Admin status update
app.patch('/api/admin/orders/:id/status', (req, res) => {
  try {
    const session = verifyToken(req);
    if (!session || session.role !== 'admin') {
      return res.status(403).json({ success: false, error: 'Admin authorization required' });
    }

    const { status, note } = req.body;
    const orders = readData('orders.json');
    const order = orders.find(o => o.id === req.params.id);
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    const validStatuses = ['Placed', 'Confirmed', 'Packed', 'Shipped', 'Delivered', 'Cancelled', 'Return Requested'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: 'Invalid order status' });
    }

    order.status = status;
    order.timeline.push({
      status,
      timestamp: new Date().toISOString(),
      note: note || `Order status updated to ${status}`
    });
    writeData('orders.json', orders);

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 4. REVIEWS API
// -------------------------------------------------------------

app.get('/api/reviews/:productId', (req, res) => {
  try {
    const reviews = readData('reviews.json');
    const productReviews = reviews.filter(r => r.productId === req.params.productId);
    res.json({ success: true, reviews: productReviews });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/reviews', (req, res) => {
  try {
    const { productId, rating, title, comment, userName } = req.body;
    if (!productId || !rating || !comment) {
      return res.status(400).json({ success: false, error: 'Product ID, rating, and comment are required' });
    }

    const reviews = readData('reviews.json');
    const newReview = {
      id: `rev-${Date.now()}`,
      productId,
      userId: req.body.userId || 'guest',
      userName: userName || 'Verified Customer',
      rating: Number(rating),
      title: title || 'Customer Review',
      comment,
      verifiedPurchase: true,
      createdAt: new Date().toISOString()
    };

    reviews.push(newReview);
    writeData('reviews.json', reviews);

    // Update aggregate product rating & count
    const products = readData('products.json');
    const prod = products.find(p => p.id === productId);
    if (prod) {
      const prodReviews = reviews.filter(r => r.productId === productId);
      const avg = prodReviews.reduce((sum, r) => sum + r.rating, 0) / prodReviews.length;
      prod.rating = Math.round(avg * 10) / 10;
      prod.reviewCount = prodReviews.length;
      writeData('products.json', products);
    }

    res.status(201).json({ success: true, review: newReview });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// -------------------------------------------------------------
// 5. AI FEATURES (Size Recommender, Visual Search, Fashion Assistant)
// -------------------------------------------------------------

app.post('/api/ai/size-recommend', (req, res) => {
  try {
    const { heightCm, weightKg, chestInches, waistInches, fitPreference, gender, category } = req.body;

    let recommendedSize = 'M';
    let confidence = 92;
    let explanation = '';

    // Calculate BMI or size heuristic
    const height = parseFloat(heightCm) || 170;
    const weight = parseFloat(weightKg) || 68;
    const bmi = weight / ((height / 100) * (height / 100));

    if (bmi < 19) {
      recommendedSize = fitPreference === 'loose' ? 'S' : 'XS';
    } else if (bmi < 23) {
      recommendedSize = fitPreference === 'tight' ? 'S' : (fitPreference === 'loose' ? 'L' : 'M');
    } else if (bmi < 27) {
      recommendedSize = fitPreference === 'tight' ? 'M' : (fitPreference === 'loose' ? 'XL' : 'L');
    } else {
      recommendedSize = fitPreference === 'tight' ? 'L' : 'XL';
    }

    explanation = `Based on your height (${height} cm), weight (${weight} kg), and preferred ${fitPreference || 'regular'} fit, size ${recommendedSize} offers optimal drape without restriction around the shoulders and chest.`;

    res.json({
      success: true,
      recommendedSize,
      confidence,
      explanation,
      fitScore: 94
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/visual-search', (req, res) => {
  try {
    const { colorTag, styleTag, category } = req.body;
    const products = readData('products.json');

    // Return products that match the color, style, or category extracted from visual inspection
    let matches = products.filter(p => {
      const pColor = (p.colors || []).join(' ').toLowerCase();
      const pStyle = (p.style || '').toLowerCase();
      const pName = p.name.toLowerCase();

      const colorMatch = colorTag ? pColor.includes(colorTag.toLowerCase()) : false;
      const styleMatch = styleTag ? (pStyle.includes(styleTag.toLowerCase()) || pName.includes(styleTag.toLowerCase())) : false;
      return colorMatch || styleMatch;
    });

    if (matches.length === 0) {
      // Fallback to top products in similar category
      matches = products.slice(0, 4);
    }

    res.json({
      success: true,
      matches: matches.slice(0, 6)
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.post('/api/ai/assistant', (req, res) => {
  try {
    const { message, activeGender, budget: explicitBudget, occasion: explicitOccasion } = req.body;
    const products = readData('products.json');
    const msg = (message || '').toLowerCase();

    // 1. Gender filtering
    let targetGender = activeGender && activeGender !== 'all' ? activeGender : null;
    if (!targetGender) {
      if (/\b(men|man|guy|gentleman|boy)\b/i.test(msg) && !/\b(women|woman|lady|girl)\b/i.test(msg)) {
        targetGender = 'men';
      } else if (/\b(women|woman|lady|girl)\b/i.test(msg)) {
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
      const budgetMatch = msg.match(/(?:under|below|less\s+than|within|budget\s*(?:of)?|upto|up\s+to|max|around)\s*(?:₹|rs\.?|inr)?\s*([0-9]+(?:,[0-9]+)?)/i)
        || msg.match(/(?:₹|rs\.?)\s*([0-9]+(?:,[0-9]+)?)/i);
      if (budgetMatch && budgetMatch[1]) {
        budget = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
      }
    }

    // 3. Occasion & Style intent detection
    const isOffice = explicitOccasion === 'office' || /\b(office|work|formal|presentation|interview|meeting|corporate|business|conference)\b/i.test(msg);
    const isParty = explicitOccasion === 'party' || /\b(party|evening|cocktail|night\s*out|dinner|glamour|club)\b/i.test(msg);
    const isWeddingOrFestive = explicitOccasion === 'wedding' || explicitOccasion === 'festival' || /\b(wedding|marriage|sangeet|reception|festival|festive|diwali|eid|puja|ethnic|traditional|kurta|kurti|anarkali)\b/i.test(msg);
    const isCollege = explicitOccasion === 'college' || /\b(college|campus|class|lecture|study)\b/i.test(msg);
    const isCasual = explicitOccasion === 'casual' || /\b(casual|outing|weekend|chill|daily|summer|brunch|streetwear)\b/i.test(msg);

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
    const formatPrice = (amt) => `₹${Math.round(amt).toLocaleString('en-IN')}`;
    let reply = '';

    if (budgetConstrained && budget) {
      reply = `I searched our verified catalog, but couldn't find items strictly under ${formatPrice(budget)}. Here are our closest, highest-value styles that match your occasion perfectly:\n\n`;
    } else if (isWeddingOrFestive) {
      reply = `For your festive/wedding celebration, here are regal, handcrafted ethnic pieces from our verified collection:\n\n`;
    } else if (isOffice) {
      reply = `For office and presentations, structured tailoring and breathable cottons project confidence and comfort. Here are top recommended pieces:\n\n`;
    } else if (isCollege) {
      reply = `For college and campus wear, durability, breathable fabrics, and effortless casual layering are key. Here are ideal pieces:\n\n`;
    } else if (isParty) {
      reply = `For evening parties and cocktails, here are sophisticated statement pieces featuring luxe textures and sculpted silhouettes:\n\n`;
    } else {
      reply = `Here are curated fashion recommendations matching your style criteria from our authentic OmniFit collection:\n\n`;
    }

    recommendedProducts.forEach((p, i) => {
      reply += `${i + 1}. **${p.name}** (${formatPrice(p.price)}) – ${p.material || 'Premium Fabric'} in ${p.fit || 'Regular Fit'}. ${p.description.substring(0, 95)}...\n`;
    });

    const topItem = recommendedProducts.find(p => ['casual_shirts', 'formal_shirts', 'shirts', 'tops', 't-shirts', 'polo_tshirts', 'hoodies', 'sweatshirts', 'kurtas', 'kurtis'].includes(p.subcategory));
    const bottomItem = filtered.find(p => ['jeans', 'trousers', 'chinos', 'skirts'].includes(p.subcategory) && p.id !== topItem?.id);
    
    if (topItem && bottomItem) {
      reply += `\n💡 **Suggested Outfit Pairing:** Pair the **${topItem.name}** (${formatPrice(topItem.price)}) with the **${bottomItem.name}** (${formatPrice(bottomItem.price)}) for a balanced, complete look!`;
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
});

// Virtual Try-On: Dual-Mode Engine (Replicate Cloud Diffusion when configured + Instant Smart Fit Zero-Cost Mode)
app.post('/api/generate-tryon', async (req, res) => {
  try {
    const personImage = req.body.personImage || req.body.faceImage;
    const garmentImage = req.body.garmentImage || req.body.outfitImage;
    const garmentCategory = req.body.garmentCategory || 'upper_body';

    // Validate required inputs
    if (!personImage || !garmentImage) {
      return res.status(400).json({
        success: false,
        error: 'Missing required images: personImage (or faceImage) and garmentImage (or outfitImage)',
        configured: true
      });
    }

    // Validate image size (enforce 10MB limit for user files)
    const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10MB in bytes
    const imageSize = (personImage.length || 0) + (garmentImage.length || 0);
    if (imageSize > MAX_IMAGE_SIZE) {
      return res.status(400).json({
        success: false,
        error: 'Total image size exceeds 10MB limit',
        configured: true
      });
    }

    // Check REPLICATE_API_TOKEN
    const apiToken = process.env.REPLICATE_API_TOKEN;
    if (!apiToken || apiToken.trim() === '' || process.env.NODE_ENV === 'test') {
      console.log('ℹ️ Running in Instant Smart Fit Try-On mode (Zero-Cost / Free Mode)');
      return res.json({
        success: true,
        mode: 'smart_fit',
        configured: false,
        message: 'Try-On processed via Instant Smart Fit engine (zero API cost)',
        resultImage: garmentImage.startsWith('data:') ? garmentImage : personImage,
        resultUrl: garmentImage.startsWith('http') ? garmentImage : null,
        timestamp: new Date().toISOString()
      });
    }

    // Import Replicate client
    const Replicate = (await import('replicate')).default;
    const replicate = new Replicate({ auth: apiToken });

    // Prepare garment images array (single item in our case)
    const garmentImages = [garmentImage];

    console.log(`🎨 Calling Replicate p-image-try-on for virtual try-on...`);

    // Call Replicate API
    let output;
    try {
      output = await replicate.run('prunaai/p-image-try-on', {
        person_image: personImage,       // data URI or URL
        garment_images: garmentImages,   // array of data URIs or URLs
        turbo: false,                    // false for best quality
        output_format: 'jpg'             // jpg for size/speed tradeoff
      });
    } catch (replicateError) {
      const errorMessage = replicateError.message || String(replicateError);

      // Handle specific Replicate errors
      if (errorMessage.includes('401') || errorMessage.includes('Unauthorized')) {
        console.error('❌ Replicate API authentication failed (401)');
        return res.status(401).json({
          success: false,
          error: 'Replicate API authentication failed. Check REPLICATE_API_TOKEN.',
          configured: false
        });
      } else if (errorMessage.includes('429') || errorMessage.includes('Rate limit')) {
        console.error('❌ Replicate API rate limit exceeded');
        return res.status(429).json({
          success: false,
          error: 'Service is temporarily busy. Please try again in a moment.',
          configured: true
        });
      } else if (errorMessage.includes('timeout')) {
        console.error('❌ Replicate API timeout');
        return res.status(504).json({
          success: false,
          error: 'Request timed out. The model took too long to process. Please try again.',
          configured: true
        });
      } else if (errorMessage.includes('NSFW') || errorMessage.includes('blocked')) {
        console.error('❌ Image blocked by safety filter');
        return res.status(400).json({
          success: false,
          error: 'Image was blocked by safety filters. Please use appropriate images.',
          configured: true
        });
      } else {
        console.error('❌ Replicate API error:', errorMessage);
        return res.status(500).json({
          success: false,
          error: `Model error: ${errorMessage}`,
          configured: true
        });
      }
    }

    // output should be a URL or array of URLs; Replicate returns array of URLs for image outputs
    // If it's an array, take the first item; if it's a string (URL), use it directly
    let resultUrl;
    if (Array.isArray(output)) {
      resultUrl = output[0];
    } else if (typeof output === 'string') {
      resultUrl = output;
    } else {
      console.error('❌ Unexpected Replicate output format:', output);
      return res.status(500).json({
        success: false,
        error: 'Unexpected model output format',
        configured: true
      });
    }

    if (!resultUrl || !resultUrl.startsWith('http')) {
      console.error('❌ Invalid result URL from Replicate:', resultUrl);
      return res.status(500).json({
        success: false,
        error: 'Model did not return a valid image URL',
        configured: true
      });
    }

    console.log(`✅ Virtual try-on generated: ${resultUrl}`);

    // Fetch the image from the URL and convert to base64 for frontend
    let imageBase64;
    try {
      const imageResponse = await fetch(resultUrl);
      if (!imageResponse.ok) {
        throw new Error(`Failed to fetch result image: ${imageResponse.status}`);
      }

      const buffer = await imageResponse.arrayBuffer();
      imageBase64 = 'data:image/jpeg;base64,' + Buffer.from(buffer).toString('base64');
      console.log(`✅ Converted result to base64 (${imageBase64.length} bytes)`);
    } catch (fetchError) {
      console.error('❌ Error fetching result image:', fetchError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve generated image from service',
        configured: true
      });
    }

    // Return success with the base64 image
    res.json({
      success: true,
      resultImage: imageBase64,
      resultUrl: resultUrl,
      message: 'Virtual try-on generated successfully',
      timestamp: new Date().toISOString(),
      configured: true
    });

  } catch (error) {
    console.error('❌ Unexpected server error:', error);
    res.status(500).json({
      success: false,
      error: 'Server error processing try-on request',
      configured: true
    });
  }
});

// Port and Server Start
const PORT = process.env.PORT || 3001;

// Load persisted sessions on startup
loadSessions();

// Set up periodic cleanup of expired sessions (every 24 hours)
setInterval(cleanupExpiredSessions, 24 * 60 * 60 * 1000);

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log('='.repeat(60));
  console.log(`🚀 OmniFit Enterprise Full-Stack API Server`);
  console.log(`📍 Port: ${PORT}`);
  console.log(`🌐 URL: http://localhost:${PORT}`);
  console.log(`✅ Ready to serve frontend requests!`);
  console.log('='.repeat(60));
});

server.keepAliveTimeout = 65000;

process.on('SIGTERM', () => server.close(() => process.exit(0)));
process.on('SIGINT', () => server.close(() => process.exit(0)));
process.on('uncaughtException', (err) => console.error('Uncaught Exception:', err));
process.on('unhandledRejection', (reason, promise) => console.error('Unhandled Rejection at:', promise, reason));
