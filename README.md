# MOS Yasar

Expo tabanli mobil uygulama. Proje, talep onay akislarini ve vekalet yonetimini tek bir mobil deneyimde toplamak icin hazirlaniyor.

## Mevcut Kapsam

- Giris ve kayit ekranlari
- Talep listesi ve gecmis talepler
- Talep detay ekrani
- Aktif ve gecmis vekalet ekranlari

## Teknik Yapi

- Expo Router ile dosya tabanli navigation
- Feature-based klasorleme
- Mock servis katmani
- Backend entegrasyonuna hazir API client iskeleti

## Gelistirme

1. Bagimliliklari yukleyin.
   `npm install`
2. Uygulamayi baslatin.
   `npm run start`
3. Lint calistirin.
   `npm run lint`

## Backend Hazirligi

Backend servisleri hazir oldugunda asagidaki mock servisler remote adapterlar ile degistirilebilir:

- `src/features/auth/services/authService.ts`
- `src/features/request/services/requestService.ts`
- `src/features/delegate/services/delegateService.ts`
- `src/shared/api/apiClient.ts`

## Not

Su anki davranislarin bir kismi mock veriyle calisir. Bu durum arayuzun gelistirilmesini engellememek icin korunmustur; ancak servis baglantilari geldikce ayni kontratlar uzerinden gercek API cagrilarina gecilmesi hedeflenmistir.
