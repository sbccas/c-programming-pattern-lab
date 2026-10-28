/// <reference types="node" />
import { existsSync, readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { PATTERNS } from '../patterns';

// Vitest runs from the project root.
const root = process.cwd();
const read = (p: string) => readFileSync(resolve(root, p), 'utf8');
const SITE = 'https://c-programming-pattern-lab.vercel.app/';

describe('share previews and site metadata', () => {
  const html = read('index.html');
  const meta = (attr: 'property' | 'name', key: string) =>
    html.match(new RegExp(`<meta\\s+${attr}="${key}"\\s+content="([^"]+)"`))?.[1] ?? html.match(new RegExp(`${attr}="${key}"\\s*\\n?\\s*content="([^"]+)"`))?.[1];

  it('has the Open Graph tags WhatsApp and social apps read', () => {
    for (const key of ['og:title', 'og:description', 'og:image', 'og:url', 'og:type', 'og:site_name']) {
      expect(meta('property', key), key).toBeTruthy();
    }
    expect(meta('property', 'og:url')).toBe(SITE);
    expect(meta('name', 'twitter:card')).toBe('summary_large_image');
  });

  it('points og:image at an absolute URL of a real, small enough file', () => {
    const image = meta('property', 'og:image')!;
    expect(image.startsWith(SITE)).toBe(true);
    const file = resolve(root, 'public', image.slice(SITE.length));
    expect(existsSync(file)).toBe(true);
    // WhatsApp ignores preview images larger than about 300 KB.
    expect(statSync(file).size).toBeLessThan(300 * 1024);
    expect(meta('property', 'og:image:width')).toBe('1200');
    expect(meta('property', 'og:image:height')).toBe('630');
  });

  it('references icon and manifest files that exist', () => {
    for (const href of html.matchAll(/<link[^>]+href="\/([^"]+)"/g)) {
      expect(existsSync(resolve(root, 'public', href[1]!)), href[1]).toBe(true);
    }
    const manifest = JSON.parse(read('public/site.webmanifest')) as { icons: { src: string }[] };
    for (const icon of manifest.icons) expect(existsSync(resolve(root, 'public', icon.src.slice(1))), icon.src).toBe(true);
  });

  it('has valid JSON-LD structured data', () => {
    const json = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1];
    const data = JSON.parse(json!) as { name: string; author: { name: string } };
    expect(data.name).toBe('C Programming Pattern Lab');
    expect(data.author.name).toBe('Hitesh Patel');
  });

  it('lists every page and pattern in the sitemap', () => {
    const sitemap = read('public/sitemap.xml');
    for (const path of ['', 'patterns', 'practice', 'creator', 'about', ...PATTERNS.map((p) => `patterns/${p.id}`)]) {
      expect(sitemap, path).toContain(`<loc>${SITE}${path}</loc>`);
    }
  });
});
