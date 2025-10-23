import React from 'react';
import { Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';
import { useAppData } from '../context/AppContext';
import { colors } from '../theme/colors';
import { formatCurrency } from '../utils/format';

const CardsScreen = () => {
  const { state, toggleCardFreeze, toggleCardSetting } = useAppData();

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Kart Yönetimi</Text>
      <Text style={styles.subtitle}>Debet ve kredi kartlarınızı anlık olarak yönetin.</Text>

      {state.cards.map((card) => (
        <View key={card.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardLabel}>{card.label}</Text>
              <Text style={styles.cardMasked}>{card.masked}</Text>
            </View>
            <Pressable
              style={[styles.freezeButton, card.frozen && styles.freezeButtonActive]}
              onPress={() => toggleCardFreeze(card.id, !card.frozen)}
            >
              <Text style={[styles.freezeText, card.frozen && styles.freezeTextActive]}>
                {card.frozen ? 'Aktif Et' : 'Dondur'}
              </Text>
            </Pressable>
          </View>
          <Text style={styles.cardBalance}>Dönem harcaması: {formatCurrency(card.balance)}</Text>
          <Text style={styles.cardLimit}>Limit: {formatCurrency(card.limit)}</Text>

          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Temassız</Text>
            <Switch
              value={card.settings.contactless}
              onValueChange={(val) => toggleCardSetting(card.id, 'contactless', val)}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>E-Ticaret</Text>
            <Switch
              value={card.settings.ecommerce}
              onValueChange={(val) => toggleCardSetting(card.id, 'ecommerce', val)}
              trackColor={{ true: colors.primary }}
            />
          </View>
          <View style={styles.toggleRow}>
            <Text style={styles.toggleLabel}>Yurt dışı</Text>
            <Switch
              value={card.settings.international}
              onValueChange={(val) => toggleCardSetting(card.id, 'international', val)}
              trackColor={{ true: colors.primary }}
            />
          </View>
        </View>
      ))}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e4d7de'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text
  },
  cardMasked: {
    color: colors.muted,
    marginTop: 4
  },
  freezeButton: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary
  },
  freezeButtonActive: {
    backgroundColor: colors.primary
  },
  freezeText: {
    color: colors.primary,
    fontWeight: '600'
  },
  freezeTextActive: {
    color: '#fff'
  },
  cardBalance: {
    color: colors.text,
    fontWeight: '600',
    marginBottom: 4
  },
  cardLimit: {
    color: colors.muted,
    marginBottom: 16
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12
  },
  toggleLabel: {
    color: colors.text,
    fontWeight: '500'
  }
});

export default CardsScreen;
