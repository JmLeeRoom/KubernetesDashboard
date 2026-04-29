import type { Config } from "tailwindcss";

/**
 * Tailwind configuration for KubeControl.
 *
 * Tokens are derived 1:1 from `uploads/DESIGN.md` (Material Design 3 derived
 * dark scheme + explicit typography/spacing/rounding scales). All raw color
 * hex values come from that document; if the design source changes, this file
 * is the only place that needs to follow.
 */
const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Surfaces (M3-style tonal palette)
        surface: "#081425",
        "surface-dim": "#081425",
        "surface-bright": "#2f3a4c",
        "surface-container-lowest": "#040e1f",
        "surface-container-low": "#111c2d",
        "surface-container": "#152031",
        "surface-container-high": "#1f2a3c",
        "surface-container-highest": "#2a3548",
        "surface-variant": "#2a3548",

        // On-surface text
        "on-surface": "#d8e3fb",
        "on-surface-variant": "#c2c6d6",
        "inverse-surface": "#d8e3fb",
        "inverse-on-surface": "#263143",

        // Outlines
        outline: "#8c909f",
        "outline-variant": "#424754",

        // Brand / Primary
        "surface-tint": "#adc6ff",
        primary: "#adc6ff",
        "on-primary": "#002e6a",
        "primary-container": "#4d8eff",
        "on-primary-container": "#00285d",
        "inverse-primary": "#005ac2",
        "primary-fixed": "#d8e2ff",
        "primary-fixed-dim": "#adc6ff",
        "on-primary-fixed": "#001a42",
        "on-primary-fixed-variant": "#004395",

        // Secondary
        secondary: "#bec6e0",
        "on-secondary": "#283044",
        "secondary-container": "#3f465c",
        "on-secondary-container": "#adb4ce",
        "secondary-fixed": "#dae2fd",
        "secondary-fixed-dim": "#bec6e0",
        "on-secondary-fixed": "#131b2e",
        "on-secondary-fixed-variant": "#3f465c",

        // Tertiary
        tertiary: "#b7c8e1",
        "on-tertiary": "#213145",
        "tertiary-container": "#8292aa",
        "on-tertiary-container": "#1a2b3e",
        "tertiary-fixed": "#d3e4fe",
        "tertiary-fixed-dim": "#b7c8e1",
        "on-tertiary-fixed": "#0b1c30",
        "on-tertiary-fixed-variant": "#38485d",

        // Error
        error: "#ffb4ab",
        "on-error": "#690005",
        "error-container": "#93000a",
        "on-error-container": "#ffdad6",

        // Background
        background: "#081425",
        "on-background": "#d8e3fb",

        // Semantic status (DESIGN.md: traffic-light protocol).
        // These are SPECIFIC named tokens used by status badges/icons so that
        // semantic colors are referenced by intent rather than by raw hex.
        "status-healthy": "#10B981",
        "status-warning": "#F59E0B",
        "status-error": "#EF4444",

        // Layered hard-coded slate values that the reference HTML uses for
        // borders/cards (DESIGN.md Elevation section). Kept as named tokens
        // so we don't spread raw hex literals across components.
        "panel-bg": "#0F172A",
        "panel-border": "#1E293B",
        "canvas-bg": "#020617",
      },
      fontFamily: {
        h1: ["Space Grotesk", "sans-serif"],
        h2: ["Space Grotesk", "sans-serif"],
        "body-base": ["Inter", "sans-serif"],
        "body-sm": ["Inter", "sans-serif"],
        "mono-data": ["Space Grotesk", "sans-serif"],
        "label-caps": ["Space Grotesk", "sans-serif"],
      },
      fontSize: {
        h1: [
          "32px",
          { lineHeight: "40px", fontWeight: "600" },
        ],
        h2: [
          "24px",
          { lineHeight: "32px", fontWeight: "600" },
        ],
        "body-base": [
          "14px",
          { lineHeight: "20px", fontWeight: "400" },
        ],
        "body-sm": [
          "12px",
          { lineHeight: "16px", fontWeight: "400" },
        ],
        "mono-data": [
          "13px",
          { lineHeight: "18px", letterSpacing: "0.02em", fontWeight: "500" },
        ],
        "label-caps": [
          "11px",
          { lineHeight: "16px", letterSpacing: "0.05em", fontWeight: "700" },
        ],
      },
      borderRadius: {
        // DESIGN.md: 0.25rem default, 0.5rem for cards, full for pills.
        DEFAULT: "0.25rem",
        sm: "0.125rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px",
      },
      spacing: {
        // 4px base unit per DESIGN.md.
        unit: "4px",
        "container-margin": "24px",
        gutter: "16px",
        "component-gap-sm": "8px",
        "component-gap-md": "16px",
        "section-padding": "32px",
      },
    },
  },
  plugins: [],
};

export default config;
