import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dir = path.resolve(__dirname, '../public/catalog');

if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

function svgTemplate(title, subtitle, color1, color2, garmentPaths) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" width="100%" height="100%">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>
    <linearGradient id="garmentGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="100%" stop-color="${color2}" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="125%">
      <feDropShadow dx="0" dy="12" stdDeviation="14" flood-color="#0f172a" flood-opacity="0.15" />
    </filter>
  </defs>
  <rect width="600" height="800" fill="url(#bg)" />
  <circle cx="300" cy="380" r="240" fill="#ffffff" opacity="0.6" />
  <g filter="url(#shadow)">
    ${garmentPaths}
  </g>
  <rect x="40" y="680" width="520" height="85" rx="14" fill="#ffffff" opacity="0.95" stroke="#e2e8f0" />
  <text x="300" y="718" font-family="'Inter', -apple-system, sans-serif" font-size="20" font-weight="800" fill="#0f172a" text-anchor="middle">${title}</text>
  <text x="300" y="744" font-family="'Inter', -apple-system, sans-serif" font-size="13" font-weight="600" fill="#e77600" text-anchor="middle">${subtitle}</text>
</svg>`;
}

// 1. Men Formal Oxford Shirt
fs.writeFileSync(path.join(dir, 'm-formal-oxford.svg'), svgTemplate(
  'Royal Oxford Formal Shirt', '100% Giza Cotton • Classic Fit', '#60a5fa', '#1e40af',
  `<!-- Shirt body -->
  <path d="M220,170 L170,230 L110,210 L150,390 L210,340 L210,580 L390,580 L390,340 L450,390 L490,210 L430,230 L380,170 Z" fill="url(#garmentGrad)" stroke="#1e3a8a" stroke-width="3" />
  <!-- Placket -->
  <path d="M285,190 L315,190 L315,580 L285,580 Z" fill="#93c5fd" opacity="0.8" />
  <!-- Buttons -->
  <circle cx="300" cy="230" r="4" fill="#ffffff" />
  <circle cx="300" cy="290" r="4" fill="#ffffff" />
  <circle cx="300" cy="350" r="4" fill="#ffffff" />
  <circle cx="300" cy="410" r="4" fill="#ffffff" />
  <circle cx="300" cy="470" r="4" fill="#ffffff" />
  <circle cx="300" cy="530" r="4" fill="#ffffff" />
  <!-- Pocket -->
  <path d="M230,270 L270,270 L270,320 L250,335 L230,320 Z" fill="none" stroke="#1e3a8a" stroke-width="2" />
  <!-- Collar -->
  <polygon points="300,210 240,175 220,165 260,205" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2" />
  <polygon points="300,210 360,175 380,165 340,205" fill="#bfdbfe" stroke="#1e3a8a" stroke-width="2" />`
));

// 2. Men Supima T-Shirt
fs.writeFileSync(path.join(dir, 'm-cotton-tshirt.svg'), svgTemplate(
  'Supima Crewneck T-Shirt', 'Heavyweight 220 GSM • Pre-shrunk', '#ffffff', '#e2e8f0',
  `<!-- T-Shirt body -->
  <path d="M220,180 L160,240 L100,210 L130,340 L195,305 L195,580 L405,580 L405,305 L470,340 L500,210 L440,240 L380,180 Z" fill="url(#garmentGrad)" stroke="#94a3b8" stroke-width="3" />
  <!-- Crew collar -->
  <path d="M240,180 Q300,230 360,180 Q300,210 240,180 Z" fill="#cbd5e1" stroke="#94a3b8" stroke-width="2" />
  <!-- Subtle chest embroidery -->
  <path d="M340,280 L350,280 L345,290 Z" fill="#e77600" />`
));

// 3. Men Piqué Polo
fs.writeFileSync(path.join(dir, 'm-pique-polo.svg'), svgTemplate(
  'Classic Piqué Polo T-Shirt', 'Breathable Combed Piqué • Ribbed Collar', '#1e293b', '#0f172a',
  `<!-- Polo body -->
  <path d="M220,180 L160,240 L115,220 L145,340 L200,310 L200,580 L400,580 L400,310 L455,340 L485,220 L440,240 L380,180 Z" fill="url(#garmentGrad)" stroke="#020617" stroke-width="3" />
  <!-- Ribbed collar -->
  <polygon points="300,225 240,180 220,175 260,215" fill="#334155" stroke="#020617" stroke-width="2" />
  <polygon points="300,225 360,180 380,175 340,215" fill="#334155" stroke="#020617" stroke-width="2" />
  <!-- Placket -->
  <rect x="288" y="215" width="24" height="95" fill="#1e293b" stroke="#020617" stroke-width="2" />
  <circle cx="300" cy="240" r="3.5" fill="#f8fafc" />
  <circle cx="300" cy="270" r="3.5" fill="#f8fafc" />
  <circle cx="300" cy="295" r="3.5" fill="#f8fafc" />
  <!-- Ribbed cuffs -->
  <line x1="115" y1="220" x2="145" y2="340" stroke="#334155" stroke-width="4" />
  <line x1="485" y1="220" x2="455" y2="340" stroke="#334155" stroke-width="4" />`
));

// 4. Men Stretch Jeans
fs.writeFileSync(path.join(dir, 'm-stretch-jeans.svg'), svgTemplate(
  'Slim Tapered Denim Jeans', '13 oz Japanese Selvedge • Indigo Wash', '#1e3a8a', '#172554',
  `<!-- Jeans body -->
  <path d="M210,180 L390,180 L395,280 L370,620 L315,620 L300,340 L285,620 L230,620 L205,280 Z" fill="url(#garmentGrad)" stroke="#0f172a" stroke-width="3" />
  <!-- Waistband -->
  <rect x="210" y="180" width="180" height="35" fill="#1d4ed8" stroke="#0f172a" stroke-width="2" />
  <!-- Button & Fly -->
  <circle cx="300" cy="198" r="6" fill="#f59e0b" />
  <path d="M300,215 L300,290 C300,310 280,310 280,290" fill="none" stroke="#d97706" stroke-width="2" />
  <!-- Pockets -->
  <path d="M230,215 C260,215 270,245 270,265" fill="none" stroke="#d97706" stroke-width="2" />
  <path d="M370,215 C340,215 330,245 330,265" fill="none" stroke="#d97706" stroke-width="2" />
  <!-- Coin pocket -->
  <rect x="335" y="225" width="25" height="20" fill="none" stroke="#d97706" stroke-width="1.5" />
  <!-- Whiskering fades -->
  <path d="M240,280 Q280,290 285,310" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" opacity="0.5" fill="none" />
  <path d="M360,280 Q320,290 315,310" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" opacity="0.5" fill="none" />`
));

// 5. Men Pleated Trousers
fs.writeFileSync(path.join(dir, 'm-pleated-trouser.svg'), svgTemplate(
  'Italian Wool-Blend Trousers', 'Single Pleat • Extended Waistband Tab', '#334155', '#0f172a',
  `<!-- Trouser body -->
  <path d="M215,180 L385,180 L395,270 L365,630 L315,630 L300,330 L285,630 L235,630 L205,270 Z" fill="url(#garmentGrad)" stroke="#020617" stroke-width="3" />
  <!-- Extended waistband tab -->
  <rect x="215" y="180" width="170" height="35" fill="#475569" stroke="#020617" stroke-width="2" />
  <rect x="290" y="180" width="40" height="35" rx="4" fill="#1e293b" />
  <!-- Pleat creases -->
  <line x1="255" y1="215" x2="255" y2="630" stroke="#64748b" stroke-width="1.5" />
  <line x1="345" y1="215" x2="345" y2="630" stroke="#64748b" stroke-width="1.5" />
  <!-- Slanted front pockets -->
  <line x1="220" y1="225" x2="245" y2="270" stroke="#020617" stroke-width="2" />
  <line x1="380" y1="225" x2="355" y2="270" stroke="#020617" stroke-width="2" />`
));

// 6. Men Slim Chinos
fs.writeFileSync(path.join(dir, 'm-slim-chinos.svg'), svgTemplate(
  'Everyday Stretch Chinos', '98% Cotton 2% Elastane • Peach Finish', '#d97706', '#92400e',
  `<!-- Chino body -->
  <path d="M215,180 L385,180 L390,270 L360,620 L315,620 L300,330 L285,620 L240,620 L210,270 Z" fill="url(#garmentGrad)" stroke="#78350f" stroke-width="3" />
  <!-- Waistband with belt loops -->
  <rect x="215" y="180" width="170" height="30" fill="#b45309" stroke="#78350f" stroke-width="2" />
  <rect x="240" y="180" width="6" height="30" fill="#78350f" />
  <rect x="354" y="180" width="6" height="30" fill="#78350f" />
  <!-- Button -->
  <circle cx="300" cy="195" r="5" fill="#451a03" />
  <line x1="300" y1="210" x2="300" y2="270" stroke="#78350f" stroke-width="2" />
  <!-- Slanted chino pockets -->
  <line x1="225" y1="215" x2="250" y2="265" stroke="#78350f" stroke-width="2" />
  <line x1="375" y1="215" x2="350" y2="265" stroke="#78350f" stroke-width="2" />`
));

// 7. Men Fleece Hoodie
fs.writeFileSync(path.join(dir, 'm-fleece-hoodie.svg'), svgTemplate(
  'Streetwear Fleece Hoodie', '450 GSM Heavy Fleece • Kangaroo Pocket', '#475569', '#1e293b',
  `<!-- Hoodie body -->
  <path d="M220,190 L160,250 L90,240 L120,440 L180,390 L180,590 L420,590 L420,390 L480,440 L510,240 L440,250 L380,190 Z" fill="url(#garmentGrad)" stroke="#0f172a" stroke-width="3" />
  <!-- Kangaroo pocket -->
  <path d="M230,440 L370,440 L385,530 L215,530 Z" fill="#334155" stroke="#0f172a" stroke-width="2" />
  <!-- Hood -->
  <path d="M220,190 Q300,100 380,190 Q300,230 220,190 Z" fill="#64748b" stroke="#0f172a" stroke-width="2" />
  <!-- Drawstrings -->
  <path d="M280,215 L275,320" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" />
  <path d="M320,215 L325,320" stroke="#f8fafc" stroke-width="3" stroke-linecap="round" />
  <!-- Ribbed bottom hem -->
  <rect x="180" y="555" width="240" height="35" fill="#1e293b" stroke="#0f172a" stroke-width="2" />`
));

// 8. Men Crewneck Sweatshirt
fs.writeFileSync(path.join(dir, 'm-crew-sweatshirt.svg'), svgTemplate(
  'French Terry Sweatshirt', '100% Organic Ring-Spun Cotton', '#065f46', '#022c22',
  `<!-- Sweatshirt body -->
  <path d="M220,180 L160,240 L95,225 L125,430 L185,380 L185,580 L415,580 L415,380 L475,430 L505,225 L440,240 L380,180 Z" fill="url(#garmentGrad)" stroke="#064e3b" stroke-width="3" />
  <!-- Collar V-insert -->
  <polygon points="285,200 315,200 300,225" fill="#047857" stroke="#064e3b" stroke-width="1.5" />
  <!-- Ribbed collar -->
  <path d="M240,180 Q300,215 360,180 Q300,195 240,180 Z" fill="#047857" stroke="#064e3b" stroke-width="2" />
  <!-- Ribbed hem -->
  <rect x="185" y="545" width="230" height="35" fill="#047857" stroke="#064e3b" stroke-width="2" />
  <line x1="125" y1="430" x2="100" y2="410" stroke="#047857" stroke-width="4" />
  <line x1="475" y1="430" x2="500" y2="410" stroke="#047857" stroke-width="4" />`
));

// 9. Men Chikankari Kurta
fs.writeFileSync(path.join(dir, 'm-chikankari-kurta.svg'), svgTemplate(
  'Lucknowi Chikankari Kurta', 'Pure Chanderi Silk • Hand Embroidered', '#f8fafc', '#e2e8f0',
  `<!-- Kurta body -->
  <path d="M230,165 L170,220 L110,210 L140,410 L195,360 L195,620 L405,620 L405,360 L460,410 L490,210 L430,220 L370,165 Z" fill="url(#garmentGrad)" stroke="#cbd5e1" stroke-width="3" />
  <!-- Side slits -->
  <line x1="195" y1="480" x2="195" y2="620" stroke="#94a3b8" stroke-width="3" />
  <line x1="405" y1="480" x2="405" y2="620" stroke="#94a3b8" stroke-width="3" />
  <!-- Mandarin collar -->
  <path d="M260,165 Q300,185 340,165 L345,150 Q300,170 255,150 Z" fill="#f1f5f9" stroke="#cbd5e1" stroke-width="2" />
  <!-- Front placket -->
  <rect x="290" y="180" width="20" height="160" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5" />
  <!-- Chikankari floral motifs -->
  <circle cx="300" cy="200" r="3" fill="#94a3b8" />
  <circle cx="300" cy="230" r="3" fill="#94a3b8" />
  <circle cx="300" cy="260" r="3" fill="#94a3b8" />
  <circle cx="300" cy="290" r="3" fill="#94a3b8" />
  <path d="M265,220 Q280,240 265,260" stroke="#cbd5e1" stroke-width="2" fill="none" />
  <path d="M335,220 Q320,240 335,260" stroke="#cbd5e1" stroke-width="2" fill="none" />
  <path d="M260,280 Q280,300 260,320" stroke="#cbd5e1" stroke-width="2" fill="none" />
  <path d="M340,280 Q320,300 340,320" stroke="#cbd5e1" stroke-width="2" fill="none" />`
));

// 10. Women Graphic T-Shirt
fs.writeFileSync(path.join(dir, 'w-graphic-tshirt.svg'), svgTemplate(
  'Relaxed Graphic Cotton T-Shirt', 'Bio-Washed 100% Combed Cotton', '#c084fc', '#7e22ce',
  `<!-- T-Shirt body -->
  <path d="M230,185 L175,235 L125,210 L150,330 L205,300 L205,570 L395,570 L395,300 L450,330 L475,210 L425,235 L370,185 Z" fill="url(#garmentGrad)" stroke="#6b21a8" stroke-width="3" />
  <!-- Wide scoop neck -->
  <path d="M250,185 Q300,230 350,185 Q300,215 250,185 Z" fill="#e9d5ff" stroke="#6b21a8" stroke-width="2" />
  <!-- Graphic Art in center -->
  <circle cx="300" cy="340" r="55" fill="#fae8ff" stroke="#fde047" stroke-width="3" />
  <polygon points="300,300 315,335 350,340 325,365 330,400 300,380 270,400 275,365 250,340 285,335" fill="#fbbf24" />
  <text x="300" y="425" font-family="'Inter'" font-size="14" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">OMNIFIT STUDIO</text>`
));

// 11. Women Poplin Shirt
fs.writeFileSync(path.join(dir, 'w-poplin-shirt.svg'), svgTemplate(
  'Oversized Crisp Poplin Shirt', '100% Organic Cotton • Drop Shoulder', '#f1f5f9', '#cbd5e1',
  `<!-- Oversized Shirt body -->
  <path d="M210,175 L150,225 L85,215 L125,410 L190,360 L190,610 L410,610 L410,360 L475,410 L515,215 L450,225 L390,175 Z" fill="url(#garmentGrad)" stroke="#94a3b8" stroke-width="3" />
  <!-- Point collar -->
  <polygon points="300,215 235,175 220,165 260,205" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
  <polygon points="300,215 365,175 380,165 340,205" fill="#ffffff" stroke="#94a3b8" stroke-width="2" />
  <!-- Placket -->
  <rect x="288" y="215" width="24" height="395" fill="#ffffff" stroke="#94a3b8" stroke-width="1.5" />
  <circle cx="300" cy="250" r="3.5" fill="#94a3b8" />
  <circle cx="300" cy="310" r="3.5" fill="#94a3b8" />
  <circle cx="300" cy="370" r="3.5" fill="#94a3b8" />
  <circle cx="300" cy="430" r="3.5" fill="#94a3b8" />
  <circle cx="300" cy="490" r="3.5" fill="#94a3b8" />
  <circle cx="300" cy="550" r="3.5" fill="#94a3b8" />
  <!-- Curved hem -->
  <path d="M190,590 Q300,630 410,590" stroke="#94a3b8" stroke-width="2" fill="none" />`
));

// 12. Women Peplum Top
fs.writeFileSync(path.join(dir, 'w-peplum-top.svg'), svgTemplate(
  'Smocked Peplum Casual Top', 'Breathable Rayon • Sweetheart Neckline', '#ea580c', '#9a3412',
  `<!-- Peplum body -->
  <path d="M230,190 L180,240 L135,220 L160,330 L210,310 L220,440 L170,570 L430,570 L380,440 L390,310 L440,330 L465,220 L420,240 L370,190 Z" fill="url(#garmentGrad)" stroke="#7c2d12" stroke-width="3" />
  <!-- Sweetheart neck -->
  <path d="M240,190 Q270,225 300,210 Q330,225 360,190" fill="none" stroke="#7c2d12" stroke-width="3" />
  <!-- Smocked waist gathers -->
  <line x1="220" y1="370" x2="380" y2="370" stroke="#ffedd5" stroke-width="2" stroke-dasharray="3,3" />
  <line x1="220" y1="390" x2="380" y2="390" stroke="#ffedd5" stroke-width="2" stroke-dasharray="3,3" />
  <line x1="220" y1="410" x2="380" y2="410" stroke="#ffedd5" stroke-width="2" stroke-dasharray="3,3" />
  <line x1="220" y1="430" x2="380" y2="430" stroke="#ffedd5" stroke-width="2" stroke-dasharray="3,3" />
  <!-- Flared hem pleats -->
  <line x1="250" y1="440" x2="230" y2="570" stroke="#7c2d12" stroke-width="2" />
  <line x1="300" y1="440" x2="300" y2="570" stroke="#7c2d12" stroke-width="2" />
  <line x1="350" y1="440" x2="370" y2="570" stroke="#7c2d12" stroke-width="2" />`
));

// 13. Women Satin Skirt
fs.writeFileSync(path.join(dir, 'w-satin-skirt.svg'), svgTemplate(
  'Pleated Satin Midi Skirt', 'High-Shine Heavy Satin • Elastic Waist', '#059669', '#064e3b',
  `<!-- Skirt body -->
  <path d="M240,200 L360,200 L440,620 L160,620 Z" fill="url(#garmentGrad)" stroke="#022c22" stroke-width="3" />
  <!-- Waistband -->
  <rect x="240" y="190" width="120" height="25" rx="3" fill="#10b981" stroke="#022c22" stroke-width="2" />
  <!-- Satin Sheen Pleats -->
  <path d="M255,215 L190,620" stroke="#34d399" stroke-width="3" opacity="0.6" fill="none" />
  <path d="M275,215 L245,620" stroke="#022c22" stroke-width="2" opacity="0.6" fill="none" />
  <path d="M300,215 L300,620" stroke="#34d399" stroke-width="4" opacity="0.7" fill="none" />
  <path d="M325,215 L355,620" stroke="#022c22" stroke-width="2" opacity="0.6" fill="none" />
  <path d="M345,215 L410,620" stroke="#34d399" stroke-width="3" opacity="0.6" fill="none" />`
));

// 14. Women Printed Kurti
fs.writeFileSync(path.join(dir, 'w-printed-kurti.svg'), svgTemplate(
  'Hand-Block Printed Straight Kurti', '100% Jaipur Cotton • Keyhole Neck', '#0284c7', '#0369a1',
  `<!-- Kurti body -->
  <path d="M230,170 L175,225 L125,215 L150,380 L205,340 L205,630 L395,630 L395,340 L450,380 L475,215 L425,225 L370,170 Z" fill="url(#garmentGrad)" stroke="#075985" stroke-width="3" />
  <!-- Keyhole neckline -->
  <path d="M260,170 Q300,210 340,170" stroke="#075985" stroke-width="3" fill="none" />
  <circle cx="300" cy="220" r="5" fill="#f59e0b" />
  <line x1="300" y1="225" x2="300" y2="270" stroke="#075985" stroke-width="2" />
  <!-- Side slits -->
  <line x1="205" y1="460" x2="205" y2="630" stroke="#0c4a6e" stroke-width="4" />
  <line x1="395" y1="460" x2="395" y2="630" stroke="#0c4a6e" stroke-width="4" />
  <!-- Jaipuri floral prints -->
  <g fill="#e0f2fe" opacity="0.8">
    <circle cx="250" cy="280" r="8" /><circle cx="300" cy="310" r="8" /><circle cx="350" cy="280" r="8" />
    <circle cx="240" cy="370" r="8" /><circle cx="300" cy="390" r="8" /><circle cx="360" cy="370" r="8" />
    <circle cx="250" cy="460" r="8" /><circle cx="300" cy="490" r="8" /><circle cx="350" cy="460" r="8" />
    <circle cx="240" cy="550" r="8" /><circle cx="300" cy="580" r="8" /><circle cx="360" cy="550" r="8" />
  </g>`
));

// 15. Women Silk Ethnic Set
fs.writeFileSync(path.join(dir, 'w-silk-ethnic-set.svg'), svgTemplate(
  'Chanderi Kurta & Palazzo Set', 'With Zari Borders & Organza Dupatta', '#dc2626', '#991b1b',
  `<!-- Kurta -->
  <path d="M230,170 L175,225 L125,215 L150,380 L205,340 L205,520 L395,520 L395,340 L450,380 L475,215 L425,225 L370,170 Z" fill="url(#garmentGrad)" stroke="#7f1d1d" stroke-width="3" />
  <!-- Zari border on Kurta hem -->
  <rect x="205" y="500" width="190" height="20" fill="#f59e0b" stroke="#78350f" stroke-width="1.5" />
  <!-- Palazzos beneath -->
  <path d="M215,520 L385,520 L410,640 L310,640 L300,560 L290,640 L190,640 Z" fill="#fef08a" stroke="#78350f" stroke-width="3" />
  <rect x="190" y="625" width="120" height="15" fill="#d97706" />
  <rect x="290" y="625" width="120" height="15" fill="#d97706" />
  <!-- Gold yoke embroidery -->
  <path d="M260,170 L300,260 L340,170 Z" fill="#fef08a" stroke="#f59e0b" stroke-width="2" />
  <circle cx="300" cy="200" r="4" fill="#dc2626" />
  <circle cx="300" cy="225" r="4" fill="#dc2626" />
  <circle cx="300" cy="245" r="4" fill="#dc2626" />`
));

// 16. Women Linen Co-ord Set
fs.writeFileSync(path.join(dir, 'w-linen-coord.svg'), svgTemplate(
  'Tailored Linen Co-ord Set', 'Blazer & Wide-Leg Trousers • Sage Green', '#84cc16', '#4d7c0f',
  `<!-- Blazer -->
  <path d="M220,170 L160,230 L110,210 L140,410 L190,360 L190,480 L410,480 L410,360 L460,410 L490,210 L440,230 L380,170 Z" fill="url(#garmentGrad)" stroke="#365314" stroke-width="3" />
  <!-- Lapels -->
  <polygon points="260,170 300,290 240,250 220,180" fill="#a3e635" stroke="#365314" stroke-width="2" />
  <polygon points="340,170 300,290 360,250 380,180" fill="#a3e635" stroke="#365314" stroke-width="2" />
  <!-- Buttons -->
  <circle cx="300" cy="340" r="5" fill="#1e293b" />
  <circle cx="300" cy="390" r="5" fill="#1e293b" />
  <!-- Flap pockets -->
  <rect x="205" y="410" width="55" height="18" rx="2" fill="#65a30d" stroke="#365314" stroke-width="1.5" />
  <rect x="340" y="410" width="55" height="18" rx="2" fill="#65a30d" stroke="#365314" stroke-width="1.5" />
  <!-- Wide-leg trouser beneath -->
  <path d="M210,480 L390,480 L420,640 L315,640 L300,520 L285,640 L180,640 Z" fill="url(#garmentGrad)" stroke="#365314" stroke-width="3" />`
));

console.log('✅ Successfully generated all 16 fashion SVG product cards!');

