import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useQuery } from '@tanstack/react-query';
import { Image } from 'expo-image';
import { useCartStore } from '@/presentation/stores/cartStore';
import { Badge } from '@/presentation/components/ui/Badge';
import { Button } from '@/presentation/components/ui/Button';
import { Skeleton } from '@/presentation/components/ui/Skeleton';
import { formatCOP } from '@/shared/utils/formatters';
import { colors } from '@/presentation/theme/colors';
import { Product } from '@/domain/entities/Product';
import { container } from '@/di/container';

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { addItem } = useCartStore();

  const { data: product, isLoading } = useQuery<Product>({
    queryKey: ['product', id],
    queryFn: () => container.repos.product.getProductById(id),
  });

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Skeleton height={280} borderRadius={0} />
        <View style={{ padding: 16, gap: 12 }}>
          <Skeleton height={24} width="80%" />
          <Skeleton height={16} width="50%" />
          <Skeleton height={32} width="40%" />
        </View>
      </View>
    );
  }

  if (!product) return null;

  const discount = product.discountPrice ? Math.round(((product.price - product.discountPrice) / product.price) * 100) : 0;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Imagen */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: product.images[0] }} style={styles.image} contentFit="cover" />
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          {discount > 0 && <Badge label={`-${discount}%`} variant="danger" style={styles.discountBadge} />}
        </View>

        <View style={styles.content}>
          <View style={styles.headerRow}>
            <Text style={styles.productName}>{product.name}</Text>
            <Badge label={product.origin === 'IMPORTADO' ? 'Importado' : 'Nacional'} variant={product.origin === 'IMPORTADO' ? 'info' : 'success'} />
          </View>
          <Text style={styles.brand}>{product.brand} · SKU: {product.sku}</Text>
          <View style={styles.priceRow}>
            <Text style={styles.price}>{formatCOP(product.discountPrice ?? product.price)}</Text>
            {product.discountPrice && <Text style={styles.originalPrice}>{formatCOP(product.price)}</Text>}
          </View>
          <View style={styles.ratingRow}>
            <Text>⭐ {product.rating.toFixed(1)}</Text>
            <Text style={styles.ratingCount}>({product.reviewCount} reseñas)</Text>
            <Text style={styles.stock}>📦 {product.stock} disponibles</Text>
          </View>

          {/* Compatibilidad */}
          {product.compatibility.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Compatibilidad</Text>
              {product.compatibility.slice(0, 3).map((c, i) => (
                <Text key={i} style={styles.compatItem}>• {c.brand} {c.model} ({c.yearFrom}–{c.yearTo})</Text>
              ))}
            </View>
          )}

          {/* Descripción */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripción</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Footer fijo */}
      <View style={styles.footer}>
        <Button title="Agregar al carrito" onPress={() => { addItem(product); router.back(); }} fullWidth size="lg" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white },
  imageContainer: { position: 'relative' },
  image: { width: '100%', height: 280 },
  backBtn: { position: 'absolute', top: 50, left: 16, width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 20, color: colors.navy[500] },
  discountBadge: { position: 'absolute', top: 50, right: 16 },
  content: { padding: 20 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 12 },
  productName: { flex: 1, fontSize: 20, fontFamily: 'Inter_700Bold', color: colors.neutral[900], lineHeight: 26 },
  brand: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginBottom: 12 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 10 },
  price: { fontSize: 26, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  originalPrice: { fontSize: 16, fontFamily: 'Inter_400Regular', color: colors.neutral[400], textDecorationLine: 'line-through' },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 },
  ratingCount: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  stock: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  section: { borderTopWidth: 1, borderTopColor: colors.neutral[100], paddingTop: 16, marginTop: 4, marginBottom: 8 },
  sectionTitle: { fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 10 },
  compatItem: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[600], marginBottom: 4, lineHeight: 20 },
  description: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[600], lineHeight: 22 },
  footer: { padding: 16, backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.neutral[200] },
});
