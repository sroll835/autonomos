import { Theme } from '../types';

/**
 * Tema principal de AUTONOMOS — automotive luxury chiaroscuro.
 * Dark-first. Tokens semánticos. Cualquier cambio aquí afecta a TODA la UI.
 */
export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    // Backgrounds y superficies
    background:      '#0A0A0B',
    surface:         '#141416',
    surfaceRaised:   '#1C1C1F',
    surfaceElevated: '#26262A',
    overlay:         'rgba(10, 10, 11, 0.72)',

    // Bordes
    border:          '#2A2A2E',
    borderSubtle:    '#1F1F22',
    borderFocus:     '#C0C0C5',

    // Texto
    textPrimary:     '#F4F4F5',
    textSecondary:   '#8A8A8F',
    textTertiary:    '#5A5A5F',
    textInverse:     '#0A0A0B',

    // Chrome (acento plata)
    chrome:          '#C0C0C5',
    chromeMuted:     'rgba(192, 192, 197, 0.4)',
    chromeGlow:      'rgba(192, 192, 197, 0.08)',

    // CTA
    ctaPrimary:      '#FFFFFF',
    ctaPrimaryText:  '#0A0A0B',

    // Feedback semántico
    success:         '#7A9B7E',
    warning:         '#B8956A',
    danger:          '#A86761',
    info:            '#7A8FA8',
    emergency:       '#D14A4A',

    // Estados
    hover:           'rgba(244, 244, 245, 0.04)',
    pressed:         'rgba(244, 244, 245, 0.08)',
  },
};
