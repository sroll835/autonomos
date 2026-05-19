import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const MapPlaceholder = ({ style, children }) => (
  <View style={[styles.map, style]}>
    <Text style={styles.text}>🗺️ Mapa disponible solo en móvil</Text>
    {children}
  </View>
);

const Marker = () => null;
const Polyline = () => null;
const Circle = () => null;
const Callout = () => null;

const styles = StyleSheet.create({
  map: { backgroundColor: '#E8EEF4', alignItems: 'center', justifyContent: 'center', flex: 1 },
  text: { fontSize: 14, color: '#6B7280', fontStyle: 'italic' },
});

export default MapPlaceholder;
export { Marker, Polyline, Circle, Callout };
export const PROVIDER_GOOGLE = 'google';
export const PROVIDER_DEFAULT = null;
