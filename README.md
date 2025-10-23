# Alternatif Bank Mobile Demo

React Native + Expo demo that recreates the Alternatif Bank mobile experience for local testing. The experience runs fully offline with mock JSON data, a 123456 OTP code, biometric and KYC stubs, account dashboards, transfers with FAST and Karekod assistance, payments, card controls, notifications, support chat, and settings.

## Requirements
- Node 18+
- npm or yarn
- Expo CLI (`npm install -g expo-cli`) optional for easier commands

## Getting Started
```bash
npm install
npm run start
```

Open the Expo DevTools URL with an Android emulator, iOS simulator, or the Expo Go app on your phone. The demo ships with seeded data so you can sign in immediately using the mock OTP `123456`.

## Feature Overview
- Phone or email onboarding with OTP verification and mock biometric toggle
- KYC confirmation stub that flips the profile to **Approved**
- Home dashboard with TRY accounts, balances, latest transactions, and quick statement export to CSV or PDF files
- IBAN transfer form with validation, FAST instant marker, and Karekod paste to prefill recipient and amount
- Bill payments for electricity, water, and GSM, including optional autopay scheduling
- Card management for debit and credit cards with freeze/unfreeze, contactless, e-commerce, and international toggles
- Lightweight notifications feed, FAQ list, and stubbed support chat
- Settings screen supporting English/Turkish copy, light/dark themes, notification preferences, biometric lock, and demo data reset

## Statement Export
Exported statements are generated on demand and stored under the Expo document directory. Use the share sheet or file explorer on your simulator/device to inspect the generated CSV/PDF artifacts.

## Resetting Demo Data
From the Settings tab choose **Reset Demo** to reload the original mock data bundle.

