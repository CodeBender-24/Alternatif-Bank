import React from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { View, StyleSheet } from 'react-native';
import { gradients } from '../theme/colors';

const GradientCard = ({ children, variant = 'primary', style }) => {
  return (
    <LinearGradient colors={gradients[variant] || gradients.primary} style={[styles.card, style]}>
      <View style={styles.inner}>{children}</View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 1
  },
  inner: {
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'transparent'
  }
});

export default GradientCard;
