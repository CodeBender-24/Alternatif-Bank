import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';

const PaymentsScreen = () => {
  const { state, payBill } = useAppData();
  const [selection, setSelection] = useState(state.billers[0]);
  const [accountNumber, setAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [autopay, setAutopay] = useState(false);

  const handlePay = () => {
    const result = payBill({
      billerId: selection.id,
      accountNumber,
      amount,
      autopay
    });
    if (!result.success) {
      Alert.alert('Hata', result.message);
      return;
    }
    Alert.alert('Başarılı', `${selection.name} ödemesi yapıldı.`);
    setAccountNumber('');
    setAmount('');
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Fatura Ödeme</Text>
      <Text style={styles.subtitle}>Elektrik, su, GSM gibi temel kurumlara ödeme yapın.</Text>

      <View style={styles.billerRow}>
        {state.billers.map((biller) => (
          <Pressable
            key={biller.id}
            style={[styles.billerCard, biller.id === selection.id && styles.billerCardActive]}
            onPress={() => {
              setSelection(biller);
              setAutopay(biller.autopay);
            }}
          >
            <Text style={[styles.billerName, biller.id === selection.id && styles.billerNameActive]}>{biller.name}</Text>
            <Text style={styles.billerMeta}>{biller.autopay ? 'Otomatik ödeme açık' : 'Manuel ödeme'}</Text>
          </Pressable>
        ))}
      </View>

      <Text style={styles.label}>{selection.accountNumberLabel}</Text>
      <TextInput
        style={styles.input}
        placeholder="Numara"
        placeholderTextColor={colors.muted}
        value={accountNumber}
        onChangeText={setAccountNumber}
      />

      <Text style={styles.label}>Tutar</Text>
      <TextInput
        style={styles.input}
        placeholder="0,00"
        placeholderTextColor={colors.muted}
        keyboardType="decimal-pad"
        value={amount}
        onChangeText={setAmount}
      />

      <View style={styles.switchRow}>
        <Text style={styles.label}>Otomatik ödeme talimatı</Text>
        <Switch value={autopay} onValueChange={setAutopay} trackColor={{ true: colors.primary }} />
      </View>

      <Pressable style={styles.button} onPress={handlePay}>
        <Text style={styles.buttonText}>Ödemeyi Tamamla</Text>
      </Pressable>
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
    paddingBottom: 40
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 16
  },
  billerRow: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16
  },
  billerCard: {
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  billerCardActive: {
    borderColor: colors.primary,
    backgroundColor: '#fbe3ec'
  },
  billerName: {
    fontWeight: '600',
    color: colors.text
  },
  billerNameActive: {
    color: colors.primary
  },
  billerMeta: {
    color: colors.muted,
    marginTop: 4
  },
  label: {
    fontSize: 14,
    color: colors.muted,
    marginBottom: 6
  },
  input: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e4d7de',
    color: colors.text,
    marginBottom: 16
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default PaymentsScreen;
