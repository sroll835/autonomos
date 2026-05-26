import { Theme } from '../types';

/**
 * Tema principal de AUTONOMOS — JuanCode (dark futurista premium).
 *
 * SELLO de marca: degradado cyan → blue → purple → pink-red.
 * Aplicar el degradado via <GradientText /> en títulos de pantalla
 * y métricas/datos clave (no en párrafos ni labels).
 *
 * Cards / sheets: glassmorphism (surface rgba blanco semitransparente
 * sobre background dark).
 */
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Backgrounds
    background:      '#070A12',
    bg2:             '#0B1020',
    surface:         'rgba(255, 255, 255, 0.04)',
    surfaceRaised:   'rgba(255, 255, 255, 0.06)',
    surfaceElevated: '#0B1020',
    overlay:         'rgba(7, 10, 18, 0.78)',

    // Bordes
    border:          'rgba(255, 255, 255, 0.10)',
    borderSubtle:    'rgba(255, 255, 255, 0.06)',
    borderStrong:    'rgba(255, 255, 255, 0.18)',
    borderFocus:     '#22D3EE',

    // Texto
    textPrimary:     '#EDF1FA',
    textSecondary:   '#A6B0C3',
    textTertiary:    '#6C778C',
    textInverse:     '#06080F',
    textOnGradient:  '#06080F',

    // Acento (cian g1)
    chrome:          '#22D3EE',
    chromeMuted:     'rgba(34, 211, 238, 0.4)',
    chromeGlow:      'rgba(34, 211, 238, 0.16)',

    // CTA texto sobre fill gradient
    ctaPrimaryText:  '#06080F',

    // Feedback semántico
    success:         '#22D3EE',
    warning:         '#FB7185',
    danger:          '#FB7185',
    info:            '#4F8BFF',
    emergency:       '#FF5470',

    // Estados (overlays)
    hover:           'rgba(255, 255, 255, 0.04)',
    pressed:         'rgba(255, 255, 255, 0.08)',
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
