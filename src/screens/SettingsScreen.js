import React from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';

const SettingsScreen = () => {
  const { state, toggleBiometric, updateSettings, resetDemo, logout } = useAppData();

  const handleBiometricToggle = async (value) => {
    if (!value) {
      toggleBiometric(false);
      return;
    }
    const compatible = await LocalAuthentication.hasHardwareAsync();
    if (!compatible) {
      Alert.alert('Desteklenmiyor', 'Cihazınız biometrik doğrulamayı desteklemiyor.');
      return;
    }
    const enrollments = await LocalAuthentication.isEnrolledAsync();
    if (!enrollments) {
      Alert.alert('Kayıt bulunamadı', 'Önce cihaz ayarlarından biometrik kayıt ekleyin.');
      return;
    }
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Biometrik kilidi etkinleştir',
      disableDeviceFallback: true
    });
    if (result.success) {
      toggleBiometric(true);
    }
  };

  const handleReset = () => {
    Alert.alert('Sıfırlama', 'Demo verilerini sıfırlamak istediğinize emin misiniz?', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sıfırla',
        style: 'destructive',
        onPress: resetDemo
      }
    ]);
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Ayarlar</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Dil</Text>
        <View style={styles.row}>
          {['tr', 'en'].map((lang) => (
            <Pressable
              key={lang}
              style={[styles.pill, state.settings.language === lang && styles.pillActive]}
              onPress={() => updateSettings({ language: lang })}
            >
              <Text style={[styles.pillText, state.settings.language === lang && styles.pillTextActive]}>
                {lang === 'tr' ? 'Türkçe' : 'English'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Bildirimler</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Push bildirimleri</Text>
          <Switch
            value={state.settings.notifications}
            onValueChange={(value) => updateSettings({ notifications: value })}
            trackColor={{ true: colors.primary }}
          />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Güvenlik</Text>
        <View style={styles.switchRow}>
          <Text style={styles.label}>Biometrik kilit</Text>
          <Switch value={state.hasBiometricLock} onValueChange={handleBiometricToggle} trackColor={{ true: colors.primary }} />
        </View>
      </View>

      <Pressable style={styles.resetButton} onPress={handleReset}>
        <Text style={styles.resetText}>Demo Verilerini Sıfırla</Text>
      </Pressable>

      <Pressable style={styles.logoutButton} onPress={logout}>
        <Text style={styles.logoutText}>Çıkış Yap</Text>
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
  row: {
    flexDirection: 'row',
    gap: 12
  },
  pill: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  pillActive: {
    borderColor: colors.primary,
    backgroundColor: '#fbe3ec'
  },
  pillText: {
    textAlign: 'center',
    color: colors.text,
    fontWeight: '600'
  },
  pillTextActive: {
    color: colors.primary
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  label: {
    color: colors.text,
    fontWeight: '500'
  },
  resetButton: {
    backgroundColor: '#fbe3ec',
    borderRadius: 14,
    paddingVertical: 16,
    marginBottom: 16
  },
  resetText: {
    textAlign: 'center',
    color: colors.primary,
    fontWeight: '600'
  },
  logoutButton: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16
  },
  logoutText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600'
  }
});

export default SettingsScreen;
