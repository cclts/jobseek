/** Standardized tooltip class names — import from here instead of duplicating. */

const animationClasses =
  "data-[state=delayed-open]:animate-[tooltip-in_150ms_ease] data-[state=instant-open]:animate-[tooltip-in_150ms_ease] data-[state=closed]:animate-[tooltip-out_100ms_ease_forwards]";

/** Default dark tooltip (white text on dark translucent bg). */
export const tooltipClass =
  `z-50 rounded-md bg-tooltip-bg backdrop-blur-md px-2.5 py-1 text-xs text-white ${animationClasses}`;

/** Warning tooltip (warning text on warning tinted bg, matching banner style). */
export const tooltipWarningClass =
  `z-50 rounded-md bg-warning-bg border border-warning-border backdrop-blur-sm px-2.5 py-1 text-xs text-warning ${animationClasses}`;
