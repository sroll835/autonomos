/**
 * SHIM legacy → JuanCode (dark futurista premium).
 *
 * Los 23 screens legacy importan `colors.X` con StyleSheets inline.
 * Sin tocar cada screen, este shim re-mapea cada key vieja a su
 * equivalente JuanCode más cercano:
 *   - Pares invertidos: neutral[50] (esperaba fondo blanco) → ahora bg dark.
 *     neutral[900] (esperaba texto oscuro) → ahora texto claro.
 *   - Acento primary[*] amarillo → ahora cian (g1).
 *   - Navy → bg principal #070A12.
 *   - Semantic emergency → #FF5470 JuanCode.
 *
 * La fuente única de verdad es `themes/dark.ts`. Este archivo es solo
 * compatibilidad de tipos para que screens sin migrar absorban el
 * nuevo lenguaje visual.
 */
export const colors = {
  // Acento cian (g1) — antes amarillo
  primary: {
    50:  'rgba(34, 211, 238, 0.10)',
    100: 'rgba(34, 211, 238, 0.16)',
    500: '#22D3EE',
    600: '#4F8BFF',
    900: '#EDF1FA',
  },
  // Navy → bg JuanCode
  navy: {
    400: '#0B1020',
    500: '#070A12',
    600: '#06080F',
  },
  // Feedback semántico JuanCode
  semantic: {
    emergency: '#FF5470',
    success:   '#22D3EE',
    warning:   '#FB7185',
    info:      '#4F8BFF',
  },
  // INVERTIDOS — clave para no romper legacy
  // - neutral[50..300] eran fondos claros → ahora superficies dark
  // - neutral[500..900] eran textos oscuros → ahora textos claros
  neutral: {
    50:  '#070A12',                          // antes #F9FAFB blanco → ahora bg principal
    100: '#0B1020',                          // antes #F3F4F6 → bg-2
    200: 'rgba(255, 255, 255, 0.10)',        // antes #E5E7EB → border
    300: 'rgba(255, 255, 255, 0.18)',        // antes #D1D5DB → border strong
    400: '#6C778C',                          // text faint (extra para legacy que lo use)
    500: '#A6B0C3',                          // antes #6B7280 → text dim
    600: '#A6B0C3',                          // extra
    700: '#EDF1FA',                          // antes #374151 → text
    800: '#EDF1FA',                          // extra
    900: '#EDF1FA',                          // antes #111827 oscuro → ahora texto claro
  },
  // Blanco / negro de marca JuanCode
  white: '#EDF1FA',     // antes #FFFFFF puro → ahora "blanco JuanCode" suave
  black: '#06080F',     // antes #000 → ahora negro JuanCode
  transparent: 'transparent',
} as const;
