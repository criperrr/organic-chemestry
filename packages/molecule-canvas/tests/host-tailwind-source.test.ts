import { describe, it, expect } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/**
 * This package ships React components styled only with Tailwind classes, but
 * it has no stylesheet of its own: each host app's Tailwind build generates the
 * classes. Tailwind v4 scans the host's own folder, not sibling workspace
 * packages, so a host that forgets to `@source` this package renders the Studio
 * without its layout classes — including `pointer-events-auto`, which left every
 * button in the Laboratório unclickable.
 */
const PACKAGES = path.resolve(__dirname, '../..');
const STUDIO_SOURCES = path.join(PACKAGES, 'molecule-canvas/src');

const HOSTS = ['web-app/src/index.css', 'molecule-studio/src/index.css'];

function sourcedDirectories(cssFile: string): string[] {
  const css = readFileSync(cssFile, 'utf8');
  return [...css.matchAll(/@source\s+["']([^"']+)["']/g)].map(match =>
    path.resolve(path.dirname(cssFile), match[1]!)
  );
}

describe('host stylesheets scan the Studio components', () => {
  for (const host of HOSTS) {
    it(`${host} @sources molecule-canvas`, () => {
      const cssFile = path.join(PACKAGES, host);
      const covering = sourcedDirectories(cssFile).filter(
        dir => existsSync(dir) && (STUDIO_SOURCES + path.sep).startsWith(dir + path.sep)
      );
      expect(covering, `${host} needs @source pointing at molecule-canvas/src`).not.toHaveLength(0);
    });
  }
});
