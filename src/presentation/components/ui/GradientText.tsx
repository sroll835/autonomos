import React from 'react';
import { Text, TextStyle, StyleProp } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../theme/ThemeProvider';

interface GradientTextProps {
  children: string;
  style?: StyleProp<TextStyle>;
  /** Override de stops opcional. Por default usa el degradado de marca JuanCode. */
  colors?: readonly [string, string, ...string[]];
  /** Ángulo del degradado. Default 110° aproximado vía start/end. */
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * GradientText — el SELLO JuanCode.
 *
 * Aplica el degradado de marca (cian → blue → purple → pink-red) sobre
 * el texto, equivalente a `background-clip: text` de la web.
 *
 * Uso CORRECTO: títulos de pantalla y métricas/datos clave SOLAMENTE.
 * NO usar en párrafos ni labels — el degradado pierde impacto si se aplica
 * a todo.
 *
 *   <GradientText style={typography.h1}>AUTONOMOS</GradientText>
 *   <GradientText style={typography.display}>{count}</GradientText>
 */
export const GradientText: React.FC<GradientTextProps> = ({
  children,
  style,
  colors,
  start = { x: 0, y: 0.5 },
  end = { x: 1, y: 0.5 },
}) => {
  const theme = useTheme();
  const stops = (colors ?? theme.gradient.stops) as unknown as readonly [string, string, ...string[]];

  return (
    <MaskedView
      maskElement={
        <Text style={[style, { backgroundColor: 'transparent' }]}>{children}</Text>
      }
    >
      <LinearGradient colors={stops as any} start={start} end={end}>
        <Text style={[style, { opacity: 0 }]}>{children}</Text>
      </LinearGradient>
    </MaskedView>
  );
};
