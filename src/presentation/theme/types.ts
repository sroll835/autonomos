/**
 * Forma del Theme — fuente única para que dark.ts y el futuro light.ts
 * compartan exactamente las mismas keys.
 *
 * Sistema visual: JuanCode (dark futurista premium + degradado de marca).
 */

export interface ThemeGradient {
  g1: string;
  g2: string;
  g3: string;
  g4: string;
  stops: readonly [string, string, string, string];
  soft: readonly [string, string, string, string];
}

export interface ThemeColors {
  // Backgrounds
  background: string;
  bg2: string;
  surface: string;
  surfaceRaised: string;
  surfaceElevated: string;
  overlay: string;

  // Bordes
  border: string;
  borderSubtle: string;
  borderStrong: string;
  borderFocus: string;

  // Texto
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  textOnGradient: string;

  // Acento (cian g1 — reemplaza chrome plata)
  chrome: string;
  chromeMuted: string;
  chromeGlow: string;

  // CTA
  ctaPrimaryText: string;

  // Feedback semántico
  success: string;
  warning: string;
  danger: string;
  info: string;
  emergency: string;

  // Estados
  hover: string;
  pressed: string;
}

export interface Theme {
  mode: 'dark' | 'light';
  colors: ThemeColors;
  gradient: ThemeGradient;
}
