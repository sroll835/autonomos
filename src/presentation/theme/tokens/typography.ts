import { TextStyle } from 'react-native';

/**
 * Escala tipográfica — Cormorant (display/headings) + Montserrat (body/UI).
 *
 * Definida en MASTER.md §2.2. Invariante entre themes (no cambia
 * entre dark/light), por eso vive en `tokens/` y no en `themes/`.
 *
 * Las familias deben estar cargadas en `app/_layout.tsx` vía useFonts.
 * Solo 5 pesos cargados (Cormorant 500/600, Montserrat 400/500/600) —
 * los que la escala efectivamente usa.
 *
 * Uso:
 *   import { typography } from '@/presentation/theme/tokens/typography';
 *   <Text style={typography.h1}>Título</Text>
 *
 * El color se aplica POR ENCIMA via useTheme().colors.textPrimary, etc.
 * Estos tokens NO incluyen color a propósito.
 */

export const typography = {
  /** Cormorant 600 · 40/48 · luxury hero (login, splash) */
  display: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 40,
    lineHeight: 48,
    letterSpacing: -0.5,
  } satisfies TextStyle,

  /** Cormorant 600 · 32/40 · títulos de pantalla */
  h1: {
    fontFamily: 'Cormorant_600SemiBold',
    fontSize: 32,
    lineHeight: 40,
    letterSpacing: -0.3,
  } satisfies TextStyle,

  /** Cormorant 500 · 24/32 · subtítulos de sección */
  h2: {
    fontFamily: 'Cormorant_500Medium',
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: -0.2,
  } satisfies TextStyle,

  /** Montserrat 600 · 18/26 · headings de card */
  h3: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 18,
    lineHeight: 26,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Montserrat 400 · 16/26 · texto principal */
  bodyLg: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 16,
    lineHeight: 26,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Montserrat 400 · 14/22 · texto estándar */
  body: {
    fontFamily: 'Montserrat_400Regular',
    fontSize: 14,
    lineHeight: 22,
    letterSpacing: 0,
  } satisfies TextStyle,

  /** Montserrat 500 · 12/18 · metadatos, labels */
  caption: {
    fontFamily: 'Montserrat_500Medium',
    fontSize: 12,
    lineHeight: 18,
    letterSpacing: 0.2,
  } satisfies TextStyle,

  /** Montserrat 600 · 11/14 · eyebrows, badges (uppercase) */
  overline: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 11,
    lineHeight: 14,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  } satisfies TextStyle,

  /** Montserrat 600 · 15/20 · texto de botones */
  button: {
    fontFamily: 'Montserrat_600SemiBold',
    fontSize: 15,
    lineHeight: 20,
    letterSpacing: 0.3,
  } satisfies TextStyle,
} as const;

export type Typography = typeof typography;
export type TypographyKey = keyof Typography;
