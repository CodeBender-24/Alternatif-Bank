import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';

const OnboardingScreen = ({ navigation }) => {
  const { issueOtp } = useAppData();
  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.fullName.trim() || !(form.phone.trim() || form.email.trim())) {
      Alert.alert('Eksik bilgi', 'İsim ve iletişim alanlarından en az biri zorunludur.');
      return;
    }
    try {
      setLoading(true);
      await issueOtp(form);
      Alert.alert('OTP Gönderildi', 'Doğrulama kodu 123456 olarak gönderildi.');
      navigation.navigate('OtpVerify', { mode: 'register' });
    } catch (error) {
      Alert.alert('Hata', 'OTP gönderilirken sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.brand}>Alternatif Bank</Text>
          <Text style={styles.title}>Hoş geldiniz</Text>
          <Text style={styles.subtitle}>
            Telefon veya e-posta ile demo hesabınızı açın, 123456 mock OTP ile doğrulayın.
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Ad Soyad</Text>
          <TextInput
            style={styles.input}
            placeholder="Adınızı girin"
            placeholderTextColor={colors.muted}
            value={form.fullName}
            onChangeText={(text) => updateField('fullName', text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Telefon</Text>
          <TextInput
            style={styles.input}
            placeholder="5XX XXX XX XX"
            placeholderTextColor={colors.muted}
            keyboardType="phone-pad"
            value={form.phone}
            onChangeText={(text) => updateField('phone', text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>E-posta</Text>
          <TextInput
            style={styles.input}
            placeholder="ornek@mail.com"
            placeholderTextColor={colors.muted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={form.email}
            onChangeText={(text) => updateField('email', text)}
          />
        </View>

        <Text style={styles.helper}>
          OTP kodu demo amaçlı olarak daima <Text style={styles.strong}>123456</Text> gelir.
        </Text>

        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleSubmit} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Gönderiliyor...' : 'OTP Gönder'}</Text>
        </Pressable>

        <Text style={styles.switch} onPress={() => navigation.navigate('Login')}>
          Zaten hesabınız var mı? Giriş yapın
        </Text>
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
    padding: 24
  },
  header: {
    marginBottom: 32
  },
  brand: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700'
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: colors.text,
    marginTop: 8
  },
  subtitle: {
    marginTop: 8,
    color: colors.muted,
    lineHeight: 20
  },
  field: {
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
    color: colors.text
  },
  helper: {
    color: colors.muted,
    marginBottom: 16
  },
  strong: {
    color: colors.primary,
    fontWeight: '700'
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    marginBottom: 16
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16
  },
  buttonDisabled: {
    opacity: 0.6
  },
  switch: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600'
  }
});

export default OnboardingScreen;
