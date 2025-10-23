import React from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import GradientCard from '../components/GradientCard';
import { colors } from '../theme/colors';
import { formatCurrency, formatDateTime } from '../utils/format';

const HomeScreen = () => {
  const { state, exportStatement } = useAppData();
  const primaryAccount = state.accounts[0];

  const handleExport = async (format) => {
    try {
      await exportStatement({ accountId: primaryAccount?.id, format });
      Alert.alert('Hazır', `${format.toUpperCase()} hesap özeti oluşturuldu.`);
    } catch (error) {
      Alert.alert('Hata', 'Ekstre hazırlanırken sorun oluştu.');
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.greeting}>Merhaba {state.user?.fullName?.split(' ')[0] || 'Alternatif'}</Text>
      <Text style={styles.iban}>IBAN: {primaryAccount?.iban}</Text>

      <GradientCard>
        <View style={styles.balanceHeader}>
          <Text style={styles.balanceLabel}>Toplam Bakiye</Text>
          <Text style={styles.balance}>{formatCurrency(primaryAccount?.balance || 0)}</Text>
        </View>
        <View style={styles.accountRow}>
          {state.accounts.map((account) => (
            <View key={account.id} style={styles.accountTile}>
              <Text style={styles.accountName}>{account.name}</Text>
              <Text style={styles.accountAmount}>{formatCurrency(account.balance)}</Text>
              <Text style={styles.accountIban}>{account.iban}</Text>
            </View>
          ))}
        </View>
        <View style={styles.exportRow}>
          <Pressable style={styles.exportButton} onPress={() => handleExport('pdf')}>
            <Text style={styles.exportText}>PDF Dışa Aktar</Text>
          </Pressable>
          <Pressable style={styles.exportButton} onPress={() => handleExport('csv')}>
            <Text style={styles.exportText}>CSV Dışa Aktar</Text>
          </Pressable>
        </View>
      </GradientCard>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Son İşlemler</Text>
        <FlatList
          data={state.transactions.slice(0, 6)}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.transactionRow}>
              <View>
                <Text style={styles.transactionDesc}>{item.description}</Text>
                <Text style={styles.transactionMeta}>{item.counterparty}</Text>
              </View>
              <View style={styles.transactionAmountWrap}>
                <Text style={[styles.transactionAmount, item.type === 'incoming' ? styles.incoming : styles.outgoing]}>
                  {`${item.type === 'incoming' ? '+' : '-'}${formatCurrency(item.amount)}`}
                </Text>
                <Text style={styles.transactionMeta}>{formatDateTime(item.timestamp)}</Text>
              </View>
            </View>
          )}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        {state.notifications.slice(0, 3).map((item) => (
          <View key={item.id} style={styles.notification}>
            <Text style={styles.notificationTitle}>{item.title}</Text>
            <Text style={styles.notificationBody}>{item.body}</Text>
            <Text style={styles.transactionMeta}>{formatDateTime(item.timestamp)}</Text>
          </View>
        ))}
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
  greeting: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text
  },
  iban: {
    color: colors.muted,
    marginBottom: 16
  },
  balanceHeader: {
    marginBottom: 16
  },
  balanceLabel: {
    color: '#fff',
    opacity: 0.8
  },
  balance: {
    fontSize: 32,
    fontWeight: '700',
    color: '#fff'
  },
  accountRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16
  },
  accountTile: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 12,
    padding: 12
  },
  accountName: {
    color: '#fff',
    fontWeight: '600',
    marginBottom: 6
  },
  accountAmount: {
    color: '#fff',
    fontWeight: '700',
    marginBottom: 4
  },
  accountIban: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 12
  },
  exportRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12
  },
  exportButton: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    borderRadius: 12
  },
  exportText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600'
  },
  section: {
    marginTop: 24
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: colors.text
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5d4da'
  },
  transactionDesc: {
    fontWeight: '600',
    color: colors.text
  },
  transactionMeta: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 4
  },
  transactionAmountWrap: {
    alignItems: 'flex-end'
  },
  transactionAmount: {
    fontWeight: '700'
  },
  incoming: {
    color: colors.success
  },
  outgoing: {
    color: colors.danger
  },
  notification: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    marginBottom: 12
  },
  notificationTitle: {
    fontWeight: '600',
    color: colors.text,
    marginBottom: 4
  },
  notificationBody: {
    color: colors.muted,
    marginBottom: 8
  }
});

export default HomeScreen;
