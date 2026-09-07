const fs = require('fs');
const path = require('path');

const templatesDir = path.join(__dirname, 'public/templates');
if (!fs.existsSync(templatesDir)) fs.mkdirSync(templatesDir, { recursive: true });

const templateStyles = [
  {
    name: 'template1',
    title: 'CLASSIC STUDIO MINIMAL',
    bg: '#FFFFFF',
    accent: '#FF385C',
    text: '#0F172A',
    sub: 'PHOTOBOOTH MEMORIES 2026',
    border: '#E2E8F0'
  },
  {
    name: 'template2',
    title: 'OBSIDIAN DARK CINEMA',
    bg: '#0B0F19',
    accent: '#FF385C',
    text: '#F8FAFC',
    sub: 'STUDIO EDITION • LIMITED',
    border: '#1E293B'
  },
  {
    name: 'template3',
    title: 'PASTEL BLUSH ROMANCE',
    bg: '#FFF1F2',
    accent: '#FB7185',
    text: '#881337',
    sub: 'SPECIAL CELEBRATION',
    border: '#FFE4E6'
  },
  {
    name: 'template4',
    title: 'VINTAGE RETRO WARMTH',
    bg: '#FEF3C7',
    accent: '#D97706',
    text: '#78350F',
    sub: 'ORIGINAL VINTAGE STRIP',
    border: '#FDE68A'
  },
  {
    name: 'template5',
    title: 'LUMINOUS CRIMSON NEON',
    bg: '#180B10',
    accent: '#FF2A54',
    text: '#FFFFFF',
    sub: 'VIP PHOTOBOOTH LOUNGE',
    border: '#FF2A54'
  }
];

templateStyles.forEach((t) => {
  const svg = `<svg width="600" height="1800" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad_${t.name}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${t.bg}"/>
        <stop offset="100%" stop-color="${t.bg}"/>
      </linearGradient>
    </defs>
    <rect width="600" height="1800" fill="${t.bg}"/>

    <!-- Header Branding -->
    <text x="300" y="55" font-family="Cabinet Grotesk, sans-serif" font-size="20" font-weight="800" fill="${t.accent}" text-anchor="middle" letter-spacing="4">${t.title}</text>

    <!-- Slot 1 Window Guide (32, 80, 536, 440) -->
    <rect x="32" y="80" width="536" height="440" rx="16" fill="none" stroke="${t.border}" stroke-width="4"/>
    <rect x="36" y="84" width="528" height="432" rx="14" fill="rgba(0,0,0,0.02)"/>

    <!-- Slot 2 Window Guide (32, 544, 536, 440) -->
    <rect x="32" y="544" width="536" height="440" rx="16" fill="none" stroke="${t.border}" stroke-width="4"/>
    <rect x="36" y="548" width="528" height="432" rx="14" fill="rgba(0,0,0,0.02)"/>

    <!-- Slot 3 Window Guide (32, 1008, 536, 440) -->
    <rect x="32" y="1008" width="536" height="440" rx="16" fill="none" stroke="${t.border}" stroke-width="4"/>
    <rect x="36" y="1012" width="528" height="432" rx="14" fill="rgba(0,0,0,0.02)"/>

    <!-- Footer Artwork -->
    <circle cx="300" cy="1540" r="32" fill="${t.accent}" opacity="0.15"/>
    <circle cx="300" cy="1540" r="14" fill="${t.accent}"/>
    <text x="300" y="1630" font-family="Cabinet Grotesk, sans-serif" font-size="34" font-weight="900" fill="${t.text}" text-anchor="middle" letter-spacing="2">${t.title}</text>
    <text x="300" y="1680" font-family="JetBrains Mono, monospace" font-size="18" font-weight="700" fill="${t.accent}" text-anchor="middle" letter-spacing="3">${t.sub}</text>
    <text x="300" y="1730" font-family="JetBrains Mono, monospace" font-size="14" fill="${t.text}" opacity="0.6" text-anchor="middle">PHOTOBOOTH STUDIO PRO</text>
  </svg>`;

  fs.writeFileSync(path.join(templatesDir, `${t.name}.svg`), svg);
  fs.writeFileSync(path.join(templatesDir, `${t.name}.jpg`), svg); // fallback image reference
});

console.log('5 Starter template frames generated in public/templates/');
