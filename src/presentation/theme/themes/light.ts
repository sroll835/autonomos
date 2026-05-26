import { Theme } from '../types';

/* ============================================================ */
/* ⚠️⚠️⚠️  STUB — NO USAR EN PRODUCCIÓN  ⚠️⚠️⚠️                */
/* ============================================================ */
/*                                                              */
/*  La app es DARK-FIRST (JuanCode). Este archivo existe        */
/*  ÚNICAMENTE para mantener la forma semántica del Theme       */
/*  (mismas keys) y permitir extensibilidad futura.             */
/*                                                              */
/*  Los valores aquí son PLACEHOLDERS sin afinar. Activar este  */
/*  tema sin diseño dedicado romperá la coherencia visual.      */
/*                                                              */
/* ============================================================ */

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background:      '#FFFFFF',
    bg2:             '#F4F4F5',
    surface:         'rgba(7, 10, 18, 0.04)',
    surfaceRaised:   'rgba(7, 10, 18, 0.06)',
    surfaceElevated: '#F4F4F5',
    overlay:         'rgba(255, 255, 255, 0.78)',

    border:          'rgba(7, 10, 18, 0.10)',
    borderSubtle:    'rgba(7, 10, 18, 0.06)',
    borderStrong:    'rgba(7, 10, 18, 0.18)',
    borderFocus:     '#22D3EE',

    textPrimary:     '#06080F',
    textSecondary:   '#5A5A5F',
    textTertiary:    '#8A8A8F',
    textInverse:     '#EDF1FA',
    textOnGradient:  '#06080F',

    chrome:          '#22D3EE',
    chromeMuted:     'rgba(34, 211, 238, 0.4)',
    chromeGlow:      'rgba(34, 211, 238, 0.16)',

    ctaPrimaryText:  '#06080F',

    success:         '#22D3EE',
    warning:         '#FB7185',
    danger:          '#FB7185',
    info:            '#4F8BFF',
    emergency:       '#FF5470',

    hover:           'rgba(7, 10, 18, 0.04)',
    pressed:         'rgba(7, 10, 18, 0.08)',
  },
  gradient: {
    g1:    '#22D3EE',
    g2:    '#4F8BFF',
    g3:    '#A855F7',
    g4:    '#FB7185',
    stops: ['#22D3EE', '#4F8BFF', '#A855F7', '#FB7185'] as const,
    soft:  [
      'rgba(34, 211, 238, 0.16)',
      'rgba(79, 139, 255, 0.16)',
      'rgba(168, 85, 247, 0.16)',
      'rgba(251, 113, 133, 0.16)',
    ] as const,
  },
};
