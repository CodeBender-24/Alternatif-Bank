import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View
} from 'react-native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';

const TransferScreen = () => {
  const { state, transferByIban, applyQrPayload } = useAppData();
  const [form, setForm] = useState({
    fromAccountId: state.accounts[0]?.id,
    iban: '',
    amount: '',
    description: 'Para transferi',
    fast: true,
    recipientName: ''
  });
  const [qrPayload, setQrPayload] = useState('');

  useEffect(() => {
    const parsed = applyQrPayload(qrPayload);
    if (parsed) {
      setForm((prev) => ({
        ...prev,
        iban: parsed.iban || prev.iban,
        amount: parsed.amount?.toString() || prev.amount,
        recipientName: parsed.recipientName || prev.recipientName
      }));
    }
  }, [qrPayload, applyQrPayload]);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const result = transferByIban(form);
    if (!result.success) {
      Alert.alert('İşlem Başarısız', result.message);
      return;
    }
    Alert.alert('Gönderildi', 'Transfer talimatınız oluşturuldu.');
    setForm((prev) => ({ ...prev, amount: '', description: 'Para transferi', iban: '', recipientName: '' }));
    setQrPayload('');
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>IBAN ile Transfer</Text>
        <Text style={styles.subtitle}>FAST seçeneği ile anlık gönderim.</Text>

        <Text style={styles.label}>Kaynak Hesap</Text>
        <View style={styles.accountPicker}>
          {state.accounts.map((account) => (
            <Pressable
              key={account.id}
              style={[styles.accountPill, form.fromAccountId === account.id && styles.accountPillActive]}
              onPress={() => updateField('fromAccountId', account.id)}
            >
              <Text
                style={[styles.accountPillText, form.fromAccountId === account.id && styles.accountPillTextActive]}
              >
                {account.name}
              </Text>
              <Text style={styles.accountBalance}>{formatCurrency(account.balance)}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.label}>Alıcı IBAN</Text>
        <TextInput
          style={styles.input}
          placeholder="TR.."
          placeholderTextColor={colors.muted}
          autoCapitalize="characters"
          value={form.iban}
          onChangeText={(text) => updateField('iban', text)}
        />

        <Text style={styles.label}>Alıcı Adı</Text>
        <TextInput
          style={styles.input}
          placeholder="Alıcı adı"
          placeholderTextColor={colors.muted}
          value={form.recipientName}
          onChangeText={(text) => updateField('recipientName', text)}
        />

        <Text style={styles.label}>Tutar</Text>
        <TextInput
          style={styles.input}
          placeholder="0,00"
          placeholderTextColor={colors.muted}
          keyboardType="decimal-pad"
          value={form.amount}
          onChangeText={(text) => updateField('amount', text)}
        />

        <Text style={styles.label}>Açıklama</Text>
        <TextInput
          style={styles.input}
          placeholder="Para transferi"
          placeholderTextColor={colors.muted}
          value={form.description}
          onChangeText={(text) => updateField('description', text)}
        />

        <View style={styles.switchRow}>
          <Text style={styles.label}>FAST (Anlık)</Text>
          <Switch value={form.fast} onValueChange={(value) => updateField('fast', value)} trackColor={{ true: colors.primary }} />
        </View>

        <Text style={styles.label}>TR Karekod / QR payload</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="JSON veya IBAN|Tutar|Ad"
          placeholderTextColor={colors.muted}
          multiline
          numberOfLines={3}
          value={qrPayload}
          onChangeText={setQrPayload}
        />

        <Pressable style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Gönder</Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: {
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
  multiline: {
    minHeight: 80,
    textAlignVertical: 'top'
  },
  accountPicker: {
    flexDirection: 'column',
    gap: 12,
    marginBottom: 16
  },
  accountPill: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  accountPillActive: {
    borderColor: colors.primary,
    backgroundColor: '#fbe3ec'
  },
  accountPillText: {
    color: colors.text,
    fontWeight: '600'
  },
  accountPillTextActive: {
    color: colors.primary
  },
  accountBalance: {
    color: colors.muted,
    marginTop: 4
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16
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

export default TransferScreen;
