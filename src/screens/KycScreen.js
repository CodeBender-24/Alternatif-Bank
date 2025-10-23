import React from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';

const KycScreen = () => {
  const { approveKyc } = useAppData();

  const handleApprove = () => {
    approveKyc();
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>KYC Onayı</Text>
        <Text style={styles.subtitle}>
          Demo doğrulama sürecini tamamlamak için kimlik onayınızı simüle edin. Bu işlem hesabınızı "Onaylı" olarak
          işaretler.
        </Text>
        <Image source={{ uri: 'https://dummyimage.com/320x180/930036/ffffff&text=KYC' }} style={styles.image} />
        <Pressable style={styles.button} onPress={handleApprove}>
          <Text style={styles.buttonText}>Profili Onayla</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12
  },
  subtitle: {
    color: colors.muted,
    marginBottom: 20,
    lineHeight: 20
  },
  image: {
    height: 180,
    borderRadius: 12,
    marginBottom: 24
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 14
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontWeight: '600',
    fontSize: 16
  }
});

export default KycScreen;
