import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const usersFile = path.resolve(__dirname, '../server/data/users.json');
const ordersFile = path.resolve(__dirname, '../server/data/orders.json');
const productsFile = path.resolve(__dirname, '../server/data/products.json');

const products = JSON.parse(fs.readFileSync(productsFile, 'utf-8'));
const users = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
const orders = JSON.parse(fs.readFileSync(ordersFile, 'utf-8'));

// 1. Update Users with authentic Indian addresses
const updatedUsers = users.map(u => {
  if (u.id === 'user-1' || u.email === 'jane@example.com') {
    return {
      ...u,
      addresses: [
        {
          id: 'addr-1',
          name: u.name || 'Jane Doe',
          street: 'Flat 402, Prestige Palms, 12th Main Road, Indiranagar',
          city: 'Bengaluru',
          state: 'Karnataka',
          zipCode: '560038',
          country: 'India',
          phone: '+91 98765 43210',
          isDefault: true
        }
      ]
    };
  }
  if (u.id === 'user-admin' || u.email === 'admin@omnifit.com') {
    return {
      ...u,
      addresses: [
        {
          id: 'addr-admin',
          name: 'OmniFit India HQ',
          street: 'Level 14, Maker Maxity, Bandra Kurla Complex',
          city: 'Mumbai',
          state: 'Maharashtra',
          zipCode: '400051',
          country: 'India',
          phone: '+91 98200 12345',
          isDefault: true
        }
      ]
    };
  }
  return u;
});

fs.writeFileSync(usersFile, JSON.stringify(updatedUsers, null, 2), 'utf-8');
console.log('✅ Updated users.json with Indian addresses');

// Indian test cities and states
const indianLocations = [
  { city: 'Bengaluru', state: 'Karnataka', zipCode: '560038', street: '12th Main, Indiranagar' },
  { city: 'Mumbai', state: 'Maharashtra', zipCode: '400050', street: 'Hill Road, Bandra West' },
  { city: 'New Delhi', state: 'Delhi (NCT)', zipCode: '110016', street: 'Hauz Khas Enclave' },
  { city: 'Hyderabad', state: 'Telangana', zipCode: '500081', street: 'HITEC City, Madhapur' },
  { city: 'Pune', state: 'Maharashtra', zipCode: '411006', street: 'Koregaon Park Road' }
];

// 2. Update existing orders to INR & Indian addresses
const updatedOrders = orders.map((o, idx) => {
  const loc = indianLocations[idx % indianLocations.length];

  // Map any obsolete items to genuine clothing catalogue items
  const validatedItems = o.items.map(item => {
    let matched = products.find(p => p.id === item.productId);
    if (!matched) {
      // Find a suitable fallback clothing item
      matched = products[idx % products.length];
    }

    return {
      productId: matched.id,
      name: matched.name,
      brand: matched.brand,
      image: matched.image,
      price: matched.price,
      quantity: item.quantity || 1,
      selectedSize: item.selectedSize || (matched.sizes ? matched.sizes[0] : 'M'),
      selectedColor: item.selectedColor || (matched.colors ? matched.colors[0] : 'Classic')
    };
  });

  const subtotal = validatedItems.reduce((acc, it) => acc + (it.price * it.quantity), 0);
  const deliveryFee = o.deliveryMethod === 'express' ? 149 : 0;
  const tax = Math.round(subtotal * 0.05); // 5% GST
  const total = subtotal + deliveryFee + tax;

  return {
    ...o,
    shippingAddress: {
      name: o.shippingAddress?.name || o.customerName || 'Customer',
      street: o.shippingAddress?.street && !o.shippingAddress.street.includes('Terrace') ? o.shippingAddress.street : loc.street,
      city: loc.city,
      state: loc.state,
      zipCode: loc.zipCode,
      country: 'India',
      phone: o.shippingAddress?.phone || '+91 98765 43210'
    },
    items: validatedItems,
    subtotal,
    deliveryFee,
    tax,
    total,
    paymentMethod: o.paymentMethod || 'UPI / NetBanking (Demo Mode)',
    paymentStatus: o.paymentStatus || 'Demo Mode (No Real Charge)'
  };
});

fs.writeFileSync(ordersFile, JSON.stringify(updatedOrders, null, 2), 'utf-8');
console.log(`✅ Updated ${updatedOrders.length} orders in orders.json with INR prices and Indian addresses`);

