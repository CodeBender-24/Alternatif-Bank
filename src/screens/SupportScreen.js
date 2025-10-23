import React, { useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatDateTime } from '../utils/format';

const SupportScreen = () => {
  const { state, sendSupportMessage, markNotificationsRead } = useAppData();
  const [message, setMessage] = useState('');

  useFocusEffect(
    React.useCallback(() => {
      markNotificationsRead();
    }, [markNotificationsRead])
  );

  const handleSend = () => {
    if (!message.trim()) {
      return;
    }
    sendSupportMessage(message);
    setMessage('');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Destek ve Bildirimler</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son Bildirimler</Text>
        {state.notifications.map((item) => (
          <View key={item.id} style={styles.notification}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.notificationMeta}>{formatDateTime(item.timestamp)}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sıkça Sorulan Sorular</Text>
        {state.faqs.map((faq) => (
          <View key={faq.id} style={styles.faq}>
            <Text style={styles.faqQuestion}>{faq.question}</Text>
            <Text style={styles.faqAnswer}>{faq.answer}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Canlı Destek</Text>
        <FlatList
          data={state.supportChat}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.messageBubble, item.author === 'user' ? styles.userBubble : styles.agentBubble]}>
              <Text style={styles.messageText}>{item.message}</Text>
              <Text style={styles.messageMeta}>{formatDateTime(item.timestamp)}</Text>
            </View>
          )}
          scrollEnabled={false}
        />
        <View style={styles.messageInputRow}>
          <TextInput
            style={styles.messageInput}
            placeholder="Mesajınızı yazın"
            placeholderTextColor={colors.muted}
            value={message}
            onChangeText={setMessage}
          />
          <Pressable style={styles.sendButton} onPress={handleSend}>
            <Text style={styles.sendText}>Gönder</Text>
          </Pressable>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background
  },
  container: {
    padding: 16,
    paddingBottom: 32
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16
  },
  section: {
    marginBottom: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text
  },
  notification: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  notificationTitle: {
    fontWeight: '600',
    color: colors.text
  },
  notificationBody: {
    color: colors.muted,
    marginTop: 4
  },
  notificationMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 6
  },
  faq: {
    backgroundColor: colors.surface,
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  faqQuestion: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 6
  },
  faqAnswer: {
    color: colors.muted
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
    maxWidth: '80%'
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#fbe3ec'
  },
  agentBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  messageText: {
    color: colors.text
  },
  messageMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 6
  },
  messageInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginTop: 8
  },
  messageInput: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e4d7de',
    color: colors.text
  },
  sendButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16
  },
  sendText: {
    color: '#fff',
    fontWeight: '600'
  }
});

export default SupportScreen;
