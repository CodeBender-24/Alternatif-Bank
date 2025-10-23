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

## Uygulamayı Çalıştırma

```bash
flask --app app run
```

İlk çalıştırmada `bank.db` dosyası otomatik olarak oluşturulur. Tarayıcınızdan `http://127.0.0.1:5000` adresine giderek uygulamayı kullanmaya başlayabilirsiniz.

## Örnek Senaryo
1. "Kayıt Ol" sayfasından yeni bir kullanıcı oluşturun.
2. Uygulamaya giriş yapın.
3. Bakiye yükleme formunu kullanarak demo bakiyenizi artırın.
4. Başka bir kullanıcı oluşturup giriş yaparak kullanıcılar arasında para transferi gerçekleştirin.

> Bu proje yalnızca eğitim ve demo amaçlıdır; gerçek banka altyapısını temsil etmez.
