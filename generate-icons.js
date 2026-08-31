// Script simple pour générer des icônes PNG basiques
const fs = require('fs');
const path = require('path');

// Créer des icônes PNG basiques avec un canvas SVG
const svg192 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192">
  <rect width="192" height="192" fill="#0A1128" rx="40" ry="40"/>
  <circle cx="96" cy="96" r="80" fill="none" stroke="#D4AF37" stroke-width="8" opacity="0.5" />
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="120" font-weight="bold" fill="#D4AF37">C</text>
</svg>`;

const svg512 = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#0A1128" rx="100" ry="100"/>
  <circle cx="256" cy="256" r="220" fill="none" stroke="#D4AF37" stroke-width="20" opacity="0.5" />
  <text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="serif" font-size="350" font-weight="bold" fill="#D4AF37">C</text>
</svg>`;

// Sauvegarder les fichiers SVG temporaires
const publicDir = path.join(__dirname, 'public');
fs.writeFileSync(path.join(publicDir, 'icon-192.svg'), svg192);
fs.writeFileSync(path.join(publicDir, 'icon-512.svg'), svg512);

console.log('Icônes SVG générées avec succès !');
console.log('Pour les icônes PNG, vous pouvez utiliser un outil en ligne comme:');
console.log('https://convertio.co/fr/svg-png/');
console.log('Ou utiliser la commande: magick icon-192.svg icon-192.png (si ImageMagick est installé)');