import React, { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import defaultState from '../../assets/data/defaultState.json';
import dayjs from 'dayjs';

const STORAGE_KEY = 'alternatif-bank-demo-state-v1';
const OTP_CODE = '123456';

const formatDate = (value) => dayjs(value).format('DD.MM.YYYY HH:mm');

const initialState = {
  ready: false,
  isAuthenticated: false,
  pendingUser: null,
  otpIssuedAt: null,
  loginChallenge: null,
  user: null,
  accounts: [],
  transactions: [],
  cards: [],
  billers: [],
  notifications: [],
  faqs: [],
  supportChat: [],
  knownRecipients: [],
  hasBiometricLock: false,
  settings: {
    language: 'tr',
    theme: 'crimson',
    notifications: true
  }
};

const AppContext = createContext();

const generateId = () => Crypto.randomUUID();

const generateIban = () => {
  const bankCode = '0018';
  const randomDigits = Array.from({ length: 16 }, () => Math.floor(Math.random() * 10)).join('');
  const checkDigits = String(Math.floor(Math.random() * 90) + 10);
  return `TR${checkDigits}${bankCode}${randomDigits}`;
};

const hydrateState = (userInfo) => {
  const now = new Date().toISOString();
  const accounts = defaultState.accounts.map((account) => ({
    ...account,
    iban: generateIban(),
    lastUpdated: now
  }));
  const notifications = defaultState.notifications.map((item) => ({
    ...item,
    read: false
  }));
  const transactions = defaultState.transactions.map((txn) => ({
    ...txn,
    timestamp: txn.timestamp || now
  }));
  const cards = defaultState.cards.map((card) => ({
    ...card,
    frozen: false
  }));

  return {
    isAuthenticated: false,
    pendingUser: null,
    otpIssuedAt: null,
    loginChallenge: null,
    user: {
      id: generateId(),
      fullName: userInfo.fullName,
      phone: userInfo.phone,
      email: userInfo.email,
      createdAt: now,
      kycApproved: false
    },
    accounts,
    transactions,
    cards,
    billers: defaultState.billers,
    notifications,
    faqs: defaultState.faqs,
    supportChat: [
      {
        id: generateId(),
        author: 'agent',
        message: 'Merhaba, size nasıl yardımcı olabilirim?',
        timestamp: now
      }
    ],
    knownRecipients: [],
    hasBiometricLock: false,
    settings: {
      language: 'tr',
      theme: 'crimson',
      notifications: true
    }
  };
};

const reducer = (state, action) => {
  switch (action.type) {
    case 'HYDRATE':
      return { ...state, ...action.payload, ready: true };
    case 'ISSUE_OTP':
      return {
        ...state,
        pendingUser: action.payload,
        otpIssuedAt: new Date().toISOString()
      };
    case 'COMPLETE_REGISTRATION':
      return { ...state, ...hydrateState(action.payload), ready: true };
    case 'ISSUE_LOGIN_OTP':
      return {
        ...state,
        loginChallenge: {
          identifier: action.payload,
          otp: OTP_CODE,
          issuedAt: new Date().toISOString()
        }
      };
    case 'CLEAR_LOGIN_CHALLENGE':
      return { ...state, loginChallenge: null };
    case 'LOGIN':
      return { ...state, isAuthenticated: true };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false };
    case 'APPROVE_KYC':
      return { ...state, user: { ...state.user, kycApproved: true }, isAuthenticated: true };
    case 'TOGGLE_BIOMETRIC':
      return { ...state, hasBiometricLock: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'UPDATE_ACCOUNTS':
      return { ...state, accounts: action.payload.accounts, transactions: action.payload.transactions };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [action.payload, ...state.notifications] };
    case 'MARK_NOTIFICATIONS_READ':
      return {
        ...state,
        notifications: state.notifications.map((item) => ({ ...item, read: true }))
      };
    case 'UPDATE_CARDS':
      return { ...state, cards: action.payload };
    case 'UPDATE_BILLERS':
      return { ...state, billers: action.payload };
    case 'ADD_SUPPORT_MESSAGE':
      return { ...state, supportChat: [...state.supportChat, action.payload] };
    case 'SET_RECIPIENTS':
      return { ...state, knownRecipients: action.payload };
    case 'RESET':
      return { ...initialState, ready: true };
    default:
      return state;
  }
};

export const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    const loadState = async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          dispatch({ type: 'HYDRATE', payload: { ...initialState, ...parsed } });
        } else {
          dispatch({ type: 'HYDRATE', payload: initialState });
        }
      } catch (error) {
        dispatch({ type: 'HYDRATE', payload: initialState });
      }
    };

    loadState();
  }, []);

  useEffect(() => {
    if (!state.ready) {
      return;
    }

    const persist = async () => {
      try {
        const { ready, ...persistable } = state;
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
      } catch (error) {
        console.warn('State persistence failed', error);
      }
    };

    persist();
  }, [state]);

  const issueOtp = async (form) => {
    dispatch({
      type: 'ISSUE_OTP',
      payload: {
        ...form,
        otp: OTP_CODE
      }
    });
    return OTP_CODE;
  };

  const verifyOtp = (code) => {
    if (code !== OTP_CODE || !state.pendingUser) {
      return false;
    }
    dispatch({ type: 'COMPLETE_REGISTRATION', payload: state.pendingUser });
    return true;
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const requestLoginOtp = (identifier) => {
    if (!state.user) {
      return false;
    }
    const trimmed = identifier?.trim();
    const matches = [state.user.phone, state.user.email].filter(Boolean).includes(trimmed);
    if (!matches) {
      return false;
    }
    dispatch({ type: 'ISSUE_LOGIN_OTP', payload: trimmed });
    return true;
  };

  const verifyLoginOtp = (code) => {
    if (code !== OTP_CODE || !state.loginChallenge) {
      return false;
    }
    dispatch({ type: 'CLEAR_LOGIN_CHALLENGE' });
    dispatch({ type: 'LOGIN' });
    return true;
  };

  const approveKyc = () => {
    dispatch({ type: 'APPROVE_KYC' });
  };

  const toggleBiometric = async (enabled) => {
    dispatch({ type: 'TOGGLE_BIOMETRIC', payload: enabled });
  };

  const updateSettings = (settings) => {
    dispatch({ type: 'SET_SETTINGS', payload: settings });
  };

  const recordTransfer = ({ fromAccountId, amount, counterpartyName, counterpartyIban, isIncoming, fast, description }) => {
    const transaction = {
      id: generateId(),
      accountId: fromAccountId,
      amount,
      type: isIncoming ? 'incoming' : 'outgoing',
      counterparty: counterpartyName,
      counterpartyIban,
      description,
      fast,
      timestamp: new Date().toISOString()
    };
    return transaction;
  };

  const transferByIban = ({ fromAccountId, iban, amount, description, fast, recipientName }) => {
    if (!state.accounts.length) {
      return { success: false, message: 'Hesap bulunamadı' };
    }
    const source = state.accounts.find((acc) => acc.id === fromAccountId);
    if (!source) {
      return { success: false, message: 'Kaynak hesap seçin' };
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return { success: false, message: 'Tutar geçersiz' };
    }
    if (source.balance < numericAmount) {
      return { success: false, message: 'Bakiye yetersiz' };
    }
    const trimmedIban = iban.replace(/\s+/g, '').toUpperCase();
    if (!/^TR\d{2}\d{22}$/.test(trimmedIban)) {
      return { success: false, message: 'IBAN formatı hatalı' };
    }

    const target = state.accounts.find((acc) => acc.iban === trimmedIban);

    const outgoingTransaction = recordTransfer({
      fromAccountId: source.id,
      amount: numericAmount,
      counterpartyName: recipientName || (target ? target.name : 'Harici Hesap'),
      counterpartyIban: trimmedIban,
      isIncoming: false,
      fast,
      description
    });

    let nextAccounts = state.accounts.map((acc) =>
      acc.id === source.id
        ? { ...acc, balance: Number((acc.balance - numericAmount).toFixed(2)), lastUpdated: new Date().toISOString() }
        : acc
    );

    let nextTransactions = [outgoingTransaction, ...state.transactions];

    if (target && target.id !== source.id) {
      const incomingTransaction = recordTransfer({
        fromAccountId: target.id,
        amount: numericAmount,
        counterpartyName: source.name,
        counterpartyIban: source.iban,
        isIncoming: true,
        fast,
        description
      });
      nextAccounts = nextAccounts.map((acc) =>
        acc.id === target.id
          ? { ...acc, balance: Number((acc.balance + numericAmount).toFixed(2)), lastUpdated: new Date().toISOString() }
          : acc
      );
      nextTransactions = [incomingTransaction, ...nextTransactions];
    }

    dispatch({ type: 'UPDATE_ACCOUNTS', payload: { accounts: nextAccounts, transactions: nextTransactions } });

    const notification = {
      id: generateId(),
      title: fast ? 'FAST transferiniz gönderildi' : 'EFT talimatınız alındı',
      body: `${numericAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} tutarında transfer oluşturuldu.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });

    const knownRecipient = state.knownRecipients.find((item) => item.iban === trimmedIban);
    if (!knownRecipient) {
      const nextRecipients = [
        ...state.knownRecipients,
        {
          id: generateId(),
          name: recipientName || 'Yeni Alıcı',
          iban: trimmedIban
        }
      ];
      dispatch({ type: 'SET_RECIPIENTS', payload: nextRecipients });
    }

    return { success: true };
  };

  const applyQrPayload = (payload) => {
    if (!payload) return null;
    try {
      if (payload.startsWith('{')) {
        const parsed = JSON.parse(payload);
        return {
          iban: parsed.iban || '',
          amount: parsed.amount || '',
          recipientName: parsed.name || ''
        };
      }
      const [iban, amount, name] = payload.split('|');
      return {
        iban: iban || '',
        amount: amount || '',
        recipientName: name || ''
      };
    } catch (error) {
      return null;
    }
  };

  const payBill = ({ billerId, accountNumber, amount, autopay }) => {
    const biller = state.billers.find((item) => item.id === billerId);
    if (!biller) {
      return { success: false, message: 'Kuruluş bulunamadı' };
    }
    const debitAccount = state.accounts[0];
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return { success: false, message: 'Tutar geçersiz' };
    }
    if (debitAccount.balance < numericAmount) {
      return { success: false, message: 'Bakiye yetersiz' };
    }

    const updatedAccounts = state.accounts.map((acc, index) =>
      index === 0
        ? { ...acc, balance: Number((acc.balance - numericAmount).toFixed(2)), lastUpdated: new Date().toISOString() }
        : acc
    );

    const paymentTransaction = {
      id: generateId(),
      accountId: debitAccount.id,
      type: 'outgoing',
      amount: numericAmount,
      counterparty: biller.name,
      description: `${biller.name} ödemesi (${accountNumber})`,
      timestamp: new Date().toISOString()
    };

    const updatedTransactions = [paymentTransaction, ...state.transactions];
    dispatch({ type: 'UPDATE_ACCOUNTS', payload: { accounts: updatedAccounts, transactions: updatedTransactions } });

    const updatedBillers = state.billers.map((item) =>
      item.id === billerId ? { ...item, autopay: Boolean(autopay) } : item
    );
    dispatch({ type: 'UPDATE_BILLERS', payload: updatedBillers });

    const notification = {
      id: generateId(),
      title: `${biller.name} ödemesi yapıldı`,
      body: `${numericAmount.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY' })} tutarındaki ödemeniz alınmıştır.`,
      timestamp: new Date().toISOString(),
      read: false
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: notification });
    return { success: true };
  };

  const toggleCardFreeze = (cardId, frozen) => {
    const updated = state.cards.map((card) => (card.id === cardId ? { ...card, frozen } : card));
    dispatch({ type: 'UPDATE_CARDS', payload: updated });
  };

  const toggleCardSetting = (cardId, settingKey, value) => {
    const updated = state.cards.map((card) =>
      card.id === cardId ? { ...card, settings: { ...card.settings, [settingKey]: value } } : card
    );
    dispatch({ type: 'UPDATE_CARDS', payload: updated });
  };

  const sendSupportMessage = (message) => {
    if (!message?.trim()) return;
    const now = new Date().toISOString();
    const clientMessage = {
      id: generateId(),
      author: 'user',
      message: message.trim(),
      timestamp: now
    };
    dispatch({ type: 'ADD_SUPPORT_MESSAGE', payload: clientMessage });
    const autoReply = {
      id: generateId(),
      author: 'agent',
      message: 'Talebinizi aldık, kısa süre içinde dönüş yapacağız.',
      timestamp: dayjs(now).add(2, 'minute').toISOString()
    };
    dispatch({ type: 'ADD_SUPPORT_MESSAGE', payload: autoReply });
  };

  const resetDemo = () => {
    dispatch({ type: 'RESET' });
    AsyncStorage.removeItem(STORAGE_KEY);
  };

  const markNotificationsRead = () => {
    dispatch({ type: 'MARK_NOTIFICATIONS_READ' });
  };

  const exportStatement = async ({ accountId, format = 'csv' }) => {
    const account = state.accounts.find((acc) => acc.id === accountId) || state.accounts[0];
    if (!account) {
      throw new Error('Hesap bulunamadı');
    }
    const statementTransactions = state.transactions.filter((txn) => txn.accountId === account.id).slice(0, 20);
    if (format === 'csv') {
      const header = 'Tarih,İşlem,Karşı Hesap,Tutar\n';
      const rows = statementTransactions
        .map((txn) =>
          [
            formatDate(txn.timestamp),
            txn.description,
            txn.counterparty,
            (txn.type === 'incoming' ? '+' : '-') + Number(txn.amount).toFixed(2)
          ].join(',')
        )
        .join('\n');
      const csv = header + rows;
      const fileUri = `${FileSystem.cacheDirectory}statement-${account.id}.csv`;
      await FileSystem.writeAsStringAsync(fileUri, csv, { encoding: FileSystem.EncodingType.UTF8 });
      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(fileUri, { mimeType: 'text/csv', dialogTitle: 'Hesap Özeti' });
      }
      return fileUri;
    }

    const html = `<!DOCTYPE html><html lang="tr"><head><meta charset="utf-8" /><title>Ekstre</title>
      <style>body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:24px;color:#222}
      h1{color:#930036}table{width:100%;border-collapse:collapse;margin-top:16px}
      th,td{border-bottom:1px solid #ddd;padding:8px;text-align:left}
      th{background-color:#fbe3ec}</style></head><body>
      <h1>${account.name} - ${account.iban}</h1>
      <p>Bakiye: ${account.balance.toLocaleString('tr-TR', { style: 'currency', currency: account.currency })}</p>
      <table><thead><tr><th>Tarih</th><th>İşlem</th><th>Karşı Hesap</th><th>Tutar</th></tr></thead><tbody>
      ${statementTransactions
        .map(
          (txn) => `<tr><td>${formatDate(txn.timestamp)}</td><td>${txn.description}</td><td>${txn.counterparty}</td><td>${
            txn.type === 'incoming' ? '+' : '-'
          }${Number(txn.amount).toFixed(2)}</td></tr>`
        )
        .join('')}
      </tbody></table></body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Hesap Özeti' });
    }
    return uri;
  };

  const value = useMemo(
    () => ({
      state,
      issueOtp,
      verifyOtp,
      logout,
      requestLoginOtp,
      verifyLoginOtp,
      approveKyc,
      toggleBiometric,
      updateSettings,
      transferByIban,
      applyQrPayload,
      payBill,
      toggleCardFreeze,
      toggleCardSetting,
      sendSupportMessage,
      exportStatement,
      resetDemo,
      markNotificationsRead
    }),
    [state]
  );

  if (!state.ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#930036" />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppData = () => useContext(AppContext);
