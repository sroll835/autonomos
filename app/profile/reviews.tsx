import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { TouchableOpacity } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { Card } from '@/presentation/components/ui/Card';
import { colors } from '@/presentation/theme/colors';
import { formatDate } from '@/shared/utils/formatters';
import apiClient from '@/infrastructure/api/client';

interface Review {
  id: string;
  providerId: string;
  providerName: string;
  providerAvatar?: string;
  serviceType: string;
  rating: number;
  comment: string;
  createdAt: string;
}

function Stars({ rating }: { rating: number }) {
  return (
    <View style={styles.stars}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Text key={i} style={styles.star}>{i <= rating ? '⭐' : '☆'}</Text>
      ))}
    </View>
  );
}

export default function ReviewsScreen() {
  const router = useRouter();

  const { data: reviews, isLoading } = useQuery<Review[]>({
    queryKey: ['my-reviews'],
    queryFn: async () => {
      const { data } = await apiClient.get('/users/reviews');
      return data;
    },
  });

  const avgRating = reviews?.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mis reseñas</Text>
        <View style={{ width: 36 }} />
      </View>

      {avgRating && (
        <View style={styles.summaryCard}>
          <Text style={styles.avgRating}>{avgRating}</Text>
          <Stars rating={Math.round(parseFloat(avgRating))} />
          <Text style={styles.reviewCount}>{reviews?.length} reseñas escritas</Text>
        </View>
      )}

      {isLoading ? (
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary[500]} />
      ) : (
        <FlatList
          data={reviews ?? []}
          keyExtractor={(r) => r.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Card style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Avatar uri={item.providerAvatar} name={item.providerName} size={40} />
                <View style={styles.reviewMeta}>
                  <Text style={styles.providerName}>{item.providerName}</Text>
                  <Text style={styles.serviceType}>{item.serviceType}</Text>
                </View>
                <Text style={styles.reviewDate}>{formatDate(item.createdAt)}</Text>
              </View>
              <Stars rating={item.rating} />
              <Text style={styles.comment}>{item.comment}</Text>
            </Card>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>⭐</Text>
              <Text style={styles.emptyTitle}>Sin reseñas aún</Text>
              <Text style={styles.emptyText}>Califica los servicios que hayas recibido para ayudar a la comunidad</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  title: { flex: 1, fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  summaryCard: { alignItems: 'center', backgroundColor: colors.white, margin: 16, padding: 20, borderRadius: 16, borderWidth: 1, borderColor: colors.neutral[200] },
  avgRating: { fontSize: 48, fontFamily: 'Inter_700Bold', color: colors.navy[500] },
  stars: { flexDirection: 'row', gap: 2, marginVertical: 6 },
  star: { fontSize: 18 },
  reviewCount: { fontSize: 13, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  list: { paddingHorizontal: 16, paddingBottom: 40, gap: 10 },
  reviewCard: { padding: 14 },
  reviewHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  reviewMeta: { flex: 1 },
  providerName: { fontSize: 14, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  serviceType: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  reviewDate: { fontSize: 12, fontFamily: 'Inter_400Regular', color: colors.neutral[400] },
  comment: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[700], marginTop: 8, lineHeight: 20 },
  empty: { alignItems: 'center', paddingTop: 60, paddingHorizontal: 32 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900], marginBottom: 6 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500], textAlign: 'center', lineHeight: 20 },
});
