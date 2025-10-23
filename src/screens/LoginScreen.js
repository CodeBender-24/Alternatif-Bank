import React, { useEffect, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';

const LoginScreen = ({ navigation }) => {
  const { state, requestLoginOtp, verifyLoginOtp } = useAppData();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [biometricAttempted, setBiometricAttempted] = useState(false);

  useEffect(() => {
    const tryBiometric = async () => {
      if (!state.hasBiometricLock || !state.user || biometricAttempted) {
        return;
      }
      const identifierValue = state.user.phone || state.user.email;
      if (!identifierValue) {
        return;
      }
      setIdentifier(identifierValue);
      requestLoginOtp(identifierValue);
      setOtpRequested(true);
      const compatible = await LocalAuthentication.hasHardwareAsync();
      if (!compatible) {
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Biometrik doğrulama',
        disableDeviceFallback: true
      });
      if (result.success) {
        verifyLoginOtp('123456');
      }
      setBiometricAttempted(true);
    };

    tryBiometric();
  }, [state.hasBiometricLock, state.user, requestLoginOtp, verifyLoginOtp, biometricAttempted]);

  const handleRequestOtp = () => {
    const ok = requestLoginOtp(identifier);
    if (!ok) {
      Alert.alert('Bulunamadı', 'Kayıtlı telefon veya e-posta adresini girin.');
      return;
    }
    setOtpRequested(true);
    Alert.alert('OTP Gönderildi', 'Giriş için demo OTP kodu 123456 olarak gönderildi.');
  };

  const handleVerify = () => {
    const success = verifyLoginOtp(otp.trim());
    if (!success) {
      Alert.alert('Doğrulama Başarısız', 'OTP kodu hatalı.');
    }
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.brand}>Alternatif Bank</Text>
        <Text style={styles.title}>Tekrar hoş geldiniz</Text>

        <Text style={styles.label}>Telefon veya E-posta</Text>
        <TextInput
          style={styles.input}
          placeholder="Kayıtlı iletişim bilginiz"
          placeholderTextColor={colors.muted}
          value={identifier}
          onChangeText={setIdentifier}
        />
        <Pressable style={styles.button} onPress={handleRequestOtp}>
          <Text style={styles.buttonText}>OTP Gönder</Text>
        </Pressable>

        {otpRequested && (
          <View style={styles.otpArea}>
            <Text style={styles.label}>OTP Kodunuz</Text>
            <TextInput
              style={styles.input}
              placeholder="123456"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              value={otp}
              onChangeText={setOtp}
              maxLength={6}
            />
            <Pressable style={styles.button} onPress={handleVerify}>
              <Text style={styles.buttonText}>Giriş Yap</Text>
            </Pressable>
          </View>
        )}

        {!state.pendingUser && (
          <Text style={styles.switch} onPress={() => navigation.navigate('Onboarding')}>
            Yeni kullanıcı mısınız? Hemen kaydolun
          </Text>
        )}
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
  brand: {
    fontSize: 20,
    color: colors.primary,
    fontWeight: '700',
    marginBottom: 8
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 24
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
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14,
    marginBottom: 16
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  },
  otpArea: {
    marginTop: 16
  },
  switch: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600',
    marginTop: 24
  }
});

export default LoginScreen;
