'use client';

import { useEffect } from 'react';

/**
 * 1. Filter out benign third-party library deprecation warnings (e.g. Three.js r186 Clock in R3F)
 *    from polluting the Next.js development overlay.
 * 2. Guard Node.prototype.removeChild / insertBefore against NotFoundError caused by
 *    @react-three/drei <Html> portals, Turbopack Fast Refresh, or browser extensions/translators
 *    mutating DOM nodes outside React 19's reconciliation tree.
 */
export function ClientPatch() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const w = window as unknown as { __uthClientPatchApplied?: boolean };
    if (w.__uthClientPatchApplied) return;
    w.__uthClientPatchApplied = true;

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

    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      if (child.parentNode !== this) {
        return child;
      }
      return origRemoveChild.call(this, child) as T;
    };

    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(
      newNode: T,
      referenceNode: Node | null
    ): T {
      if (referenceNode && referenceNode.parentNode !== this) {
        return newNode;
      }
      return origInsertBefore.call(this, newNode, referenceNode) as T;
    };
  }, []);

  return null;
}

