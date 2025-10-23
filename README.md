# Alternatif Bank React Native Demo

Bu depo, Alternatif Bank mobil deneyimini taklit eden tamamen yerel ve backend'siz bir React Native (Expo) demosu içerir. Kullanıcılar telefon veya e-posta ile kayıt olabilir, 123456 mock OTP'siyle doğrulama yapabilir, FAST/IBAN transferleri, temel fatura ödemeleri, kart yönetimi ve destek modüllerini tek uygulama içinde deneyebilir.

## Özellikler
- **OTP Tabanlı Onboarding** – Telefon veya e-posta ile kayıt, 123456 kodu ile doğrulama, isteğe bağlı biometrik kilit.
- **KYC Stub** – Tek tuşla profili “Onaylı” olarak işaretleyen hızlı bir kimlik doğrulama ekranı.
- **Ana Sayfa** – TL hesapları, rastgele atanmış IBAN'lar, son işlemler, bildirimler ve PDF/CSV ekstre aktarımı.
- **Para Transferleri** – IBAN doğrulama, FAST işareti, TR Karekod (QR) JSON/string çözücü ile alıcı ve tutar ön doldurma.
- **Ödemeler** – Elektrik, su ve GSM faturaları için ödeme ve otomatik ödeme talimatı.
- **Kart Yönetimi** – Bir debet ve bir kredi kartı için anlık dondurma, temassız limit, e-ticaret ve yurt dışı ayarları.
- **Bildirim & Destek** – Bildirim listesi, sık sorulan sorular ve otomatik yanıt veren sohbet stub'ı.
- **Ayarlar** – Dil (TR/EN), tema tercihi saklama, bildirim ayarı, biometrik kilit ve demo sıfırlama.

## Kurulum
1. [Node.js 18+](https://nodejs.org/) ve [Yarn](https://yarnpkg.com/) ya da npm yüklü olmalıdır.
2. Depoyu klonlayın ve bağımlılıkları kurun:
   ```bash
   npm install
   # veya
   yarn
   ```
3. Expo geliştirme sunucusunu başlatın:
   ```bash
   npx expo start
   ```
4. Çıkan QR kodunu Expo Go uygulamasıyla okutabilir veya emülatörde çalıştırabilirsiniz.

> Not: PDF/CSV dışa aktarımları ve paylaşım akışları gerçek cihazlarda test edildiğinde tam çalışır. Web önizlemesinde paylaşım özellikleri sınırlı olabilir.

## Yapı
```
.
├── App.js                 # Navigasyon ve tab yapısı
├── assets/
│   └── data/defaultState.json
├── src/
│   ├── components/        # Ortak bileşenler (GradientCard vb.)
│   ├── context/           # Uygulama durumu ve iş mantığı
│   ├── screens/           # Onboarding, Home, Transfer, Payments, Cards, Support, Settings
│   ├── theme/             # Renk paleti (#930036 ana ton)
│   └── utils/             # Yardımcı format fonksiyonları
└── package.json
```

## Geliştirme İpuçları
- Demo verileri `AsyncStorage` üzerinde saklanır; `Ayarlar > Demo Verilerini Sıfırla` üzerinden temizleyebilirsiniz.
- Mock OTP her zaman `123456` olarak kabul edilir.
- QR alanı, `{"iban":"TRXX...","amount":250,"name":"Alıcı"}` veya `TRXX...|250|Alıcı` formatlarını destekler.
- Biometrik kilit, Expo Local Authentication üzerinden cihaz desteği mevcutsa etkinleşir.

## Lisans
Bu proje eğitim ve demo amaçlıdır; gerçek bankacılık işlemleri için kullanılmamalıdır.
