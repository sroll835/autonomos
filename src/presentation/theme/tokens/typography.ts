import { TextStyle } from 'react-native';

/**
 * Escala tipográfica JuanCode — Sora (display/headings) + Manrope (body/UI).
 *
 * Fonts cargadas en `app/_layout.tsx` vía useFonts:
 *   Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold,
 *   Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold.
 *
 * El color se aplica POR ENCIMA via useTheme().colors.textPrimary, etc.
 * Estos tokens NO incluyen color a propósito.
 *
 * Para el sello degradado: usar <GradientText /> sobre títulos de
 * pantalla y métricas/datos clave (no en párrafos ni labels).
 */

export const typography = {
  /** Sora 800 · 40/48 · hero / splash text */
  display: {
    fontFamily: 'Sora_800ExtraBold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  /** Sora 700 · 32/40 · títulos de pantalla */
  h1: {
    fontFamily: 'Sora_700Bold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  /** Sora 700 · 24/32 · subtítulos de sección */
  h2: {
    fontFamily: 'Sora_700Bold',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  /** Sora 600 · 18/26 · headings de card */
  h3: {
    fontFamily: 'Sora_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Manrope 400 · 16/26 · texto principal */
  bodyLg: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Manrope 400 · 14/22 · texto estándar */
  body: {
    fontFamily: 'Manrope_400Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Manrope 500 · 12/18 · metadatos, labels */
  caption: {
    fontFamily: 'Manrope_500Medium',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  } satisfies TextStyle,

  /** Manrope 600 · 11/14 · eyebrows, badges (uppercase) */
  overline: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  /** Manrope 600 · 15/20 · texto de botones */
  button: {
    fontFamily: 'Manrope_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
  } satisfies TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyKey = keyof Typography;
