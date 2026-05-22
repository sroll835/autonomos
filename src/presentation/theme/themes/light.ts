import { Theme } from '../types';

/* ============================================================ */
/* ⚠️⚠️⚠️  STUB — NO USAR EN PRODUCCIÓN  ⚠️⚠️⚠️                */
/* ============================================================ */
/*                                                              */
/*  La app es DARK-FIRST. Este archivo existe ÚNICAMENTE para   */
/*  mantener la forma semántica del Theme (mismas keys) y       */
/*  permitir que el theming compile y sea extensible a futuro.  */
/*                                                              */
/*  Los valores aquí son PLACEHOLDERS sin afinar contra el      */
/*  brief de marca. Activar este tema sin diseño dedicado       */
/*  romperá la coherencia visual del producto.                  */
/*                                                              */
/*  Si producto pide modo claro:                                */
/*    1. Abrir branch dedicada.                                 */
/*    2. Redefinir TODOS los valores con brief de diseño.       */
/*    3. Validar contraste WCAG por par texto/fondo.            */
/*  NO descomentar ni activar desde aquí.                       */
/*                                                              */
/* ============================================================ */

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background:      '#FFFFFF',
    surface:         '#F5F5F7',
    surfaceRaised:   '#EBEBEE',
    surfaceElevated: '#E0E0E4',
    overlay:         'rgba(255, 255, 255, 0.72)',

    border:          '#D4D4D8',
    borderSubtle:    '#E4E4E7',
    borderFocus:     '#3A3A3F',

    textPrimary:     '#0A0A0B',
    textSecondary:   '#5A5A5F',
    textTertiary:    '#8A8A8F',
    textInverse:     '#F4F4F5',

    chrome:          '#3A3A3F',
    chromeMuted:     'rgba(58, 58, 63, 0.4)',
    chromeGlow:      'rgba(58, 58, 63, 0.08)',

    ctaPrimary:      '#0A0A0B',
    ctaPrimaryText:  '#F4F4F5',

    success:         '#5A8B5E',
    warning:         '#A87F4A',
    danger:          '#A84A4A',
    info:            '#5A6F88',
    emergency:       '#C13030',

    hover:           'rgba(10, 10, 11, 0.04)',
    pressed:         'rgba(10, 10, 11, 0.08)',
  },
};
