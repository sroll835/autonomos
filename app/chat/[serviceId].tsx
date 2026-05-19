import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/presentation/stores/authStore';
import { Avatar } from '@/presentation/components/ui/Avatar';
import { colors } from '@/presentation/theme/colors';
import { ChatMessage } from '@/domain/entities/Service';
import apiClient from '@/infrastructure/api/client';
import { ENDPOINTS } from '@/infrastructure/api/endpoints';
import { getSocket, SOCKET_EVENTS } from '@/infrastructure/socket/socketClient';

export default function ChatScreen() {
  const { serviceId } = useLocalSearchParams<{ serviceId: string }>();
  const router = useRouter();
  const { user } = useAuthStore();
  const qc = useQueryClient();
  const listRef = useRef<FlatList>(null);
  const [text, setText] = useState('');

  const { data: messages, isLoading } = useQuery<ChatMessage[]>({
    queryKey: ['chat', serviceId],
    queryFn: async () => {
      const { data } = await apiClient.get(ENDPOINTS.SERVICES.MESSAGES(serviceId));
      return data;
    },
    refetchInterval: 10000,
  });

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    socket.emit('chat:join', { serviceId });
    socket.on(SOCKET_EVENTS.SERVICE_MESSAGE, (msg: ChatMessage) => {
      qc.setQueryData<ChatMessage[]>(['chat', serviceId], (prev) => [...(prev ?? []), msg]);
    });
    return () => {
      socket.emit('chat:leave', { serviceId });
      socket.off(SOCKET_EVENTS.SERVICE_MESSAGE);
    };
  }, [serviceId]);

  useEffect(() => {
    if (messages?.length) {
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await apiClient.post<ChatMessage>(ENDPOINTS.SERVICES.MESSAGES(serviceId), { content, type: 'TEXT' });
      return data;
    },
    onSuccess: (msg) => {
      qc.setQueryData<ChatMessage[]>(['chat', serviceId], (prev) => [...(prev ?? []), msg]);
      setText('');
    },
  });

  const handleSend = () => {
    if (!text.trim() || sendMutation.isPending) return;
    sendMutation.mutate(text.trim());
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chat del servicio</Text>
        <Text style={styles.serviceId}>#{serviceId?.slice(-6).toUpperCase()}</Text>
      </View>

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined} keyboardVerticalOffset={0}>
        {isLoading ? (
          <ActivityIndicator style={{ flex: 1 }} color={colors.primary[500]} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages ?? []}
            keyExtractor={(m) => m.id}
            contentContainerStyle={styles.messageList}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const isMe = item.senderId === user?.id;
              return (
                <View style={[styles.messageWrapper, isMe && styles.messageWrapperMe]}>
                  {!isMe && <Avatar uri={item.senderAvatar} name={item.senderName} size={28} />}
                  <View style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubbleThem]}>
                    {!isMe && <Text style={styles.senderName}>{item.senderName}</Text>}
                    <Text style={[styles.messageText, isMe && styles.messageTextMe]}>{item.content}</Text>
                    <Text style={[styles.messageTime, isMe && styles.messageTimeMe]}>
                      {new Date(item.createdAt).toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
              );
            }}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Text style={styles.emptyEmoji}>💬</Text>
                <Text style={styles.emptyText}>Inicia la conversación con el proveedor</Text>
              </View>
            }
          />
        )}

        <View style={styles.inputBar}>
          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Escribe un mensaje..."
            placeholderTextColor={colors.neutral[400]}
            multiline
            maxLength={500}
            onSubmitEditing={handleSend}
          />
          <TouchableOpacity
            style={[styles.sendBtn, (!text.trim() || sendMutation.isPending) && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!text.trim() || sendMutation.isPending}
          >
            {sendMutation.isPending ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Text style={styles.sendIcon}>➤</Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.neutral[50] },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16, backgroundColor: colors.white, borderBottomWidth: 0.5, borderBottomColor: colors.neutral[200] },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.neutral[100], alignItems: 'center', justifyContent: 'center' },
  backIcon: { fontSize: 18, color: colors.navy[500] },
  headerTitle: { flex: 1, fontSize: 16, fontFamily: 'Inter_600SemiBold', color: colors.neutral[900] },
  serviceId: { fontSize: 12, fontFamily: 'Inter_500Medium', color: colors.neutral[400] },
  messageList: { padding: 16, paddingBottom: 8 },
  messageWrapper: { flexDirection: 'row', alignItems: 'flex-end', gap: 8, marginBottom: 10 },
  messageWrapperMe: { flexDirection: 'row-reverse' },
  bubble: { maxWidth: '72%', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleThem: { backgroundColor: colors.white, borderBottomLeftRadius: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 1 },
  bubbleMe: { backgroundColor: colors.navy[500], borderBottomRightRadius: 4 },
  senderName: { fontSize: 11, fontFamily: 'Inter_600SemiBold', color: colors.primary[600], marginBottom: 3 },
  messageText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[900], lineHeight: 20 },
  messageTextMe: { color: colors.white },
  messageTime: { fontSize: 10, fontFamily: 'Inter_400Regular', color: colors.neutral[400], marginTop: 4, textAlign: 'right' },
  messageTimeMe: { color: 'rgba(255,255,255,0.6)' },
  empty: { alignItems: 'center', paddingTop: 60 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 14, fontFamily: 'Inter_400Regular', color: colors.neutral[500] },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 12, backgroundColor: colors.white, borderTopWidth: 0.5, borderTopColor: colors.neutral[200] },
  input: { flex: 1, borderWidth: 1.5, borderColor: colors.neutral[200], borderRadius: 20, paddingHorizontal: 16, paddingVertical: 10, fontSize: 15, fontFamily: 'Inter_400Regular', color: colors.neutral[900], maxHeight: 100 },
  sendBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.navy[500], alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: colors.neutral[300] },
  sendIcon: { fontSize: 16, color: colors.white },
});
