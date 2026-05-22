import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Animated } from 'react-native';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { useCartStore } from '@/presentation/stores/cartStore';
import { formatCOP } from '@/shared/utils/formatters';
import { SafeScreen } from '@/presentation/components/layout/SafeScreen';
import { Card } from '@/presentation/components/ui/Card';
import { Badge } from '@/presentation/components/ui/Badge';
import { ProductCardSkeleton } from '@/presentation/components/ui/Skeleton';
import { colors } from '@/presentation/theme/colors';
import { Product } from '@/domain/entities/Product';
import { container } from '@/di/container';

const ITEMS_PER_PAGE = 10;

const fetchProducts = async ({ pageParam = 1, search = '' }) => {
  return container.useCases.getProducts.execute({ search }, pageParam, ITEMS_PER_PAGE);
};

function ProductCard({ product, onPress, onAddToCart }: { product: Product; onPress: () => void; onAddToCart: () => void }) {
  const discount = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;
  return (
    <Card onPress={onPress} style={styles.productCard}>
      <Image source={{ uri: product.images[0] }} style={styles.productImage} contentFit="cover" />
      {discount > 0 && <Badge label={`-${discount}%`} variant="danger" style={styles.discountBadge} />}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>
        <Text style={styles.productBrand}>{product.brand}</Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>{formatCOP(product.discountPrice ?? product.price)}</Text>
          {product.discountPrice && (
            <Text style={styles.originalPrice}>{formatCOP(product.price)}</Text>
          )}
        </View>
        <View style={styles.productMeta}>
          <Badge label={product.origin === 'NACIONAL' ? 'Nacional' : 'Importado'} variant={product.origin === 'IMPORTADO' ? 'info' : 'success'} />
          <Text style={styles.rating}>⭐ {product.rating.toFixed(1)}</Text>
        </View>
        <TouchableOpacity style={styles.addToCartBtn} onPress={onAddToCart}>
          <Text style={styles.addToCartText}>+ Agregar</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

export default function MarketplaceScreen() {
  const router = useRouter();
  const addItem = useCartStore((s) => s.addItem);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const debounceTimer = React.useRef<ReturnType<typeof setTimeout>>();

  const handleSearch = useCallback((text: string) => {
    setSearch(text);
    clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setDebouncedSearch(text), 300);
  }, []);

  const { data, isLoading, isFetchingNextPage, fetchNextPage, hasNextPage } = useInfiniteQuery({
    queryKey: ['products', debouncedSearch],
    queryFn: ({ pageParam }) => fetchProducts({ pageParam, search: debouncedSearch }),
    getNextPageParam: (last: { hasMore: boolean; page: number }) => last.hasMore ? last.page + 1 : undefined,
    initialPageParam: 1,
  });

  const products = data?.pages.flatMap((p: { data: Product[] }) => p.data) ?? [];

  const cartCount = useCartStore((s) => s.itemCount);
  const cartTotal = useCartStore((s) => s.total);

  return (
    <SafeScreen backgroundColor={colors.neutral[50]}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar autopartes por nombre, marca..."
          value={search}
          onChangeText={handleSearch}
          placeholderTextColor={colors.neutral[400]}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => { setSearch(''); setDebouncedSearch(''); }}>
            <Text style={styles.clearIcon}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Lista de productos */}
      {isLoading ? (
        <View style={styles.skeletonContainer}>
          {[...Array(4)].map((_, i) => <ProductCardSkeleton key={i} />)}
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              onPress={() => router.push(`/product/${item.id}` as never)}
              onAddToCart={() => addItem(item)}
            />
          )}
          onEndReached={() => hasNextPage && fetchNextPage()}
          onEndReachedThreshold={0.5}
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator color={colors.primary[500]} style={{ marginVertical: 16 }} /> : null}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔍</Text>
              <Text style={styles.emptyText}>Sin resultados para "{search}"</Text>
            </View>
          }
        />
      )}
      {cartCount > 0 && (
        <TouchableOpacity style={styles.cartFab} onPress={() => router.push('/checkout' as never)}>
          <Text style={styles.cartFabText}>🛒 {cartCount} item{cartCount > 1 ? 's' : ''} · {formatCOP(cartTotal)}</Text>
          <Text style={styles.cartFabArrow}>Checkout →</Text>
        </TouchableOpacity>
      )}
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  cartFab: { position: 'absolute', bottom: 16, left: 16, right: 16, backgroundColor: colors.navy[500], borderRadius: 14, paddingVertical: 14, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.2, shadowRadius: 8, elevation: 8 },
  cartFabText: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.white },
  cartFabArrow: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.primary[500] },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: 12, paddingHorizontal: 14, height: 48, margin: 16, borderWidth: 1, borderColor: colors.neutral[200] },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900] },
  clearIcon: { fontSize: 14, color: colors.neutral[400], padding: 4 },
  skeletonContainer: { padding: 16 },
  listContent: { padding: 8, paddingBottom: 100 },
  row: { justifyContent: 'space-between', paddingHorizontal: 8 },
  productCard: { width: '48%', marginBottom: 12, padding: 0, overflow: 'hidden' },
  productImage: { width: '100%', height: 130, borderTopLeftRadius: 12, borderTopRightRadius: 12 },
  discountBadge: { position: 'absolute', top: 8, left: 8 },
  productInfo: { padding: 10 },
  productName: { fontSize: 13, fontFamily: 'Inter_500Medium', color: colors.neutral[900], marginBottom: 2, lineHeight: 18 },
  productBrand: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500], marginBottom: 6 },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 },
  price: { fontSize: 15, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  originalPrice: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[400], textDecorationLine: 'line-through' },
  productMeta: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rating: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[600] },
  addToCartBtn: { backgroundColor: colors.primary[500], borderRadius: 8, paddingVertical: 8, alignItems: 'center' },
  addToCartText: { fontSize: 13, fontFamily: 'Inter_600SemiBold', color: colors.navy[500] },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
});
