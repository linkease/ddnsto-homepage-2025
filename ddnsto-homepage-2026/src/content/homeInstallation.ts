import design from './installationDesign.json' with { type: 'json' };
import { platforms as documentedPlatforms } from './installation';
import type { InstallPlatform } from './installation';

/** Homepage presentation captured from the approved v2 design (2026-11-19).
 * Independent guide pages retain their documented platform/version details.
 * These are local, trusted static illustrations; never remote HTML or runtime imports.
 */
export const platforms: InstallPlatform[] = documentedPlatforms.map(
  (platform) => {
    const entry = design.find((item) => item.label === platform.label);
    if (!entry)
      throw new Error(`Missing approved installation design: ${platform.id}`);
    return { ...platform, ...entry, branches: [] };
  },
);
