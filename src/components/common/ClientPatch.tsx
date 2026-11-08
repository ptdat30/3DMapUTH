'use client';

import { useEffect } from 'react';

/**
 * Filter out benign third-party library deprecation warnings (e.g. Three.js r186 Clock in R3F)
 * from polluting the Next.js development overlay.
 */
export function ClientPatch() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const origWarn = console.warn;
    console.warn = (...args: unknown[]) => {
      const firstArg = args[0];
      if (
        typeof firstArg === 'string' &&
        (firstArg.includes('THREE.Clock: This module has been deprecated') ||
          firstArg.includes('PCFSoftShadowMap has been removed'))
      ) {
        return;
      }
      origWarn.apply(console, args);
    };
  }, []);

  return null;
}

