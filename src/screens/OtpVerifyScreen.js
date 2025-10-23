import React, { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';

const OtpVerifyScreen = ({ navigation, route }) => {
  const { verifyOtp } = useAppData();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    setLoading(true);
    const ok = verifyOtp(code.trim());
    setLoading(false);
    if (!ok) {
      Alert.alert('Doğrulama Başarısız', 'OTP kodunu kontrol edin (123456).');
      return;
    }
    navigation.replace('Kyc');
  };

  return (
    <KeyboardAvoidingView style={styles.safe} behavior={Platform.select({ ios: 'padding', android: undefined })}>
      <View style={styles.container}>
        <Text style={styles.title}>OTP Doğrulaması</Text>
        <Text style={styles.subtitle}>Kayıt işlemini tamamlamak için 123456 kodunu girin.</Text>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          maxLength={6}
          keyboardType="number-pad"
          placeholder="123456"
          placeholderTextColor={colors.muted}
        />
        <Pressable style={[styles.button, loading && styles.buttonDisabled]} onPress={handleVerify} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Doğrulanıyor...' : 'Doğrula'}</Text>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center'
  },
  container: {
    padding: 24
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 16
  },
  input: {
    borderRadius: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e4d7de',
    color: colors.text,
    letterSpacing: 6,
    textAlign: 'center',
    fontSize: 20,
    marginBottom: 24
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14
  },
  buttonDisabled: {
    opacity: 0.6
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default OtpVerifyScreen;
