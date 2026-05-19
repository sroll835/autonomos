import React, { useRef, useState } from 'react';
import { View, Text, FlatList, Dimensions, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { localStorage, LOCAL_KEYS } from '@/infrastructure/storage/localStorage';
import { Button } from '@/presentation/components/ui/Button';
import { colors } from '@/presentation/theme/colors';

const { width } = Dimensions.get('window');

const SLIDES = [
  {
    id: '1',
    title: 'Todo para ti y tu vehículo',
    description: 'Autopartes, mecánicos, grúas y más en un solo ecosistema digital pensado para Colombia.',
    emoji: '🚗',
    bg: colors.navy[500],
  },
  {
    id: '2',
    title: 'Geolocalización en tiempo real',
    description: 'Encuentra el proveedor más cercano disponible y sigue tu servicio en vivo en el mapa.',
    emoji: '📍',
    bg: colors.navy[400],
  },
  {
    id: '3',
    title: 'Oportunidades para autónomos',
    description: 'Si eres mecánico o conductor, únete a la red y genera ingresos de forma independiente.',
    emoji: '⚙️',
    bg: colors.navy[500],
  },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const flatRef = useRef<FlatList>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleNext = async () => {
    if (activeIndex < SLIDES.length - 1) {
      flatRef.current?.scrollToIndex({ index: activeIndex + 1 });
    } else {
      await localStorage.set(LOCAL_KEYS.ONBOARDING_DONE, true);
      router.replace('/(auth)/login');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <FlatList
        ref={flatRef}
        data={SLIDES}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item.id}
        onMomentumScrollEnd={(e) => {
          setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
        }}
        renderItem={({ item }) => (
          <View style={[styles.slide, { backgroundColor: item.bg, width }]}>
            <Animated.View entering={FadeInDown.duration(600)} style={styles.content}>
              <Text style={styles.emoji}>{item.emoji}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </Animated.View>
          </View>
        )}
      />
      {/* Indicadores */}
      <View style={styles.dots}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, i === activeIndex && styles.dotActive]} />
        ))}
      </View>
      {/* Botones */}
      <View style={styles.buttons}>
        <Button
          title={activeIndex === SLIDES.length - 1 ? 'Comenzar' : 'Siguiente'}
          onPress={handleNext}
          fullWidth
          size="lg"
          style={styles.nextBtn}
        />
        {activeIndex < SLIDES.length - 1 && (
          <TouchableOpacity onPress={async () => {
            await localStorage.set(LOCAL_KEYS.ONBOARDING_DONE, true);
            router.replace('/(auth)/login');
          }}>
            <Text style={styles.skip}>Omitir</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.navy[500] },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  content: { alignItems: 'center' },
  emoji: { fontSize: 80, marginBottom: 32 },
  title: { fontSize: 28, fontFamily: 'Inter_700Bold', color: colors.white, textAlign: 'center', marginBottom: 16 },
  description: { fontSize: 16, fontFamily: 'Inter_400Regular', color: 'rgba(255,255,255,0.8)', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', paddingVertical: 20 },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.3)', marginHorizontal: 4 },
  dotActive: { backgroundColor: colors.primary[500], width: 24 },
  buttons: { paddingHorizontal: 24, paddingBottom: 40 },
  nextBtn: { marginBottom: 12 },
  skip: { color: 'rgba(255,255,255,0.6)', textAlign: 'center', fontFamily: 'Inter_400Regular', fontSize: 15 },
});
