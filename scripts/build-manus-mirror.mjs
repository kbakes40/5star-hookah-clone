import { cpSync, existsSync, mkdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
const root = process.cwd();
const src = resolve(root, 'mirror');
const out = resolve(root, 'dist/public');
const routes = [
  'about',
  'booking',
  'bot-analytics',
  'contact',
  'conversations',
  'dashboard',
  'month',
  'platform-demo',
  'profit-crm-demo',
  'shopify',
  'shopify-alternative',
  'solutions',
  'spotify-callback',
  '404'
];
rmSync(resolve(root, 'dist'), { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(src, out, { recursive: true });
for (const route of routes) {
  const dir = resolve(out, route);
  mkdirSync(dir, { recursive: true });
  cpSync(resolve(src, 'index.html'), resolve(dir, 'index.html'));
}
cpSync(resolve(src, 'index.html'), resolve(out, '404.html'));
console.log('Built static Manus mirror to', out);
