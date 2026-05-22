/**
 * Forma del Theme — fuente única para que dark.ts y el futuro light.ts
 * compartan exactamente las mismas keys. Si añades un token nuevo,
 * añadelo aquí primero.
 */

export interface ThemeColors {
  // Backgrounds y superficies
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceElevated: string;
  overlay: string;

  // Bordes
  border: string;
  borderSubtle: string;
  borderFocus: string;

  // Texto
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  // Acento — chrome (plata)
  chrome: string;
  chromeMuted: string;
  chromeGlow: string;

  // Cards claras sobre fondo dark (spotlight cards over dark stage)
  cardLight: string;
  cardLightBorder: string;
  textOnLight: string;
  textOnLightSecondary: string;

  // CTA
  ctaPrimary: string;
  ctaPrimaryText: string;

  // Feedback semántico (apagados, salvo emergency)
  success: string;
  warning: string;
  danger: string;
  info: string;
  emergency: string;

  // Estados (overlays semitransparentes)
  hover: string;
  pressed: string;
}

export interface Theme {
  mode: 'dark' | 'light';
  colors: ThemeColors;
}
