# Alternatif Bank Mobil Demo

Alternatif Bank'ın Türkiye'deki mobil uygulama deneyimini yerel ortamda taklit eden bu proje, tamamı mock verilerle çalışan tek sayfalı bir demo sağlar. Flask yalnızca arayüzü sunmak ve JSON tabanlı demo verisini yönetmek için kullanılır; gerçek bir altyapı ya da güvenlik katmanı içermez.

## Öne çıkan özellikler
- **OTP ile kayıt/giriş:** Telefon veya e-posta ile kayıt olun, demo OTP `123456` kodunu girerek doğrulayın.
- **Biyometrik kilit ve KYC:** Bir dokunuşla biyometrik kilidi açıp kapatın, tek ekranlık KYC stub'ı ile profili onaylayın.
- **Ana sayfa deneyimi:** TRY hesaplarınızı, güncel bakiyeleri, FAST kanalı dahil son işlemleri görün ve ekstreyi CSV/PDF olarak dışa aktarın.
- **Para transferi akışı:** Her kullanıcıya rastgele atanan IBAN'lar, IBAN doğrulama, FAST (anlık) işaretleme ve TR Karekod verisini yapıştırarak alıcı/tutar ön doldurma.
- **Ödemeler:** Elektrik, su ve GSM gibi temel faturaları ödeyin, isteğe bağlı otomatik ödeme talimatı oluşturun.
- **Kart yönetimi:** Bir debit ve bir kredi kartını görüntüleyin, anında dondurun/açın; temassız, e-ticaret ve yurtdışı harcama ayarlarını yönetin.
- **Bildirimler ve destek:** Bildirim listesini okuyun, stub'lanmış canlı destek sohbetinden mesaj gönderin, SSS listesini inceleyin.
- **Ayarlar:** Dil (TR/EN), tema (açık/koyu), bildirim tercihleri ve tek tıklamayla demo verilerini sıfırlama.
# Alternatif Bank Demo

Bu proje, Alternatif Bank mobil uygulamasının temel para transferi ve bakiye yönetimi işlevlerini yerel ortamda deneyimleyebilmeniz için hazırlanmış Flask tabanlı bir web uygulamasıdır.

## Özellikler
- Kullanıcı kaydı ve güvenli giriş
- Varsayılan açılış bakiyesi (₺1000) ile hesap oluşturma
- Bakiye yükleme (demo amaçlı sanal para ekleme)
- Kullanıcılar arasında para transferi
- Son 10 işlemi gösteren işlem geçmişi
- Alternatif Bank'ın kurumsal renk paletine uygun modern arayüz

## Kurulum

```bash
python -m venv .venv
source .venv/bin/activate  # Windows için .venv\\Scripts\\activate
pip install -r requirements.txt
```

## Çalıştırma
## Uygulamayı Çalıştırma

```bash
flask --app app run
```

Tarayıcıdan `http://127.0.0.1:5000` adresine giderek uygulamayı açabilirsiniz. İlk açılışta demo verileri `demo_data.json` dosyasında saklanır. Gerçek para transferi, güvenlik veya üretim özellikleri **yoktur**; proje yalnızca konsept gösterim içindir.
İlk çalıştırmada `bank.db` dosyası otomatik olarak oluşturulur. Tarayıcınızdan `http://127.0.0.1:5000` adresine giderek uygulamayı kullanmaya başlayabilirsiniz.

## Örnek Senaryo
1. "Kayıt Ol" sayfasından yeni bir kullanıcı oluşturun.
2. Uygulamaya giriş yapın.
3. Bakiye yükleme formunu kullanarak demo bakiyenizi artırın.
4. Başka bir kullanıcı oluşturup giriş yaparak kullanıcılar arasında para transferi gerçekleştirin.

> Bu proje yalnızca eğitim ve demo amaçlıdır; gerçek banka altyapısını temsil etmez.
