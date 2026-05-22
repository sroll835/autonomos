# AUTONOMOS — Design System (MASTER)

> **Fuente de verdad** para el sistema visual de la app. Si una pantalla necesita override, vive en `design-system/autonomos/pages/[page].md` y ese archivo manda.

**Proyecto**: AUTONOMOS — plataforma automotriz LATAM
**Categoría visual**: Automotive Luxury / Dark Premium / Chiaroscuro
**Modo principal**: Oscuro (dark-first, no hay versión clara fina)
**Sensación**: Museo, monocromático, espacio negativo amplio, iluminación spotlight

---

## 1. Tokens semánticos (modo oscuro)

Los tokens son **semánticos**: nombran el propósito, no el valor. Cualquier componente debe consumir el token, NUNCA hardcodear el hex.

### 1.1 Backgrounds y superficies

| Token | Hex | Cuándo usar |
|---|---|---|
| `background` | `#0A0A0B` | Fondo raíz de la app. Negro void, NO `#000` plano. |
| `surface` | `#141416` | Cards, sheets, contenedores agrupadores. Primer nivel de elevación visual. |
| `surfaceRaised` | `#1C1C1F` | Estados hover/focus de cards, modales, dropdowns, toast. Segundo nivel. |
| `surfaceElevated` | `#26262A` | Tooltips, popovers, segmentos activos. Tercer nivel (úsalo poco). |
| `overlay` | `rgba(10, 10, 11, 0.72)` | Backdrop de modales/sheets. Mantiene texto leíble detrás. |

### 1.2 Bordes y separadores

| Token | Hex | Cuándo usar |
|---|---|---|
| `border` | `#2A2A2E` | Borde estándar de cards, inputs, separadores entre filas. |
| `borderSubtle` | `#1F1F22` | Separadores muy ligeros (dividers internos de un mismo bloque). |
| `borderFocus` | (alias de `chrome`) | Borde de input en focus, ring de selección. |

### 1.3 Texto

| Token | Hex | Cuándo usar |
|---|---|---|
| `textPrimary` | `#F4F4F5` | Texto principal, headings, labels primarios. Blanco SUAVE — `#FFF` puro queda agresivo en chiaroscuro. |
| `textSecondary` | `#8A8A8F` | Texto de apoyo, captions, placeholders, metadatos. |
| `textTertiary` | `#5A5A5F` | Texto deshabilitado, hint muy bajo. |
| `textInverse` | `#0A0A0B` | Texto sobre `ctaPrimary` (blanco). |

### 1.4 Acento — chrome (plata)

| Token | Hex | Cuándo usar |
|---|---|---|
| `chrome` | `#C0C0C5` | **Único acento permitido.** Bordes en focus, líneas de énfasis, separadores destacados, iconos selectos. |
| `chromeMuted` | `rgba(192, 192, 197, 0.4)` | Versión apagada para hover sutil o estados intermedios. |
| `chromeGlow` | `rgba(192, 192, 197, 0.08)` | Glow apenas perceptible para elementos focales (ver §4 sombras). |

**Regla estricta de uso del chrome**: solo **bordes** y **líneas**. Nunca como `backgroundColor` de un elemento amplio (no llenes una card de plata). Si quieres destacar, eleva la `surface` o añade un `border: chrome`.

### 1.5 CTA

| Token | Hex | Cuándo usar |
|---|---|---|
| `ctaPrimary` | `#FFFFFF` | Botón primario CTA. Blanco sólido sobre negro = máximo contraste, premium. |
| `ctaPrimaryText` | `#0A0A0B` (`textInverse`) | Texto sobre el CTA primario. |
| `ctaSecondary` | `transparent` | Botón secundario: sin fill, borde `chrome`, texto `textPrimary`. |
| `ctaGhost` | `transparent` | Botón terciario/ghost: sin fill, sin borde, texto `textSecondary` → `textPrimary` en hover. |

### 1.6 Feedback semántico (apagados — chiaroscuro NO satura)

| Token | Hex | Cuándo usar |
|---|---|---|
| `success` | `#7A9B7E` | Verde apagado. Confirmaciones, estados completados. |
| `warning` | `#B8956A` | Ámbar apagado. Advertencias, estados pending. |
| `danger` | `#A86761` | Rojo apagado. Errores, destructivos. NO `#DC2626` ni rojos brillantes. |
| `info` | `#7A8FA8` | Azul apagado. Notas informativas. |
| `emergency` | `#D14A4A` | **Excepción justificada por jerarquía de seguridad**: el SOS es la función más crítica (gente varada/en peligro) y DEBE romper el chiaroscuro para saltar a la vista. Rojo apagado, NO neón. **Aplicado en**: `app/emergency/index.tsx` (botón SOS principal + ring de countdown), `presentation/components/ui/Badge` (variante `emergency` para badges de emergencia activa en el shell tracking/profile), `presentation/stores/emergencyStore` activeEmergency consumers. No usar fuera de SOS. |

### 1.7 Estados

| Token | Hex | Cuándo usar |
|---|---|---|
| `hover` | `rgba(244, 244, 245, 0.04)` | Capa de blanco apenas perceptible sobre el elemento. Overlay encima de surface actual. |
| `pressed` | `rgba(244, 244, 245, 0.08)` | Más visible que hover. Estado active/pressed. |
| `disabled` | (combinación) | `opacity: 0.4` sobre el elemento + cursor `not-allowed`. NO desaturar manualmente. |
| `focusRing` | `chrome` con `2px` outline + `chromeGlow` | Único indicador de focus. Debe estar SIEMPRE visible. |

---

## 2. Tipografía

### 2.1 Familias

- **Display / headings**: **Cormorant** (serif elegante, alma luxury fashion)
- **Body / UI**: **Montserrat** (sans-serif geométrico, neutralidad premium)

**Pesos cargados — SOLO los que la escala (§2.2) usa**:

| Familia | Pesos consumidos | Tokens que los usan |
|---|---|---|
| Cormorant | `500`, `600` | `h2` (500) · `display`, `h1` (600) |
| Montserrat | `400`, `500`, `600` | `bodyLg`, `body` (400) · `caption` (500) · `h3`, `overline`, `button` (600) |

**Total: 5 pesos** (no 9). Bundle ~50% más liviano que cargar la familia completa.

**Instalación en RN/Expo**:
```bash
npx expo install @expo-google-fonts/cormorant @expo-google-fonts/montserrat
```

Cargar en `app/_layout.tsx` SOLO los pesos listados arriba:
```ts
import {
  Cormorant_500Medium,
  Cormorant_600SemiBold,
} from '@expo-google-fonts/cormorant';
import {
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
} from '@expo-google-fonts/montserrat';

const [fontsLoaded] = useFonts({
  Cormorant_500Medium,
  Cormorant_600SemiBold,
  Montserrat_400Regular,
  Montserrat_500Medium,
  Montserrat_600SemiBold,
});
```

Mantener Inter (ya cargado) solo hasta que se hayan migrado todas las pantallas. Después borrarlo del `useFonts`.

### 2.2 Escala tipográfica

Line-height generoso (1.4-1.6) para el feel museo.

| Token | Familia | Size | Line height | Letter spacing | Uso |
|---|---|---|---|---|---|
| `display` | Cormorant 600 | 40 | 48 | -0.5 | Logo/hero text (login screen) |
| `h1` | Cormorant 600 | 32 | 40 | -0.3 | Títulos de pantalla |
| `h2` | Cormorant 500 | 24 | 32 | -0.2 | Subtítulos de sección |
| `h3` | Montserrat 600 | 18 | 26 | 0 | Headings de card |
| `bodyLg` | Montserrat 400 | 16 | 26 | 0 | Texto principal |
| `body` | Montserrat 400 | 14 | 22 | 0 | Texto estándar |
| `caption` | Montserrat 500 | 12 | 18 | 0.2 | Metadatos, labels |
| `overline` | Montserrat 600 | 11 | 14 | 1.5 | Eyebrows, badges (uppercase) |
| `button` | Montserrat 600 | 15 | 20 | 0.3 | Texto de botones |

**Regla**: títulos de pantallas y momentos hero → **Cormorant**. UI funcional, listas, botones → **Montserrat**. Mezcla con propósito, no por adorno.

---

## 3. Espaciado (escala museo)

Base 8px. La parte alta de la escala es deliberadamente amplia para soportar la sensación de respiración.

| Token | Valor | Uso |
|---|---|---|
| `space.xs` | `4` | Gaps internos mínimos (icon + label) |
| `space.sm` | `8` | Padding tight, gaps secundarios |
| `space.md` | `16` | Padding estándar, gap entre elementos |
| `space.lg` | `24` | Padding generoso de card, separación de bloques |
| `space.xl` | `40` | Separación entre secciones de pantalla |
| `space.2xl` | `64` | Header → contenido, espacio museo |
| `space.3xl` | `96` | Hero spacing, login screen, transiciones de capítulo |

**Regla**: cuando dudes entre dos valores, elige el mayor. La densidad densa rompe el chiaroscuro.

---

## 4. Sombras y glows — POR PLATAFORMA (honestos)

React Native NO tiene una API unificada de sombras. Esto importa:

| Plataforma | Soporta `shadow*` props | Soporta `boxShadow` | Soporta blur/spread real | Soporta color custom |
|---|---|---|---|---|
| **iOS** | ✅ `shadowColor`, `shadowOffset`, `shadowOpacity`, `shadowRadius` | ❌ (RN < 0.76 nativo; web sí) | ✅ via `shadowRadius` | ✅ vía `shadowColor` |
| **Android** | ❌ ignorados | ❌ | ❌ `elevation` solo simula profundidad gris, no permite color ni blur | ❌ |
| **Web** (RN-Web) | ✅ | ✅ (RN-Web mapea ambos a `box-shadow` CSS) | ✅ | ✅ |

### 4.1 Lo que esto significa para el design system

**iOS y Web verán los glows de plata como están diseñados. Android los verá como una elevación gris plana.** No hay forma nativa de pintar un glow de color en Android sin librerías de terceros (ej. `react-native-shadow-2`) que añaden churn.

**Decisión**: NO incluir librerías de sombras. Los tokens se aplican con `Platform.select` y Android cae a `elevation`.

### 4.2 Tokens de sombra

| Token | iOS/Web | Android | Notas |
|---|---|---|---|
| `shadow.drop` | `shadowColor:#000, shadowOffset:{0,4}, shadowOpacity:0.4, shadowRadius:12` | `elevation: 6` | Sombra estándar de card en elevación normal. |
| `shadow.dropLg` | `shadowColor:#000, shadowOffset:{0,8}, shadowOpacity:0.5, shadowRadius:24` | `elevation: 12` | Modales, sheets, FAB. |
| `shadow.spotlight` | `shadowColor:#C0C0C5, shadowOffset:{0,0}, shadowOpacity:0.16, shadowRadius:20` | `elevation: 8` | Glow de chrome para elementos focales (CTA hero, SOS button). **En Android se degrada a elevación gris**. |
| `shadow.none` | sin shadow props | `elevation: 0` | Reset explícito. |

### 4.3 Patrón implementación
```ts
import { Platform } from 'react-native';

export const shadow = {
  spotlight: Platform.select({
    ios: {
      shadowColor: theme.chrome,
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.16,
      shadowRadius: 20,
    },
    android: { elevation: 8 },
    web: { boxShadow: `0 0 20px ${theme.chromeGlow}` },
  }),
  // ...resto
};
```

### 4.4 Documentación visible al usuario final

En la pantalla de login y otros momentos focales, la primera vez que aparezca un glow de chrome, **en Android se va a ver como una sombra gris plana** sin el tinte plata. No es bug. Si en el futuro alguien pide "Android se ve diferente al diseño", la respuesta es esta limitación nativa. Aceptada.

---

## 5. Themes — `dark.ts` completo + `light.ts` stub

Estructura: `src/presentation/theme/themes/` con `dark.ts` (completo) y `light.ts` (stub con misma forma). Un `ThemeProvider` simple expone el theme activo vía Context.

### 5.1 Tipo `Theme` (`src/presentation/theme/types.ts`)

```ts
export interface ThemeColors {
  background: string;
  surface: string;
  surfaceRaised: string;
  surfaceElevated: string;
  overlay: string;

  border: string;
  borderSubtle: string;
  borderFocus: string;

  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;

  chrome: string;
  chromeMuted: string;
  chromeGlow: string;

  ctaPrimary: string;
  ctaPrimaryText: string;

  success: string;
  warning: string;
  danger: string;
  info: string;
  emergency: string;

  hover: string;
  pressed: string;
}

export interface Theme {
  mode: 'dark' | 'light';
  colors: ThemeColors;
}
```

### 5.2 `dark.ts` (completo, funcional)

```ts
import { Theme } from './types';

export const darkTheme: Theme = {
  mode: 'dark',
  colors: {
    background:     '#0A0A0B',
    surface:        '#141416',
    surfaceRaised:  '#1C1C1F',
    surfaceElevated:'#26262A',
    overlay:        'rgba(10, 10, 11, 0.72)',

    border:         '#2A2A2E',
    borderSubtle:   '#1F1F22',
    borderFocus:    '#C0C0C5',

    textPrimary:    '#F4F4F5',
    textSecondary:  '#8A8A8F',
    textTertiary:   '#5A5A5F',
    textInverse:    '#0A0A0B',

    chrome:         '#C0C0C5',
    chromeMuted:    'rgba(192, 192, 197, 0.4)',
    chromeGlow:     'rgba(192, 192, 197, 0.08)',

    ctaPrimary:     '#FFFFFF',
    ctaPrimaryText: '#0A0A0B',

    success:        '#7A9B7E',
    warning:        '#B8956A',
    danger:         '#A86761',
    info:           '#7A8FA8',
    emergency:      '#D14A4A',

    hover:          'rgba(244, 244, 245, 0.04)',
    pressed:        'rgba(244, 244, 245, 0.08)',
  },
};
```

### 5.3 `light.ts` (stub — misma forma, valores placeholder)

```ts
import { Theme } from './types';

/* ============================================================ */
/* ⚠️⚠️⚠️  STUB — NO USAR EN PRODUCCIÓN  ⚠️⚠️⚠️                */
/* ============================================================ */
/*                                                              */
/*  La app es DARK-FIRST. Este archivo existe ÚNICAMENTE para   */
/*  mantener la forma semántica del Theme (mismas keys) y       */
/*  permitir que el theming compile y sea extensible.           */
/*                                                              */
/*  Los valores aquí son PLACEHOLDERS sin afinar contra el      */
/*  brief de marca. Activar este tema sin diseño dedicado       */
/*  romperá la coherencia visual del producto.                  */
/*                                                              */
/*  Si producto pide modo claro, abrir branch dedicada y        */
/*  redefinir TODOS los valores. NO descomentar ni activar      */
/*  desde aquí.                                                 */
/* ============================================================ */

export const lightTheme: Theme = {
  mode: 'light',
  colors: {
    background:     '#FFFFFF',
    surface:        '#F5F5F7',
    surfaceRaised:  '#EBEBEE',
    surfaceElevated:'#E0E0E4',
    overlay:        'rgba(255, 255, 255, 0.72)',

    border:         '#D4D4D8',
    borderSubtle:   '#E4E4E7',
    borderFocus:    '#3A3A3F',

    textPrimary:    '#0A0A0B',
    textSecondary:  '#5A5A5F',
    textTertiary:   '#8A8A8F',
    textInverse:    '#F4F4F5',

    chrome:         '#3A3A3F',
    chromeMuted:    'rgba(58, 58, 63, 0.4)',
    chromeGlow:     'rgba(58, 58, 63, 0.08)',

    ctaPrimary:     '#0A0A0B',
    ctaPrimaryText: '#F4F4F5',

    success:        '#5A8B5E',
    warning:        '#A87F4A',
    danger:         '#A84A4A',
    info:           '#5A6F88',
    emergency:      '#C13030',

    hover:          'rgba(10, 10, 11, 0.04)',
    pressed:        'rgba(10, 10, 11, 0.08)',
  },
};
```

### 5.4 ThemeProvider (`src/presentation/theme/ThemeProvider.tsx`)

```tsx
import React, { createContext, useContext, ReactNode } from 'react';
import { Theme } from './types';
import { darkTheme } from './themes/dark';

const ThemeContext = createContext<Theme>(darkTheme);

export function ThemeProvider({ children, theme = darkTheme }: { children: ReactNode; theme?: Theme }) {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  return useContext(ThemeContext);
}
```

Wire en `app/_layout.tsx`:
```tsx
<ThemeProvider theme={darkTheme}>
  {/* resto */}
</ThemeProvider>
```

### 5.5 Consumo en componentes

```tsx
import { useTheme } from '@/presentation/theme/ThemeProvider';

export function Card({ children }: { children: ReactNode }) {
  const theme = useTheme();
  return (
    <View style={{
      backgroundColor: theme.colors.surface,
      borderColor: theme.colors.border,
      borderWidth: 1,
      borderRadius: 12,
      padding: 24,
    }}>
      {children}
    </View>
  );
}
```

`StyleSheet.create` queda fuera: los estilos dependen del theme. Si la perf importa, pasar a `useMemo(() => StyleSheet.create({...}), [theme])`.

---

## 6. Iconografía

- **Set único**: **Lucide** (`lucide-react-native`). Stroke `1.5`, size `20` (UI) o `24` (touch targets primarios).
- **Color**: `textSecondary` por defecto; `textPrimary` en estado activo; `chrome` en momentos de énfasis.
- **Prohibido**: emoji como icono. Solo SVG.

Instalación:
```bash
npx expo install lucide-react-native react-native-svg
```

---

## 7. Componentes — especificaciones

### 7.1 Button

| Variante | Background | Border | Text | Height | Padding |
|---|---|---|---|---|---|
| `primary` (CTA) | `ctaPrimary` | none | `ctaPrimaryText` | 52 | `lg` horizontal |
| `secondary` | `transparent` | `1px chrome` | `textPrimary` | 52 | `lg` horizontal |
| `ghost` | `transparent` | none | `textSecondary` (color cambia a `textPrimary` durante press) | 44 | `md` horizontal |
| `danger` | `transparent` | `1px danger` | `danger` | 44 | `md` horizontal |

Border radius: `8`. Letter spacing del texto: `0.3`.

**Implementación RN pura**:
- Usar `Pressable` con `style={({ pressed }) => [...]}` para react al estado `pressed` (no hay `:hover` ni `:active` CSS).
- Aplicar overlay `pressed` (token §1.7) como capa adicional cuando `pressed === true`. Ejemplo: button primary muestra opacity 0.85 + capa `pressed` por encima.
- Transición de color/opacidad vía `react-native-reanimated` con `withTiming(..., { duration: 200, easing: Easing.out(Easing.cubic) })` cuando el cambio sea visualmente notable. Para opacity simple, RN nativo basta.
- Estado `disabled`: `disabled` prop en Pressable + `opacity: 0.4` aplicado al wrapper. NO confiar en pseudo-clases.

### 7.2 Input

- Background: `surface`
- Border default: `1px border`
- Border en focus: `1.5px borderFocus` (que es alias de `chrome`)
- Text: `textPrimary`
- Placeholder: `textTertiary`
- Padding: `md` vertical, `md` horizontal
- Border radius: `8`
- Label arriba en `caption` color `textSecondary`. Error debajo en `caption` color `danger`.
- NO usar `shadow.spotlight` en focus — el color del border ya señaliza. Mantener limpio.

**Implementación RN pura**:
- Estado focus se maneja con `useState<boolean>(false)` + handlers `onFocus`/`onBlur` del `TextInput`. RN no tiene `:focus` CSS.
- Cambio de `borderWidth` 1 → 1.5 puede causar layout shift de 1px. Mitigar: mantener `borderWidth: 1.5` siempre con color `border` por defecto y solo cambiar color en focus. O usar `paddingHorizontal` ajustado.
- Si quieres animar el color del border, `react-native-reanimated` con `useAnimatedStyle` + `withTiming` sobre `borderColor`.

### 7.3 Card

- Background: `surface`
- Border: `1px border` (opcional `borderSubtle` para cards anidadas)
- Border radius: `12`
- Padding: `lg` (24)
- Optional shadow: `shadow.drop` para cards "elevadas" (modales, foco principal). Cards en feed sin sombra — separación por borde.

### 7.4 Toast

- Background: `surfaceRaised`
- Border: `1px chrome` (énfasis del feedback)
- Text: `textPrimary`
- Icono (Lucide): tono por tipo (`success`/`warning`/`danger`/`info`)
- Border radius: `10`
- Padding: `md`
- Margin: top o bottom, `lg` desde edge
- Auto-dismiss 4s. Tap para cerrar antes.

### 7.5 Badge

- Background: `surfaceRaised` o `surface` según contexto
- Border: opcional `1px border`
- Text: `overline` style (uppercase, letter-spacing 1.5)
- Padding: `xs` vertical, `sm` horizontal
- Border radius: `4`
- Variantes: default, `success`, `warning`, `danger`, `info` — usan el color como texto (NO fill saturado).

### 7.6 Skeleton

- Background: `surface`
- Animación shimmer: barrido sutil de `surfaceRaised` izq→der, 1500ms loop, `Easing.linear`
- Border radius: matches el componente que reemplaza
- NO usar gradientes saturados — mantener monocromo.

### 7.7 Tabs (`(tabs)/_layout.tsx`)

- Background: `surface` con `borderTop: 1px borderSubtle`
- Tab activo: icono y label `textPrimary`, línea superior `2px chrome`
- Tab inactivo: icono y label `textSecondary`
- Sin fill colorido. La línea de chrome marca el activo.
- Iconos Lucide tamaño `22`, label `caption` debajo.

### 7.8 SafeScreen (layout wrapper)

- Background: `background` (raíz)
- Respeta safe area top + bottom (notch, home indicator)
- Optional padding horizontal `md` por defecto

---

## 8. Reglas estrictas (anti-patterns)

❌ **NO** usar `#000` puro o `#FFF` puro en backgrounds, surfaces o texto.
  Usar `background` (`#0A0A0B`) y `textPrimary` (`#F4F4F5`).
  **Excepción única**: `ctaPrimary = #FFFFFF` — blanco puro deliberado en el botón CTA primario porque ahí el contraste máximo SÍ es premium. Es la única superficie del sistema con blanco puro.
❌ **NO** hardcodear hex en componentes. Siempre `theme.colors.X` vía `useTheme()`.
❌ **NO** rellenar amplios con `chrome` — solo bordes/líneas/iconos puntuales.
❌ **NO** usar colores saturados (rojo `#DC2626`, azul `#3B82F6`, verde `#10B981`). Los feedbacks van apagados (`success`, `warning`, `danger`, `info` de §1.6).
❌ **NO** emojis como icono. Solo Lucide.
❌ **NO** sombras multi-fuente (light from top + side + bottom). Una sola fuente, drop hacia abajo. Glow opcional desde el elemento mismo (solo iOS/Web — ver §4).
❌ **NO** modo claro hasta que producto lo defina. `light.ts` es stub con banner de warning.
❌ **NO** densidad excesiva. Si una pantalla tiene >5 acciones primarias visibles, replantea.
❌ **NO** transiciones instantáneas. Mínimo 150ms (usar `withTiming` de reanimated o `Animated` nativo).
❌ **NO** focus invisible. `chrome` border o ring siempre presente en `onFocus`.
❌ **NO** instalar `nativewind` ni `tailwind-rn`. El sistema es theme object TS via `useTheme()`. Mantener un paradigma único.
❌ **NO** instalar `react-native-shadow-2` ni libs equivalentes. Aceptamos que Android no renderiza glow de color.

---

## 9. Animaciones

- **Duración base**: 200ms.
- **Easing**: `Easing.out(Easing.cubic)` para entradas, `Easing.in(Easing.cubic)` para salidas.
- **Reduced motion**: respetar `AccessibilityInfo.isReduceMotionEnabled()` — desactivar animaciones decorativas.
- **Loading**: shimmer en `surface` (no spinners coloridos).
- **Page transitions**: fade + slide muy sutil (16dp). Sin parallax.

---

## 10. Loading & empty states

- **Loading**: `Skeleton` con shimmer del mismo color family. NUNCA spinner brillante.
- **Empty**: icono Lucide grande (40-48), `h3` con mensaje breve, `body` color `textSecondary` con sub-mensaje, optional CTA secundario.
- **Error**: icono Lucide `AlertTriangle` en `danger`, `h3` texto del error, CTA "Reintentar".

---

## 11. Pre-delivery checklist

Antes de commitear cualquier rework visual:

- [ ] Componente consume `useTheme()`, cero hex hardcodeado
- [ ] Touch targets ≥ 44x44px
- [ ] Focus state visible (chrome border o ring)
- [ ] Transiciones 150-300ms
- [ ] Iconos Lucide (sin emojis)
- [ ] `Platform.select` para sombras (iOS/Web glow, Android elevation)
- [ ] Texto en `textPrimary` / `textSecondary` (no `#FFF` / `#999`)
- [ ] Cards/contenedores con padding generoso (`lg` o más)
- [ ] Loading state implementado (skeleton, no spinner)
- [ ] Estado disabled con `opacity: 0.4`
- [ ] `prefers-reduced-motion` honrado en animaciones decorativas

---

## 12. Plan de implementación (orden recomendado)

1. **Theme infra**: `types.ts`, `themes/dark.ts`, `themes/light.ts` (stub), `ThemeProvider`, wire en `_layout.tsx`. Cargar fuentes Cormorant + Montserrat.
2. **Tokens de spacing/typography**: `spacing.ts`, `typography.ts` actualizados con la nueva escala.
3. **Componentes compartidos**: `Button`, `Input`, `Card`, `Badge`, `Avatar`, `Skeleton`, `Toast config` — uno por commit o agrupado por afinidad.
4. **Layout**: `SafeScreen`, `Header`, `(tabs)/_layout`.
5. **Pantalla de login**: fondo negro void, logo de login centrado con respiración `3xl`, único CTA blanco.
6. **Pantallas restantes**: por grupo (auth / tabs / profile / emergency / chat / tracking / checkout / product / service).
7. **Limpieza**: borrar tokens viejos no usados (`colors.ts` antiguo).

Al final de cada grupo: TS clean + smoke test del flujo afectado.
