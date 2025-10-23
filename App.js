import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as LocalAuthentication from 'expo-local-authentication';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar as ExpoStatusBar } from 'expo-status-bar';

const OTP_CODE = '123456';

const defaultState = {
  user: {
    name: 'Demet Yılmaz',
    phone: '+90 555 000 0000',
    email: 'demet@alternatifbank.com',
    biometricEnabled: false,
    kycApproved: true,
    language: 'tr',
    theme: 'system',
    notifications: {
      push: true,
      email: false,
      sms: true,
    },
  },
  accounts: [
    {
      id: 'primary',
      iban: 'TR76 0006 4000 0011 1111 1111 11',
      title: 'Ana Hesap',
      balance: 15420.34,
      currency: 'TRY',
      recentTransactions: [
        { id: 't1', label: 'Market alışverişi', amount: -356.4, date: '2024-05-12' },
        { id: 't2', label: 'Maaş ödemesi', amount: 18500, date: '2024-05-10' },
        { id: 't3', label: 'Elektrik faturası', amount: -420.75, date: '2024-05-05' },
      ],
    },
    {
      id: 'savings',
      iban: 'TR18 0006 2000 0099 9999 9999 99',
      title: 'Biriktirme Hesabı',
      balance: 8200,
      currency: 'TRY',
      recentTransactions: [
        { id: 't4', label: 'Faiz getirisi', amount: 82.45, date: '2024-05-01' },
        { id: 't5', label: 'Transfer', amount: 1500, date: '2024-04-28' },
      ],
    },
  ],
  cards: [
    {
      id: 'debit',
      type: 'Debit',
      holder: 'Demet Yılmaz',
      masked: '5222 43•• ••52 9331',
      spend: 2350.7,
      limit: 10000,
      frozen: false,
      controls: {
        contactless: true,
        ecommerce: true,
        international: false,
      },
    },
    {
      id: 'credit',
      type: 'Credit',
      holder: 'Demet Yılmaz',
      masked: '4234 88•• ••19 0042',
      spend: 5750.23,
      limit: 20000,
      frozen: false,
      controls: {
        contactless: true,
        ecommerce: true,
        international: true,
      },
    },
  ],
  payments: [
    {
      id: 'electricity',
      name: 'Elektrik',
      reference: 'CK Enerji 2033944',
      amount: 420.75,
      autopay: true,
    },
    {
      id: 'water',
      name: 'Su',
      reference: 'İSKİ 889345',
      amount: 185.2,
      autopay: false,
    },
    {
      id: 'gsm',
      name: 'GSM',
      reference: 'Alternatif GSM 5550000000',
      amount: 240,
      autopay: true,
    },
  ],
  notifications: [
    { id: 'n1', title: 'FAST transferiniz anında tamamlandı.', timestamp: '2 saat önce' },
    { id: 'n2', title: 'Karekod ile 250,00 ₺ ödeme yaptınız.', timestamp: '1 gün önce' },
    { id: 'n3', title: 'Yeni kampanya: Alternatif Kart ile %5 iade.', timestamp: '3 gün önce' },
  ],
  faqs: [
    { id: 'f1', q: 'FAST transfer limitim nedir?', a: 'Günlük 50.000 ₺ limitiniz bulunmaktadır.' },
    { id: 'f2', q: 'Karekod ödemesi nasıl yapılır?', a: 'QR kodu tarayın veya karekod metnini yapıştırın, ardından tutarı onaylayın.' },
    { id: 'f3', q: 'Kartımı nasıl dondururum?', a: 'Kart yönetimi ekranından Anında Dondur düğmesini kullanın.' },
  ],
  supportChat: [
    { id: 'c1', from: 'agent', message: 'Merhaba, size nasıl yardımcı olabilirim?' },
    { id: 'c2', from: 'user', message: 'Kredi kartı limitimi nasıl artırabilirim?' },
    { id: 'c3', from: 'agent', message: 'Mobil uygulamadaki kart ayarlarından limit artışı talep edebilirsiniz.' },
  ],
};

const translations = {
  tr: {
    welcome: 'Alternatif Bank Mobil',
    phoneOrEmail: 'Telefon veya E-posta',
    password: 'Şifre',
    continue: 'Devam et',
    register: 'Kaydol',
    login: 'Giriş Yap',
    otpPrompt: 'SMS doğrulama kodunu girin',
    verify: 'Doğrula',
    wrongOtp: 'Kod hatalı. Lütfen 123456 girin.',
    enableBiometric: 'Biyometrik kilit',
    kycTitle: 'KYC Onayı',
    approve: 'Onayla',
    approved: 'Onaylandı',
    dashboard: 'Kontrol Paneli',
    accounts: 'Hesaplar',
    recentTransactions: 'Son işlemler',
    exportStatement: 'Ekstre İndir',
    transfer: 'Para Transferi',
    iban: 'Alıcı IBAN',
    amount: 'Tutar',
    description: 'Açıklama',
    instant: 'FAST anında gönder',
    karekod: 'Karekod (IBAN|Tutar)',
    pasteKarekod: 'Karekod Uygula',
    submit: 'Gönder',
    payments: 'Ödemeler',
    autopay: 'Otomatik Öde',
    cards: 'Kartlar',
    freeze: 'Anında Dondur',
    unfreeze: 'Kartı Aç',
    notifications: 'Bildirimler',
    support: 'Destek',
    faq: 'SSS',
    settings: 'Ayarlar',
    language: 'Dil',
    theme: 'Tema',
    light: 'Açık',
    dark: 'Koyu',
    system: 'Sistem',
    biometric: 'Biyometrik Kilit',
    resetDemo: 'Demoyu Sıfırla',
    shareSuccess: 'Ekstre indirildi',
    transferSuccess: 'Transfer talimatı alındı.',
    invalidIban: 'Geçersiz IBAN formatı',
    sameIban: 'Kendi hesabınıza transfer yapamazsınız.',
    autopayEnabled: 'Otomatik ödeme güncellendi.',
    chatPlaceholder: 'Sorunuzu yazın...',
    send: 'Gönder',
  },
  en: {
    welcome: 'Alternatif Bank Mobile',
    phoneOrEmail: 'Phone or Email',
    password: 'Password',
    continue: 'Continue',
    register: 'Sign up',
    login: 'Sign in',
    otpPrompt: 'Enter the SMS code',
    verify: 'Verify',
    wrongOtp: 'Incorrect code. Use 123456.',
    enableBiometric: 'Biometric Lock',
    kycTitle: 'KYC Approval',
    approve: 'Approve',
    approved: 'Approved',
    dashboard: 'Dashboard',
    accounts: 'Accounts',
    recentTransactions: 'Recent transactions',
    exportStatement: 'Export statement',
    transfer: 'Money Transfer',
    iban: 'Recipient IBAN',
    amount: 'Amount',
    description: 'Description',
    instant: 'FAST instant',
    karekod: 'QR (IBAN|Amount)',
    pasteKarekod: 'Apply QR',
    submit: 'Submit',
    payments: 'Payments',
    autopay: 'Autopay',
    cards: 'Cards',
    freeze: 'Freeze',
    unfreeze: 'Unfreeze',
    notifications: 'Notifications',
    support: 'Support',
    faq: 'FAQ',
    settings: 'Settings',
    language: 'Language',
    theme: 'Theme',
    light: 'Light',
    dark: 'Dark',
    system: 'System',
    biometric: 'Biometric lock',
    resetDemo: 'Reset demo',
    shareSuccess: 'Statement exported',
    transferSuccess: 'Transfer instruction received.',
    invalidIban: 'IBAN format invalid',
    sameIban: 'Cannot transfer to the same account.',
    autopayEnabled: 'Autopay updated.',
    chatPlaceholder: 'Type your question...',
    send: 'Send',
  },
};

const themes = {
  light: {
    background: '#f6f6f8',
    surface: '#ffffff',
    textPrimary: '#1a1a1f',
    textSecondary: '#5a5a6c',
    primary: '#930036',
    highlight: '#ffd5e5',
    stroke: '#e2e2ea',
  },
  dark: {
    background: '#0f0f16',
    surface: '#1c1c2a',
    textPrimary: '#ffffff',
    textSecondary: '#c1c1d4',
    primary: '#ff4b8b',
    highlight: '#30101f',
    stroke: '#2f2f45',
  },
};

const ibanRegex = /^TR\d{2}(?:\s?\d{4}){5}$/i;

export default function App() {
  const systemScheme = useColorScheme();
  const [authStage, setAuthStage] = useState('login');
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [otpCode, setOtpCode] = useState('');
  const [state, setState] = useState(defaultState);
  const [transferForm, setTransferForm] = useState({ iban: '', amount: '', description: '', fast: true, karekod: '' });
  const [chatInput, setChatInput] = useState('');
  const [biometricSupported, setBiometricSupported] = useState(false);

  useEffect(() => {
    LocalAuthentication.hasHardwareAsync().then(setBiometricSupported).catch(() => setBiometricSupported(false));
  }, []);

  const themeKey = state.user.theme === 'system' ? systemScheme ?? 'light' : state.user.theme;
  const theme = themes[themeKey];
  const t = (key) => translations[state.user.language][key] ?? key;

  const handleLogin = () => {
    if (!form.identifier) {
      Alert.alert('Alternatif Bank', t('phoneOrEmail'));
      return;
    }
    setAuthStage('verify');
  };

  const handleRegister = () => {
    if (!form.identifier) {
      Alert.alert('Alternatif Bank', t('phoneOrEmail'));
      return;
    }
    setState((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        name: 'Yeni Kullanıcı',
        email: form.identifier.includes('@') ? form.identifier : prev.user.email,
        phone: form.identifier.includes('@') ? prev.user.phone : form.identifier,
      },
    }));
    setAuthStage('verify');
  };

  const handleVerify = () => {
    if (otpCode !== OTP_CODE) {
      Alert.alert('Alternatif Bank', t('wrongOtp'));
      return;
    }
    setAuthStage('dashboard');
    setOtpCode('');
  };

  const handleBiometricToggle = async (value) => {
    if (value && biometricSupported) {
      const result = await LocalAuthentication.authenticateAsync({ promptMessage: 'Alternatif Bank' });
      if (!result.success) {
        return;
      }
    }
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, biometricEnabled: value && biometricSupported },
    }));
  };

  const approveKyc = () => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, kycApproved: true },
    }));
  };

  const handleTransfer = () => {
    const { iban, amount, description, fast } = transferForm;
    if (!ibanRegex.test(iban.trim())) {
      Alert.alert('Alternatif Bank', t('invalidIban'));
      return;
    }
    if (state.accounts.some((acc) => acc.iban.replace(/\s/g, '') === iban.replace(/\s/g, ''))) {
      Alert.alert('Alternatif Bank', t('sameIban'));
      return;
    }
    if (!amount || Number.isNaN(Number(amount))) {
      Alert.alert('Alternatif Bank', t('amount'));
      return;
    }
    const transaction = {
      id: `tx-${Date.now()}`,
      label: description || 'Transfer',
      amount: -Math.abs(parseFloat(amount)),
      date: new Date().toISOString().slice(0, 10),
      fast,
      iban,
    };
    setState((prev) => ({
      ...prev,
      accounts: prev.accounts.map((acc, idx) => (idx === 0 ? {
        ...acc,
        balance: acc.balance + transaction.amount,
        recentTransactions: [transaction, ...acc.recentTransactions].slice(0, 6),
      } : acc)),
      notifications: [
        {
          id: `n-${Date.now()}`,
          title: `${iban.slice(0, 8)}... için ${Math.abs(transaction.amount).toFixed(2)} ₺ transfer talimatı`,
          timestamp: 'Şimdi',
        },
        ...prev.notifications,
      ],
    }));
    Alert.alert('Alternatif Bank', t('transferSuccess'));
    setTransferForm({ iban: '', amount: '', description: '', fast: fast, karekod: '' });
  };

  const handleKarekod = () => {
    if (!transferForm.karekod) return;
    const parts = transferForm.karekod.split('|');
    if (parts.length >= 2) {
      setTransferForm((prev) => ({
        ...prev,
        iban: parts[0].trim(),
        amount: parts[1].trim(),
      }));
    }
  };

  const toggleAutopay = (paymentId, value) => {
    setState((prev) => ({
      ...prev,
      payments: prev.payments.map((p) => (p.id === paymentId ? { ...p, autopay: value } : p)),
    }));
    Alert.alert('Alternatif Bank', t('autopayEnabled'));
  };

  const toggleCardFreeze = (cardId) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((card) => (card.id === cardId ? { ...card, frozen: !card.frozen } : card)),
    }));
  };

  const toggleCardControl = (cardId, controlKey, value) => {
    setState((prev) => ({
      ...prev,
      cards: prev.cards.map((card) => (card.id === cardId ? {
        ...card,
        controls: { ...card.controls, [controlKey]: value },
      } : card)),
    }));
  };

  const appendChat = () => {
    if (!chatInput.trim()) return;
    setState((prev) => ({
      ...prev,
      supportChat: [
        ...prev.supportChat,
        { id: `c-${Date.now()}`, from: 'user', message: chatInput.trim() },
        { id: `c-${Date.now()}-r`, from: 'agent', message: 'Size kısa süre içinde geri dönüş yapacağız.' },
      ],
    }));
    setChatInput('');
  };

  const exportStatement = async (format = 'csv') => {
    const account = state.accounts[0];
    if (!account) return;
    const rows = [
      ['Date', 'Description', 'Amount'],
      ...account.recentTransactions.map((tx) => [tx.date, tx.label, tx.amount.toFixed(2)]),
    ];
    const fileName = `${FileSystem.documentDirectory}statement-${Date.now()}.${format}`;
    try {
      if (format === 'csv') {
        const csv = rows.map((r) => r.join(',')).join('\n');
        await FileSystem.writeAsStringAsync(fileName, csv, { encoding: FileSystem.EncodingType.UTF8 });
      } else {
        const body = rows.map((r) => r.join(' \u2022 ')).join('\n');
        const pseudoPdf = `Alternatif Bank Statement\n${body}`;
        await FileSystem.writeAsStringAsync(fileName, pseudoPdf, { encoding: FileSystem.EncodingType.UTF8 });
      }
      Alert.alert('Alternatif Bank', t('shareSuccess'));
    } catch (error) {
      Alert.alert('Alternatif Bank', error.message);
    }
  };

  const resetDemo = () => {
    setState(defaultState);
    setTransferForm({ iban: '', amount: '', description: '', fast: true, karekod: '' });
  };

  const changeLanguage = (lang) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, language: lang },
    }));
  };

  const changeTheme = (nextTheme) => {
    setState((prev) => ({
      ...prev,
      user: { ...prev.user, theme: nextTheme },
    }));
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }] }>
      <ExpoStatusBar style={themeKey === 'dark' ? 'light' : 'dark'} />
      {authStage !== 'dashboard' ? (
        <View style={styles.authWrapper}>
          <LinearGradient colors={[theme.primary, theme.primary + 'dd']} style={styles.hero}>
            <Text style={[styles.heroTitle, { color: '#fff' }]}>{t('welcome')}</Text>
            <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Alternatif Bank</Text>
          </LinearGradient>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke }] }>
            <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('welcome')}</Text>
            <TextInput
              style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
              placeholder={t('phoneOrEmail')}
              placeholderTextColor={theme.textSecondary}
              value={form.identifier}
              onChangeText={(text) => setForm((prev) => ({ ...prev, identifier: text }))}
            />
            {authStage === 'verify' ? (
              <>
                <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{t('otpPrompt')}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
                  keyboardType="number-pad"
                  value={otpCode}
                  onChangeText={setOtpCode}
                  placeholder="123456"
                  placeholderTextColor={theme.textSecondary}
                />
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleVerify}>
                  <Text style={styles.primaryButtonLabel}>{t('verify')}</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TextInput
                  style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
                  placeholder={t('password')}
                  placeholderTextColor={theme.textSecondary}
                  secureTextEntry
                  value={form.password}
                  onChangeText={(text) => setForm((prev) => ({ ...prev, password: text }))}
                />
                <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={handleLogin}>
                  <Text style={styles.primaryButtonLabel}>{t('login')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={handleRegister}>
                  <Text style={[styles.secondaryButtonLabel, { color: theme.primary }]}>{t('register')}</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          <LinearGradient colors={[theme.primary, theme.primary + 'dd']} style={styles.hero}>
            <Text style={[styles.heroTitle, { color: '#fff' }]}>{t('welcome')}</Text>
            <Text style={[styles.heroSubtitle, { color: 'rgba(255,255,255,0.7)' }]}>Alternatif Bank</Text>
          </LinearGradient>
          <View style={styles.sectionsRow}>
            <DashboardAccounts
              theme={theme}
              state={state}
              t={t}
              onExportCsv={() => exportStatement('csv')}
              onExportPdf={() => exportStatement('pdf')}
            />
          </View>

          <View style={styles.sectionsRow}>
            <TransferPanel
              theme={theme}
              state={state}
              transferForm={transferForm}
              setTransferForm={setTransferForm}
              t={t}
              onSubmit={handleTransfer}
              onKarekod={handleKarekod}
            />
          </View>

          <View style={styles.sectionsRow}>
            <PaymentsPanel theme={theme} payments={state.payments} t={t} onToggle={toggleAutopay} />
            <CardsPanel theme={theme} cards={state.cards} t={t} onFreeze={toggleCardFreeze} onToggle={toggleCardControl} />
          </View>

          <View style={styles.sectionsRow}>
            <NotificationsPanel theme={theme} notifications={state.notifications} t={t} />
            <SupportPanel theme={theme} faqs={state.faqs} chat={state.supportChat} t={t} chatInput={chatInput} setChatInput={setChatInput} onSend={appendChat} />
          </View>

          <View style={styles.sectionsRow}>
            <SettingsPanel
              theme={theme}
              user={state.user}
              t={t}
              onLanguageChange={changeLanguage}
              onThemeChange={changeTheme}
              onBiometricToggle={handleBiometricToggle}
              onKycApprove={approveKyc}
              onReset={resetDemo}
              biometricSupported={biometricSupported}
            />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

function DashboardAccounts({ theme, state, t, onExportCsv, onExportPdf }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('accounts')}</Text>
      {state.accounts.map((acc) => (
        <View key={acc.id} style={[styles.accountCard, { backgroundColor: theme.highlight }] }>
          <Text style={[styles.accountTitle, { color: theme.textPrimary }]}>{acc.title}</Text>
          <Text style={[styles.accountBalance, { color: theme.primary }]}>{acc.balance.toLocaleString('tr-TR', { style: 'currency', currency: acc.currency })}</Text>
          <Text style={[styles.accountIban, { color: theme.textSecondary }]}>{acc.iban}</Text>
          <Text style={[styles.sectionSubtitle, { color: theme.textSecondary, marginTop: 12 }]}>{t('recentTransactions')}</Text>
          {acc.recentTransactions.map((tx) => (
            <View key={tx.id} style={styles.transactionRow}>
              <View>
                <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{tx.label}</Text>
                <Text style={[styles.transactionMeta, { color: theme.textSecondary }]}>{tx.date}</Text>
              </View>
              <Text style={[styles.transactionAmount, { color: tx.amount < 0 ? theme.primary : '#2c9a62' }]}>
                {tx.amount.toLocaleString('tr-TR', { style: 'currency', currency: acc.currency })}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <View style={styles.exportRow}>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.primary, flex: 1, marginRight: 8 }]} onPress={onExportCsv}>
          <Text style={[styles.secondaryButtonLabel, { color: theme.primary }]}>{t('exportStatement')} CSV</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, flex: 1, marginLeft: 8 }]} onPress={onExportPdf}>
          <Text style={styles.primaryButtonLabel}>{t('exportStatement')} PDF</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TransferPanel({ theme, transferForm, setTransferForm, t, onSubmit, onKarekod }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('transfer')}</Text>
      <TextInput
        style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
        placeholder={t('iban')}
        placeholderTextColor={theme.textSecondary}
        value={transferForm.iban}
        onChangeText={(text) => setTransferForm((prev) => ({ ...prev, iban: text }))}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
        placeholder={t('amount')}
        placeholderTextColor={theme.textSecondary}
        keyboardType="decimal-pad"
        value={transferForm.amount}
        onChangeText={(text) => setTransferForm((prev) => ({ ...prev, amount: text }))}
      />
      <TextInput
        style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
        placeholder={t('description')}
        placeholderTextColor={theme.textSecondary}
        value={transferForm.description}
        onChangeText={(text) => setTransferForm((prev) => ({ ...prev, description: text }))}
      />
      <View style={styles.switchRow}>
        <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>{t('instant')}</Text>
        <Switch
          trackColor={{ true: theme.primary, false: theme.stroke }}
          thumbColor={transferForm.fast ? '#fff' : '#ccc'}
          value={transferForm.fast}
          onValueChange={(value) => setTransferForm((prev) => ({ ...prev, fast: value }))}
        />
      </View>
      <TextInput
        style={[styles.input, { borderColor: theme.stroke, color: theme.textPrimary }]}
        placeholder={t('karekod')}
        placeholderTextColor={theme.textSecondary}
        value={transferForm.karekod}
        onChangeText={(text) => setTransferForm((prev) => ({ ...prev, karekod: text }))}
      />
      <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.primary }]} onPress={onKarekod}>
        <Text style={[styles.secondaryButtonLabel, { color: theme.primary }]}>{t('pasteKarekod')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={onSubmit}>
        <Text style={styles.primaryButtonLabel}>{t('submit')}</Text>
      </TouchableOpacity>
    </View>
  );
}

function PaymentsPanel({ theme, payments, t, onToggle }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1, marginRight: 8 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('payments')}</Text>
      {payments.map((payment) => (
        <View key={payment.id} style={styles.paymentRow}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{payment.name}</Text>
            <Text style={[styles.transactionMeta, { color: theme.textSecondary }]}>{payment.reference}</Text>
          </View>
          <View style={styles.paymentActions}>
            <Text style={[styles.transactionAmount, { color: theme.primary }]}>
              {payment.amount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}
            </Text>
            <Switch
              trackColor={{ true: theme.primary, false: theme.stroke }}
              thumbColor={payment.autopay ? '#fff' : '#ccc'}
              value={payment.autopay}
              onValueChange={(value) => onToggle(payment.id, value)}
            />
          </View>
        </View>
      ))}
    </View>
  );
}

function CardsPanel({ theme, cards, t, onFreeze, onToggle }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1, marginLeft: 8 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('cards')}</Text>
      {cards.map((card) => (
        <View key={card.id} style={[styles.cardShell, { borderColor: theme.stroke }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardType, { color: theme.textSecondary }]}>{card.type}</Text>
            <TouchableOpacity onPress={() => onFreeze(card.id)}>
              <Text style={[styles.freezeButton, { color: theme.primary }]}>{card.frozen ? t('unfreeze') : t('freeze')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.cardNumber, { color: theme.textPrimary }]}>{card.masked}</Text>
          <Text style={[styles.transactionMeta, { color: theme.textSecondary, marginBottom: 8 }]}>Limit {card.limit.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })}</Text>
          <View style={styles.cardControls}>
            {Object.entries(card.controls).map(([key, value]) => (
              <View key={key} style={styles.switchRow}>
                <Text style={[styles.switchLabel, { color: theme.textPrimary }]}>{key}</Text>
                <Switch
                  trackColor={{ true: theme.primary, false: theme.stroke }}
                  thumbColor={value ? '#fff' : '#ccc'}
                  value={value}
                  onValueChange={(next) => onToggle(card.id, key, next)}
                />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

function NotificationsPanel({ theme, notifications, t }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1, marginRight: 8 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('notifications')}</Text>
      {notifications.map((note) => (
        <View key={note.id} style={styles.notificationRow}>
          <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{note.title}</Text>
          <Text style={[styles.transactionMeta, { color: theme.textSecondary }]}>{note.timestamp}</Text>
        </View>
      ))}
    </View>
  );
}

function SupportPanel({ theme, faqs, chat, t, chatInput, setChatInput, onSend }) {
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1, marginLeft: 8 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('support')}</Text>
      <Text style={[styles.sectionSubtitle, { color: theme.textSecondary }]}>{t('faq')}</Text>
      {faqs.map((item) => (
        <View key={item.id} style={styles.faqRow}>
          <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{item.q}</Text>
          <Text style={[styles.transactionMeta, { color: theme.textSecondary }]}>{item.a}</Text>
        </View>
      ))}
      <View style={[styles.chatBox, { borderColor: theme.stroke }] }>
        <FlatList
          data={chat}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={[styles.chatBubble, item.from === 'user' ? styles.chatBubbleUser : styles.chatBubbleAgent, { backgroundColor: item.from === 'user' ? theme.primary : theme.highlight }]}>
              <Text style={{ color: item.from === 'user' ? '#fff' : theme.textPrimary }}>{item.message}</Text>
            </View>
          )}
        />
        <View style={styles.chatInputRow}>
          <TextInput
            style={[styles.chatInput, { borderColor: theme.stroke, color: theme.textPrimary }]}
            placeholder={t('chatPlaceholder')}
            placeholderTextColor={theme.textSecondary}
            value={chatInput}
            onChangeText={setChatInput}
          />
          <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary, marginLeft: 8 }]} onPress={onSend}>
            <Text style={styles.primaryButtonLabel}>{t('send')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function SettingsPanel({ theme, user, t, onLanguageChange, onThemeChange, onBiometricToggle, onKycApprove, onReset, biometricSupported }) {
  const themeOptions = ['system', 'light', 'dark'];
  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.stroke, flex: 1 }]}>
      <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>{t('settings')}</Text>
      <View style={styles.settingRow}>
        <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{t('language')}</Text>
        <View style={styles.settingOptions}>
          {(['tr', 'en']).map((lang) => (
            <TouchableOpacity
              key={lang}
              style={[styles.pill, { borderColor: user.language === lang ? theme.primary : theme.stroke, backgroundColor: user.language === lang ? theme.highlight : 'transparent' }]}
              onPress={() => onLanguageChange(lang)}
            >
              <Text style={{ color: user.language === lang ? theme.primary : theme.textSecondary }}>{lang.toUpperCase()}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.settingRow}>
        <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{t('theme')}</Text>
        <View style={styles.settingOptions}>
          {themeOptions.map((option) => (
            <TouchableOpacity
              key={option}
              style={[styles.pill, { borderColor: user.theme === option ? theme.primary : theme.stroke, backgroundColor: user.theme === option ? theme.highlight : 'transparent' }]}
              onPress={() => onThemeChange(option)}
            >
              <Text style={{ color: user.theme === option ? theme.primary : theme.textSecondary }}>{t(option)}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
      <View style={styles.settingRow}>
        <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{t('biometric')}</Text>
        <Switch
          trackColor={{ true: theme.primary, false: theme.stroke }}
          thumbColor={user.biometricEnabled ? '#fff' : '#ccc'}
          value={user.biometricEnabled}
          onValueChange={onBiometricToggle}
          disabled={!biometricSupported}
        />
      </View>
      <View style={styles.settingRow}>
        <Text style={[styles.transactionLabel, { color: theme.textPrimary }]}>{t('kycTitle')}</Text>
        <TouchableOpacity style={[styles.primaryButton, { backgroundColor: theme.primary }]} onPress={onKycApprove}>
          <Text style={styles.primaryButtonLabel}>{user.kycApproved ? t('approved') : t('approve')}</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.settingRow}>
        <TouchableOpacity style={[styles.secondaryButton, { borderColor: theme.primary, flex: 1 }]} onPress={onReset}>
          <Text style={[styles.secondaryButtonLabel, { color: theme.primary }]}>{t('resetDemo')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  hero: {
    padding: 24,
    borderRadius: 24,
    margin: 16,
    marginBottom: 0,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  heroSubtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  authWrapper: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    margin: 16,
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#930036',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    fontSize: 16,
  },
  primaryButton: {
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonLabel: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  secondaryButtonLabel: {
    fontWeight: '600',
    fontSize: 16,
  },
  scroll: {
    paddingBottom: 64,
  },
  sectionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 8,
  },
  accountCard: {
    padding: 16,
    borderRadius: 20,
    marginBottom: 20,
  },
  accountTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  accountBalance: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 8,
  },
  accountIban: {
    fontSize: 12,
    marginTop: 4,
    letterSpacing: 1.2,
  },
  transactionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  transactionLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  transactionMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  transactionAmount: {
    fontSize: 15,
    fontWeight: '600',
  },
  exportRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  paymentActions: {
    alignItems: 'flex-end',
  },
  cardShell: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardType: {
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  freezeButton: {
    fontSize: 14,
    fontWeight: '600',
  },
  cardNumber: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 2,
    marginVertical: 12,
  },
  cardControls: {
    marginTop: 8,
  },
  notificationRow: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  faqRow: {
    marginBottom: 12,
  },
  chatBox: {
    borderWidth: 1,
    borderRadius: 16,
    marginTop: 16,
    padding: 12,
    height: 260,
  },
  chatBubble: {
    padding: 12,
    borderRadius: 16,
    marginBottom: 8,
  },
  chatBubbleUser: {
    alignSelf: 'flex-end',
  },
  chatBubbleAgent: {
    alignSelf: 'flex-start',
  },
  chatInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
  },
  settingRow: {
    marginBottom: 16,
  },
  settingOptions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  pill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
});
