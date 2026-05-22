/**
 * Escala de espaciado — base 8px, museo.
 *
 * Definida en MASTER.md §3. Invariante entre themes (no cambia
 * entre dark/light), por eso vive en `tokens/` y no en `themes/`.
 *
 * Regla del sistema: cuando dudes entre dos valores, elige el mayor.
 * La densidad excesiva rompe el chiaroscuro.
 *
 * Uso:
 *   import { spacing } from '@/presentation/theme/tokens/spacing';
 *   <View style={{ padding: spacing.lg, gap: spacing.md }} />
 */

export const spacing = {
  xs: 4,    // gaps internos mínimos (icon + label)
  sm: 8,    // padding tight, gaps secundarios
  md: 16,   // padding estándar, gap entre elementos
  lg: 24,   // padding generoso de card, separación de bloques
  xl: 40,   // separación entre secciones de pantalla
  '2xl': 64, // header → contenido, espacio museo
  '3xl': 96, // hero spacing, login screen, transiciones de capítulo
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof Spacing;

/** Border radius — escala consistente con el espaciado */
export const radius = {
  none: 0,
  sm: 4,    // badges, chips
  md: 8,    // buttons, inputs
  lg: 12,   // cards
  xl: 16,   // modales, sheets
  full: 9999, // pills, círculos
} as const;

export type Radius = typeof radius;
