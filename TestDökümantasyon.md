# MOS-Yasar — Proje Devir Dokümantasyonu

> Bu doküman projeyi devralacak geliştirici için hazırlanmıştır. "Nerede çağrılıyor, nerede map ediliyor, datayı nereden alıyoruz, UI'a nasıl yansıyor" sorularına son detaylarına kadar yanıt verir.

İçindekiler:
1. [Proje Amacı ve Domain](#1-proje-amacı-ve-domain)
2. [Teknoloji Stack'i](#2-teknoloji-stacki)
3. [Klasör Yapısı](#3-klasör-yapısı)
4. [Konfigürasyon ve Environment](#4-konfigürasyon-ve-environment)
5. [Routing — Expo Router](#5-routing--expo-router)
6. [State Management (Custom External Store)](#6-state-management)
7. [API Katmanı (Fetch + Authenticated Wrapper)](#7-api-katmanı)
8. [Auth Akışı (Login → Token → Refresh → Logout)](#8-auth-akışı)
9. [Request (Talep) Feature — Uçtan Uca](#9-request-feature--uçtan-uca)
10. [Attorney (Vekâlet) Feature](#10-attorney-feature)
11. [Settings & Maintenance](#11-settings--maintenance)
12. [Push Notifications (FCM + Notifee)](#12-push-notifications)
13. [Theme, Font, i18n](#13-theme-font-i18n)
14. [Storage Stratejisi (SecureStore / AsyncStorage)](#14-storage-stratejisi)
15. [Build & Deploy (EAS)](#15-build--deploy)
16. [Son Yapılan Refactor'lar](#16-son-yapılan-refactorlar)
17. [Bilinen Sorunlar / Eksikler](#17-bilinen-sorunlar--eksikler)
18. [Sıkça Sorulabilecek Sorular ve Yanıtları](#18-sıkça-sorulabilecek-sorular)

---

## 1. Proje Amacı ve Domain

**Dijital.Onay** (kod adı: MOS-Yasar) — Yaşar Holding bünyesindeki **talep onay akışları** ve **vekâlet (temsilci) yönetimi** için bir mobil uygulamadır.

### İş Akışı
- Kullanıcı (örn. yönetici) → SAP Workflow'tan gelen onay taleplerini mobil cihazda görüntüler.
- Onay/Red/Düzeltme/vb. operasyonlar uygulanır; bazı operasyonlar açıklama gerektirir.
- Bazı talepler **toplu onaylanabilir** (`multipleApprove` flag'i veya kullanıcının `bulk_approve` rolü).
- Vekâlet: Kullanıcı, kendi yerine onay yetkisi verebilir (tarih aralığı + konu seçimi ile).
- Bildirimler FCM üzerinden cihaza ulaşır (yeni talep geldiğinde).

### Kullanıcılar
- SAP/Keycloak'tan gelen kurumsal kullanıcılar (Yaşar grup şirketleri).
- Roller (örn. `bulk_approve`) Keycloak realm_access içerisinde gelir; UI bunları okuyup yetenekleri açar.

---

## 2. Teknoloji Stack'i

| Katman | Teknoloji |
|---|---|
| Framework | **Expo SDK 54** + React Native 0.81 + React 19 |
| Routing | **Expo Router 6** (file-based) |
| Dil | TypeScript 5.9 (`strict: true`) |
| Auth | **Keycloak** (OAuth 2.0 — `password` grant + refresh token) |
| Backend API | Spring Boot tabanlı REST (`/mos/api/v3/...`) |
| State | **Custom external store** (`useSyncExternalStore` üzerine) — Zustand/Redux YOK |
| Token Storage | `expo-secure-store` (Keychain/Keystore) |
| Push | `@react-native-firebase/messaging` + `@notifee/react-native` |
| Native UI | `react-native-safe-area-context`, `react-native-screens`, `react-native-reanimated`, `react-native-svg`, `lottie-react-native`, `react-native-calendars`, `react-native-webview` |
| Build | **EAS Build** (Codemagic kaldırıldı) |
| Test | `node:test` (mapper/util) — component test framework henüz yok |

---

## 3. Klasör Yapısı

```
MOS-Yasar/
├── app/                           ← Expo Router (file-based routes — sadece yönlendirici)
│   ├── _layout.tsx                ← Root layout (FCM, Theme, Splash, Maintenance)
│   ├── index.tsx                  ← / → auth durumuna göre redirect
│   ├── login.tsx                  ← /login
│   ├── register.tsx               ← /register (kullanılmıyor olabilir, doğrula)
│   ├── set-password.tsx           ← /set-password
│   ├── maintenance-preview.tsx    ← bakım ekranı önizleme
│   ├── request-detail.tsx         ← LEGACY — /request/[id] kullanılıyor olmalı
│   ├── (tabs)/                    ← Authenticated tab grubu
│   │   ├── _layout.tsx            ← Tab layout + auth guard (Redirect → /login)
│   │   ├── index.tsx              ← /(tabs) → RequestListScreen
│   │   ├── past-requests.tsx      ← /(tabs)/past-requests → RequestHistoryScreen
│   │   └── settings.tsx           ← /(tabs)/settings → SettingsScreen
│   ├── request/
│   │   ├── [id].tsx               ← /request/<id> → RequestDetailScreen
│   │   └── attachment-preview.tsx ← iOS ek önizleme (WebView)
│   └── settings/
│       ├── _layout.tsx            ← AttorneyProvider sarmalayıcı
│       ├── active-attorneys.tsx
│       ├── past-attorneys.tsx
│       ├── create-attorney.tsx
│       └── select-subjects.tsx
│
├── src/
│   ├── config/
│   │   └── appConfig.ts           ← Runtime config (Constants.expoConfig.extra'dan okur)
│   │
│   ├── features/                  ← Feature-based modülasyon
│   │   ├── auth/
│   │   │   ├── api/contracts.ts   ← Backend DTO tipleri
│   │   │   ├── components/        ← LoginScreen alt komponentleri (DevLoginControls, ForgotPasswordModal)
│   │   │   ├── hooks/             ← useLoginActions, useLoginForm, useRememberMeAvailability
│   │   │   ├── screens/           ← LoginScreen, RegisterScreen, SetPasswordScreen
│   │   │   ├── services/
│   │   │   │   ├── authService.ts          ← Public facade (mock vs remote dispatcher)
│   │   │   │   ├── authSessionStorage.ts   ← SecureStore I/O
│   │   │   │   ├── mockAuthService.ts
│   │   │   │   ├── notificationDisplayService.ts ← Notifee sarmalayıcı
│   │   │   │   ├── notificationService.ts  ← FCM token + RegisterSNS/DeleteSNS
│   │   │   │   ├── payloadMappers.ts       ← UI Payload → DTO
│   │   │   │   ├── remoteAuthService.ts    ← Keycloak + MOS API
│   │   │   │   ├── tokenMapper.ts          ← LoginResponseDto + JWT decode → AuthSession
│   │   │   │   ├── types.ts                ← AuthService interface
│   │   │   │   ├── validators.ts
│   │   │   │   └── versionService.ts       ← /mos/api/v3/check (versiyon zorunluluğu)
│   │   │   └── types.ts                    ← AuthSession, AuthUser, payload types
│   │   │
│   │   ├── request/
│   │   │   ├── api/contracts.ts            ← Remote*Dto tipleri (sunucudan gelen)
│   │   │   ├── components/                 ← Karta, listeye, modallere ait UI
│   │   │   ├── hooks/                      ← useRequestList, useRequestDetail, useRequestHistory,
│   │   │   │                                  useRequestAction, useRequestFilter, useAttachmentHandler
│   │   │   ├── screens/                    ← RequestListScreen, RequestDetailScreen,
│   │   │   │                                  RequestHistoryScreen, AttachmentPreviewScreen
│   │   │   ├── services/
│   │   │   │   ├── requestService.ts       ← Public facade (mock vs remote dispatcher)
│   │   │   │   ├── remoteRequestService.ts ← Sunucu çağrıları
│   │   │   │   ├── mockRequestService.ts
│   │   │   │   ├── remoteRequestCache.ts   ← Liste verisinin in-memory cache'i
│   │   │   │   ├── requestMapper.ts        ← DTO → Domain (RequestSummary/Detail)
│   │   │   │   ├── statusMapper.ts         ← status code → label/color
│   │   │   │   ├── operationMapper.ts      ← API operations → UI butonları
│   │   │   │   ├── attachmentMapper.ts     ← API attachment → UI attachment
│   │   │   │   ├── detailSectionMapper.ts  ← descriptions → bölümlü görünüm
│   │   │   │   ├── descriptionParser.ts    ← "Şirket: ABC" gibi etiket-değer ayrıştırma
│   │   │   │   ├── attachmentFileUtils.ts  ← Cache + dosya açma + WebView preview HTML
│   │   │   │   ├── attachmentPreviewService.ts ← MIME/preview HTML üreticisi
│   │   │   │   ├── dateUtils.ts            ← Tarih formatlama (TR ↔ ISO)
│   │   │   │   ├── deviceInfo.ts           ← "Brand Model, Android 14" tarzı string
│   │   │   │   ├── encoding.ts             ← Custom base64 (RN'in btoa'sından bağımsız)
│   │   │   │   └── types.ts                ← RequestService interface
│   │   │   └── types.ts                    ← Domain tipleri (RequestSummary, RequestDetail, ...)
│   │   │
│   │   ├── attorney/
│   │   │   ├── api/contracts.ts            ← MosApiWrapper<T>, AttorneyDto, ...
│   │   │   ├── components/AttorneyCard.tsx
│   │   │   ├── context/AttorneyContext.tsx ← Form state (createAttorney akışı için)
│   │   │   ├── screens/                    ← Active, Past, Create, SubjectSelection
│   │   │   ├── services/attorneyService.ts ← Tek dosya, hem service hem mapping
│   │   │   └── types.ts                    ← Attorney, AttorneySubject, CreateAttorneyPayload
│   │   │
│   │   ├── maintenance/
│   │   │   ├── screens/MaintenanceScreen.tsx
│   │   │   └── services/maintenanceService.ts ← Şu an PATH boş, no-op
│   │   │
│   │   └── settings/
│   │       └── screens/SettingsScreen.tsx
│   │
│   ├── shared/
│   │   ├── api/
│   │   │   ├── apiClient.ts                ← FetchApiClient + ApiError + helpers
│   │   │   ├── authenticatedApiClient.ts   ← Token ekler, 401'de refresh
│   │   │   ├── apiEnvelope.ts              ← {code, message, title, data} zarfı + assertApiSuccess
│   │   │   └── apiEnvelopeUtils.ts         ← Envelope hata mesajı çıkarma
│   │   ├── components/
│   │   │   ├── icons/CustomCalendarIcon.tsx
│   │   │   └── ui/                         ← AppLoader, ConfirmModal, ActionDrawer, ScaledText, vb.
│   │   ├── hooks/useKeyboardVisibility.ts
│   │   ├── i18n/                           ← tr.ts, en.ts, useTranslation.ts (custom)
│   │   ├── theme/                          ← colors.ts (light/dark), fontSizes.ts, useTheme.ts
│   │   └── utils/                          ← (boş veya generic helper'lar)
│   │       └──logger.ts.                   ← Telemetri katmanı + Firebase Proxy/Wrapper
│   ├── store/
│   │   ├── createExternalStore.ts          ← Generic factory (useSyncExternalStore wrapper)
│   │   ├── useAppStore.ts                  ← Environment (api mode, baseUrl)
│   │   ├── useAuthStore.ts                 ← Session yaşam döngüsü (özel — factory kullanmıyor)
│   │   ├── useFontSizeStore.ts             ← S/M/L
│   │   ├── useLanguageStore.ts             ← tr/en
│   │   ├── useThemeStore.ts                ← light/dark
│   │   └── useUiStore.ts                   ← Top overlay görünürlüğü
│   │
│   └── types/global.d.ts                   ← (şu an boş)
│
├── plugins/                                ← Custom Expo config plugins
│   ├── withOptimizedBuild.js               ← Gradle minify/shrink/architectures
│   ├── withNotificationIcon.js             ← FCM ikonu drawable + manifest meta
│   └── withNotifee.js                      ← Notifee maven repo eklemesi
│
├── tests/                                  ← node:test (mapper/util)
│   └── *.test.mjs                          ← 11 dosya, 30 test
│
├── scripts/                                ← reset-project.js, resize-icon.js
├── assets/                                 ← icon, adaptive-icon, splash, lottie animations
├── constants/                              ← (varsa, sabitler)
├── android/                                ← prebuild çıktısı (.gitignore'da)
│
├── app.config.js                           ← TEK config kaynağı (app.json kaldırıldı)
├── eas.json                                ← EAS Build profilleri
├── tsconfig.json                           ← strict: true, paths: { "@/*": ["./*"] }
├── eslint.config.js                        ← expo-config flat
├── react-native.config.js
├── package.json
├── google-services.json                    ← .gitignore'lı (Firebase) — local'de bulunmalı
└── mobilonay.keystore                      ← .gitignore'lı (Android imza) — local'de bulunmalı
```

---

## 4. Konfigürasyon ve Environment

### Üç Katman

1. **`app.config.js`** (tek runtime config kaynağı):
   - `process.env.APP_ENV === 'production'` flag'iyle test/prod ayrımı
   - `extra` altında `api`, `auth`, `eas` blokları
   - Plugin listesi, Android paket adı, splash ayarları, vb.

2. **`src/config/appConfig.ts`** (TS arayüzü):
   - `Constants.expoConfig.extra` üzerinden `app.config.js`'in `extra` bloğunu okur.
   - Sabit fallback'ler (`API_BASE_URL`, `KEYCLOAK_BASE_URL`, `KEYCLOAK_REALM`, `APP_VERSION_BY_PLATFORM`).
   - `appConfig` objesi, `getKeycloakBaseUrl()`, `getKeycloakRealm()`, `isRemoteApiEnabled()`, `isRemoteAuthEnabled()` export'ları.
   - **Kullanım örneği:**
     ```ts
     import { appConfig } from '@/src/config/appConfig';
     const client = new FetchApiClient(appConfig.api.baseUrl);
     ```

3. **EAS Build env (`eas.json`)**:
   - `production-apk` profili `APP_ENV=production` set eder.
   - Build sırasında `app.config.js` bu env'i okur, doğru URL'leri seçer.

### Ortam Değişkenleri (Resolved)

| Ortam | API base | Keycloak base | Realm | Versiyon (iOS/Android) |
|---|---|---|---|---|
| Test (default) | `mos-tst.yasar.com.tr` | `oauthtest.yasar.com.tr` | `Mobil.Onay` | `2.4.4` / `2.4.1` |
| Production | `mos2.yasar.com.tr` | `oauth.yasar.com.tr` | `mobil-onay` | aynı |

> **Versiyon sabitleri:** [`appConfig.ts:6-9`](src/config/appConfig.ts#L6-L9). Versiyon değiştiğinde **bu sabit + `app.config.js`'in `version` alanı + EAS auto-increment** üçü uyumlu olmalı.

---

## 5. Routing — Expo Router

Expo Router **dosya-tabanlı**. `app/` altındaki her `.tsx` bir route'tur. Parantezli klasörler (`(tabs)`) URL'e yansımaz, sadece grup oluşturur.

### Route Haritası

| URL | Dosya | Ekran |
|---|---|---|
| `/` | [app/index.tsx](app/index.tsx) | Auth durumuna göre `Redirect` |
| `/login` | [app/login.tsx](app/login.tsx) | LoginScreen |
| `/register` | [app/register.tsx](app/register.tsx) | RegisterScreen |
| `/set-password` | [app/set-password.tsx](app/set-password.tsx) | SetPasswordScreen |
| `/(tabs)` | [app/(tabs)/index.tsx](app/(tabs)/index.tsx) | RequestListScreen |
| `/(tabs)/past-requests` | [app/(tabs)/past-requests.tsx](app/(tabs)/past-requests.tsx) | RequestHistoryScreen |
| `/(tabs)/settings` | [app/(tabs)/settings.tsx](app/(tabs)/settings.tsx) | SettingsScreen |
| `/request/[id]` | [app/request/[id].tsx](app/request/[id].tsx) | RequestDetailScreen (dinamik) |
| `/request/attachment-preview` | [app/request/attachment-preview.tsx](app/request/attachment-preview.tsx) | iOS WebView preview |
| `/settings/active-attorneys` | [app/settings/active-attorneys.tsx](app/settings/active-attorneys.tsx) | ActiveAttorneyScreen |
| `/settings/past-attorneys` | [app/settings/past-attorneys.tsx](app/settings/past-attorneys.tsx) | PastAttorneyScreen |
| `/settings/create-attorney` | [app/settings/create-attorney.tsx](app/settings/create-attorney.tsx) | CreateAttorneyScreen |
| `/settings/select-subjects` | [app/settings/select-subjects.tsx](app/settings/select-subjects.tsx) | SubjectSelectionScreen |

### Layout Hiyerarşisi

```
RootLayout (app/_layout.tsx)
  ├─ SafeAreaProvider
  ├─ ThemeSync (StatusBar + System UI rengi)
  ├─ SplashAnimationScreen (ilk açılış)
  ├─ Maintenance check → MaintenanceScreen veya:
  ├─ NotificationHandler (FCM listener'ları)
  ├─ Stack
  │    ├─ (tabs)/_layout.tsx (auth guard + tab bar)
  │    │    ├─ index (RequestList)
  │    │    ├─ past-requests (RequestHistory)
  │    │    └─ settings (Settings)
  │    ├─ login, register, set-password
  │    ├─ request/[id], request/attachment-preview
  │    └─ settings/_layout.tsx (AttorneyProvider context)
  │         ├─ active-attorneys, past-attorneys
  │         ├─ create-attorney, select-subjects
  ├─ RootTopOverlay (modal varken üst alan karartma)
  └─ AppLoader (global loading overlay)
```

### Auth Guard
- `app/(tabs)/_layout.tsx:11-13` — `isAuthenticated` false ise `<Redirect href="/login" />`.
- `app/index.tsx` — root'ta auth varsa `(tabs)`'a, yoksa `/login`'e redirect.

### Tab Bar
- Custom: [`MainBottomNavbar`](src/shared/components/ui/MainBottomNavbar.tsx) — default tab bar yerine kullanılıyor (`tabBar={() => <MainBottomNavbar />}`).

### Ölü/Şüpheli Route'lar
- `app/request-detail.tsx` — büyük ihtimalle eski path; `/request/[id]` kullanımda. **Doğrula ve sil.**
- `app/register.tsx`, `app/set-password.tsx`, `app/maintenance-preview.tsx` — kullanım takip edilmeli; tetiklendikleri yer yoksa silinebilir.

---

## 6. State Management

**Yaklaşım:** Zustand veya Redux **YOK**. Kendi yazdığımız hafif external store kullanıyoruz.

### Generic Factory: `createExternalStore`

[`src/store/createExternalStore.ts`](src/store/createExternalStore.ts) — `useSyncExternalStore` üzerine inşa edilmiş ~30 satırlık factory:

```ts
const store = createExternalStore<MyState>(initialState);
store.getState();      // Sync read
store.setState(next);  // Update + emit
store.subscribe(fn);   // Manuel subscribe
store.useStore();      // React hook (render-time subscribe)
```

### Store'lar

| Store | Sorumluluk | Persist |
|---|---|---|
| [`useAuthStore`](src/store/useAuthStore.ts) | `session`, `isLoading`, `isPersisted`, `isAuthenticated` | ✅ SecureStore |
| [`useAppStore`](src/store/useAppStore.ts) | `environment` (apiMode, baseUrl, servicesReady) | ❌ |
| [`useThemeStore`](src/store/useThemeStore.ts) | `mode: 'light' \| 'dark'` | ✅ AsyncStorage |
| [`useFontSizeStore`](src/store/useFontSizeStore.ts) | `preference: 'S' \| 'M' \| 'L'` | ✅ AsyncStorage |
| [`useLanguageStore`](src/store/useLanguageStore.ts) | `language: 'tr' \| 'en'` | ✅ AsyncStorage |
| [`useUiStore`](src/store/useUiStore.ts) | `isTopOverlayVisible` | ❌ |

> **`useAuthStore` özeldir:** Diğerlerinden farklı olarak factory kullanmaz (özel persist + multi-key cleanup mantığı için). [`useAuthStore.ts:18-71`](src/store/useAuthStore.ts#L18-L71) inceleyin.

### Auth Store API

```ts
// React component içinde:
const { session, isAuthenticated, isLoading, setSession, clearSession } = useAuthStore();

// React dışında (servis):
import { authStore } from '@/src/store/useAuthStore';
const token = authStore.getState().session?.accessToken;
authStore.setSession(newSession, rememberMe);  // SecureStore'a yazar (rememberMe ise)
authStore.updateSession(newSession);            // Token refresh sonrası — persist durumunu korur
authStore.clear();                              // Logout — FCM token ve SNS ARN'ı da siler
```

### Persist Davranışı (Auth)

- **Uygulama açılır → `readAuthSession()` SecureStore'dan okur** ([useAuthStore.ts:28-35](src/store/useAuthStore.ts#L28-L35)). Bittiğinde `isLoading: false` ve `isPersisted: true/false` yayınlanır.
- **Login (`rememberMe=true`)** → SecureStore'a yazılır.
- **Login (`rememberMe=false`)** → SecureStore'dan silinir; session sadece bellekte tutulur.
- **Refresh** → `updateSession()` mevcut persist durumunu korur, gerekiyorsa yeniden yazar.
- **Logout** → SecureStore + FCM token + SNS ARN temizlenir.

> **Beni Hatırla şartı:** [`useRememberMeAvailability.ts`](src/features/auth/hooks/useRememberMeAvailability.ts) — cihazda kilit ekranı şifresi yoksa rememberMe kullanılamaz (`LocalAuthentication.SecurityLevel.SECRET` kontrolü).

---

## 7. API Katmanı

İki sınıf: **`FetchApiClient`** (saf fetch wrapper) ve **`AuthenticatedApiClient`** (token + 401 retry).

### `FetchApiClient` ([`apiClient.ts`](src/shared/api/apiClient.ts))

Sorumlulukları:
1. `baseUrl + path` birleştirme (mutlak URL gelirse aynen kullanır).
2. Default header'lar: `Accept: application/json`, `Connection: close` (HTTP desync prevention).
3. Body JSON.stringify, gerekirse `Content-Type: application/json`.
4. **15 saniye timeout** (`AbortController`).
5. **Raw HTTP message injection guard**: body içinde "GET /... HTTP/1.1" gibi raw HTTP payload varsa bloklar (saldırı koruması).
6. **Hata parsing**:
   - Keycloak hata formatı: `{ error, error_description }` → `ApiError(error, error_description)`
   - Spring Boot hata formatı: `{ status, error, path }` → `ApiError(status, error)`
   - Diğer: `ApiError(httpStatus, "HTTP nnn")`
7. Network/timeout hatası: `ApiError('NETWORK_ERROR' | 'TIMEOUT', 'Sunucuya bağlanılamıyor.')`

```ts
const client = new FetchApiClient('https://mos-tst.yasar.com.tr');
const response = await client.request<MyDto>('/path', {
  method: 'POST',
  body: { foo: 'bar' },
  headers: { 'X-Custom': '...' },
});
```

> **Not:** Şu an response için runtime şema validasyonu YOK — `(await response.json()) as T` cast'i var. K5 olarak işaretlenmiş, gelecekte Zod ile çözülmeyi bekliyor.

### `AuthenticatedApiClient` ([`authenticatedApiClient.ts`](src/shared/api/authenticatedApiClient.ts))

`FetchApiClient`'ı sarmalar, her isteğe `Authorization: Bearer <accessToken>` ekler.

**401 davranışı:**
1. İsteği gönderirken store'daki token'ı yakala (`tokenAtSend`).
2. 401 alınca, store'daki güncel token'a bak (`tokenNow`).
3. Eğer token değişmişse (başka bir paralel istek refresh etmiş) → yeni token'la bir kez retry.
4. Aynıysa `ensureRefreshed()` (modül-seviye `refreshPromise` lock'u ile dedup'lı refresh) → retry.
5. Refresh başarısız → `authStore.clear()` + `router.replace('/login')` + orijinal 401 throw.
6. Tek retry; ikinci 401 propagate eder (sonsuz döngü yok).

> Bu davranış K4 fix'inin sonucudur. Detay için [Bölüm 16](#16-son-yapılan-refactorlar).

### Envelope Pattern ([`apiEnvelope.ts`](src/shared/api/apiEnvelope.ts))

Tüm MOS backend yanıtları şu zarf içinde gelir:

```ts
interface ApiEnvelope<T = unknown> {
  code: number;          // 200 = OK, 401 = unauthorized (envelope-level, HTTP 200 olabilir)
  message: string | null;
  title: string | null;
  data?: T;
}
```

```ts
import { assertApiSuccess } from '@/src/shared/api/apiEnvelope';

const response = await apiClient.request<MyDto>('/path');
assertApiSuccess(response);
// Şimdi response.data güvenli kullanılabilir
```

**`assertApiSuccess` ne yapar:**
- `code === 200` → no-op.
- `code === 401` (envelope içi) → `authStore.clear() + router.replace('/login')`. *(HTTP 401 değil — sunucu HTTP 200 dönüp envelope.code=401 verebilir.)*
- Diğer code → `throw new Error(getApiEnvelopeErrorMessage(response))` (`title || message || 'Islem gerceklestirilemedi.'`).

> **Önemli:** Bazı eski endpoint'ler envelope kullanmıyor (örn. Keycloak token endpoint'i). Onlarda `assertApiSuccess` çağırma.

### API Client Instance'ları

Her servis kendi instance'ını oluşturur (singleton değil — basit, küçük bir overhead var ama state paylaşımı yok):

```ts
// src/features/request/services/remoteRequestService.ts
const apiClient = new AuthenticatedApiClient(appConfig.api.baseUrl);

// src/features/auth/services/remoteAuthService.ts
const keycloakApiClient = new FetchApiClient(getKeycloakBaseUrl());
const mosApiClient = new FetchApiClient(appConfig.api.baseUrl);
```

> **Refresh token lock paylaşımlıdır:** `AuthenticatedApiClient` içindeki `refreshPromise` modül-seviye değişken — tüm instance'lar ortak. Yani 5 farklı yerde 401 alınsa bile tek refresh tetiklenir.

---

## 8. Auth Akışı

### 8.1 Login

```
LoginScreen
  └─ useLoginActions.handleLogin()
       └─ authService.login({ username, password, rememberMe })
            ├─ isRemoteAuthEnabled() ? remoteAuthService.login : mockAuthService.login
            │
            └─ remoteAuthService.login (src/features/auth/services/remoteAuthService.ts:48-90)
                 1. mapLoginPayloadToDto() — trim username (payloadMappers.ts)
                 2. ensureUsername(), ensurePassword() (validators.ts)
                 3. runVersionCheck() — POST /mos/api/v3/check?platform=...&version=... (versionService.ts)
                 4. POST /auth/realms/<realm>/protocol/openid-connect/token  ← Keycloak
                    Content-Type: application/x-www-form-urlencoded
                    Body: grant_type=password&username=...&password=...&client_id=mobile-api
                 5. invalid_grant ? throw "Kullanici adi veya sifre hatali."
                 6. mapLoginResponseToSession(tokenResponse) (tokenMapper.ts)
                    └─ JWT'yi base64url decode et → user (id, fullName, email, company, roles, username)
                 7. registerForPushNotifications(accessToken) — fire & forget
                 8. return AuthSession
       │
       └─ authStore.setSession(session, rememberMe)
            └─ rememberMe ? writeAuthSession (SecureStore) : removeAuthSession
       │
       └─ router.replace('/(tabs)')
```

**Hata yolları:**
- Network: `ApiError('NETWORK_ERROR', ...)` → `Alert.alert('Giriş Başarısız', message)`
- "not fully set up" mesajı → `router.push('/set-password', { email })`
- Diğer: Alert ile mesaj göster.

### 8.2 Token Refresh

[`remoteAuthService.refreshSession`](src/features/auth/services/remoteAuthService.ts#L25-L46):

```
authenticatedApiClient bir endpoint'te 401 alır
  └─ ensureRefreshed()
       └─ refreshSession()
            1. authStore.getState().session.refreshToken kontrol
            2. POST /auth/realms/<realm>/protocol/openid-connect/token
               Body: grant_type=refresh_token&refresh_token=...&client_id=mobile-api
            3. mapLoginResponseToSession → newSession
            4. authStore.updateSession(newSession)  ← persist durumu korunur
       └─ Orijinal istek yeni token'la retry
```

### 8.3 Register / Set Password / Forgot

| Akış | Endpoint | Yer |
|---|---|---|
| Register | `POST /mos/api/v3/register` | [remoteAuthService.ts:92-114](src/features/auth/services/remoteAuthService.ts#L92-L114) |
| Set Password | `POST /mos/api/v3/set-password` | [remoteAuthService.ts:116-134](src/features/auth/services/remoteAuthService.ts#L116-L134) |
| Forgot Password | `POST /mos/api/v3/forgot-password` | [remoteAuthService.ts:136-141](src/features/auth/services/remoteAuthService.ts#L136-L141) |
| Version Check | `POST /mos/api/v3/check?platform=&version=` | [versionService.ts](src/features/auth/services/versionService.ts) |

### 8.4 Logout

```
SettingsScreen logout butonu
  └─ authStore.clear()
       ├─ session = null, isLoading: false, isPersisted: false
       ├─ removeAuthSession() — SecureStore'dan sil
       └─ AsyncStorage.multiRemove(['@mos/fcm_token', '@mos/sns_arn'])
  └─ router.replace('/login')  ← veya tab layout otomatik redirect eder
```

> **deregisterFromPushNotifications** ([notificationService.ts:77-87](src/features/auth/services/notificationService.ts#L77-L87)) çağrılmıyor — kullanıcı logout etse bile sunucudaki SNS endpoint'i tutuluyor olabilir. Production'da bu çağrılmalı (ek iş).

### 8.5 JWT Decoding

[`tokenMapper.ts`](src/features/auth/services/tokenMapper.ts):
- Access token JWT'yi parçalayıp middle segment'i base64url decode eder.
- Payload'tan `sub` (id), `given_name/name/preferred_username` (fullName), `email`, `organizationName` (company), `realm_access.roles` (roles), `preferred_username` (username) çıkarır.
- **Kullanıcı bilgisi sunucudan ayrı bir endpoint'le çekilmiyor — JWT'den parse ediliyor.** Bu yüzden ek bir `/me` çağrısı yok.

---

## 9. Request (Talep) Feature — Uçtan Uca

Bu projenin ana iş akışı budur. Tüm bağlantıları tek akışta görmek için aşağıyı izle.

### 9.1 Liste Akışı (Aktif Talepler)

#### UI: `RequestListScreen` ([src/features/request/screens/RequestListScreen.tsx](src/features/request/screens/RequestListScreen.tsx))

#### Hook: `useRequestList` ([src/features/request/hooks/useRequestList.ts](src/features/request/hooks/useRequestList.ts))

```ts
const { processedData, isLoading, isContentReady, fetchData, ... } = useRequestList({
  actionFailedMessage, connectionErrorMessage, connectionErrorTitle, genericErrorTitle,
});
```

**Yaptıkları:**
- `useFocusEffect` → ekrana her odaklandığında `fetchData()` çağrılır.
- `fetchData` → `requestService.getRequests()`'i çağırır, sonucu `allRequests` state'ine yazar.
- `useRequestFilter(allRequests)` → arama anahtar kelimesine göre `processedData` filtrelenir.
- Toplu seçim, kategori toggling, role-based selection (`canBulkApprove`).
- Hata: `isNetworkError` ise "bağlantı hatası" Alert; değilse generic Alert.

#### Service: `requestService` ([src/features/request/services/requestService.ts](src/features/request/services/requestService.ts))

Public facade — runtime'da remote/mock dispatcher:

```ts
export const requestService = {
  getRequests: () => isRemoteRequestListEnabled() ? remoteRequestService.getRequests() : mockRequestService.getRequests(),
  // ...diğer metodlar
};
```

#### Remote: `remoteRequestService.getRequests` ([remoteRequestService.ts:48-56](src/features/request/services/remoteRequestService.ts#L48-L56))

```ts
async getRequests() {
  const response = await apiClient.request<RemoteRequestListResponseDto>(GET_REQUESTS_SINGLE_PATH);
  // GET /mos/api/v3/GetRequestsSingle  (Authorization: Bearer ...)
  assertApiSuccess(response);
  const groups = mapRemoteResponseToGroups(response.data ?? []);  // ← MAPPING
  setRemoteGroupsCache(groups);  // ← CACHE (in-memory)
  return groups;
}
```

#### Mapping: DTO → Domain

[`requestMapper.ts`](src/features/request/services/requestMapper.ts):

- **`mapRemoteResponseToGroups(items)`** → DTO array'i `subject` alanına göre kategorilere böler. Her kategori için `mapRemoteRequestToDomain` çağırır.
- **`mapRemoteRequestToDomain(item)`** → `RemoteRequestItemDto` → `RequestSummary`:
  - `descriptionList`'ten "Şirket: ABC" formatlı satırı `parseDescriptionValue` ile bulup şirket adını çıkarır ([`descriptionParser.ts`](src/features/request/services/descriptionParser.ts)).
  - Aynı yöntemle "Aktivite Başlangıç Tarihi", "Bitiş Tarihi" çıkarır.
  - Status code → label/color: [`statusMapper.ts`](src/features/request/services/statusMapper.ts):
    - 0/4 → ONAY BEKLIYOR (sarı), 1/3 → ONAYLANDI (yeşil), 2/5 → REDDEDILDI (kırmızı).
    - Eğer DTO'da `operations[].statusCode === item.status` eşleşirse, sunucudan gelen renkleri kullanır.
  - Operations → UI butonları: [`operationMapper.ts`](src/features/request/services/operationMapper.ts):
    - Boş gelirse default "Onay/Red" düşer.
    - Duplicate elenir, `displayOrder`'a göre sıralanır.
  - `multipleApprove`, `descriptionRequirement` flag'leri direkt taşınır.

#### Cache: `remoteRequestCache` ([remoteRequestCache.ts](src/features/request/services/remoteRequestCache.ts))

- Aktif talepler ve geçmiş talepler için ayrı in-memory cache (`remoteGroupsCache`, `remoteHistoryGroupsCache`).
- Detay endpoint'i 404/null dönerse, cache'den fallback yapılıyor (`getCachedRemoteRequestById`).

#### UI Render

`processedData` (filtered `CategoryGroup[]`) → her kategori `AccordionCategory` içinde, her satır `RequestListItem` olarak render edilir. Toplu seçim aktif ise checkbox'lar gösterilir.

### 9.2 Detay Akışı

#### URL: `/request/<id>?source=request|history`

```
RequestDetailScreen
  └─ useRequestDetail({ id, source, onNetworkError })
       └─ requestService.getRequestById(id, source)
            └─ remoteRequestService.getRequestById
                 1. GET /mos/api/v3/GetDescription/<id>
                 2. assertApiSuccess
                 3. response.data null ise → cache'den fallback
                 4. mapRemoteRequestDetailToDomain (requestMapper.ts:125-188)
                    ├─ descriptions[type === 1].sort(line_number).map(data) → descriptionLines
                    ├─ buildDetailSections(detail) → bölümlü görünüm (detailSectionMapper.ts)
                    │    ├─ type === 0 satırları → yeni section başlığı
                    │    ├─ type === 1 ve "Label: Value" formatı → kind: 'pair'
                    │    ├─ type === 1 ve plain → kind: 'text'
                    │    └─ operationDescription varsa → "İşlem Açıklaması" section'u eklenir
                    ├─ mapAttachmentsToDomain(detail.attachments) (attachmentMapper.ts)
                    │    └─ fileName/filename/name/attachmentName arasında ilk dolu olan
                    │    └─ url/fileUrl/downloadUrl/path arasında ilk dolu olan
                    └─ mapOperationsToDomain
       └─ setRequest(detail)
  
  └─ useRequestAction({ request, loadRequest, onActionError, onNetworkError })
       handleActionComplete(operation):
         ├─ operation.requiresDescription === 0 → executeOperation(op, null)
         └─ Else → setPendingOperation(op) + descriptionModalVisible = true
       
       executeOperation(op, description):
         └─ requestService.processAction([request.id], op, description)
              └─ remoteRequestService.processAction (parallel için Promise.all)
                   POST /mos/api/v3/Approve3
                   Body: { appVersion, deviceInfo, operationDescription, requestId, status }
                   • appVersion: APP_VERSION_BY_PLATFORM
                   • deviceInfo: buildDeviceInfo() (deviceInfo.ts) — "Brand Model, Android 14"
         └─ setActionDone(true) + loadRequest() yeniden çek
  
  └─ useAttachmentHandler({ messages, router })
       handleAttachmentPress(attachment):
         1. cacheAttachmentFile(attachment, FileSystem.cacheDirectory) (attachmentFileUtils.ts)
              ├─ Cache'de varsa skip, yoksa:
              ├─ requestService.getAttachmentContent(id)
              │    └─ GET /mos/api/v3/GetAttachmentContent?attachmentId=<base64encoded>
              │    └─ response.data.content (base64)
              └─ FileSystem.writeAsStringAsync(uri, content, { encoding: Base64 })
         2. Android: IntentLauncher ile ACTION_VIEW
         3. iOS: PDF/image ise → preview HTML oluştur, /request/attachment-preview'e push (WebView)
         4. iOS diğer: Sharing.shareAsync (sistem share sheet)
```

### 9.3 Toplu Onay Akışı

`useRequestList` ile birden fazla `id` seçildiğinde:

```
RequestListScreen
  └─ requestService.processMultipleAction(ids, operation, description)
       └─ remoteRequestService.processMultipleAction
            POST /mos/api/v3/multipleApprove
            Body: {
              approver: session.user.email,
              idList: ids,
              operationDescription: description ?? '',
              status: operation.statusCode
            }
```

### 9.4 Geçmiş Talepler

```
RequestHistoryScreen
  └─ useRequestHistory({ ... })
       fetchHistory(rangeText, searchValue):
         └─ requestService.getRequestHistory({ range: parseDateRangeText(rangeText), searchValue })
              └─ remoteRequestService.getRequestHistory
                   POST /mos/api/v3/GetRequestsByDateRange
                   Body: { startDate: ISO, endDate: ISO (23:59:59), searchValue }
                   • formatDateForHistoryApi(date, endOfDay) → "yyyy-MM-ddTHH:mm:ss"
              └─ mapRemoteHistoryRequestToDomain (her item için)
                   • description tek string olarak gelir → split('\n') ile satırlara böl
                   • diğer alanlar liste mapping'iyle benzer
              └─ subject ile gruplama
```

> **Default tarih aralığı:** Bugün dahil **son 3 gün**. [`useRequestHistory.ts:10-23`](src/features/request/hooks/useRequestHistory.ts#L10-L23).

### 9.5 Endpoint Özeti (Request Feature)

| Operasyon | Method | Path | Auth | Body |
|---|---|---|---|---|
| Aktif liste | GET | `/mos/api/v3/GetRequestsSingle` | ✅ | — |
| Geçmiş liste | POST | `/mos/api/v3/GetRequestsByDateRange` | ✅ | `{ startDate, endDate, searchValue }` |
| Detay | GET | `/mos/api/v3/GetDescription/{id}` | ✅ | — |
| Ek içeriği | GET | `/mos/api/v3/GetAttachmentContent?attachmentId={base64}` | ✅ | — |
| Tekli onay | POST | `/mos/api/v3/Approve3` | ✅ | `{ appVersion, deviceInfo, operationDescription, requestId, status }` |
| Toplu onay | POST | `/mos/api/v3/multipleApprove` | ✅ | `{ approver, idList, operationDescription, status }` |

---

## 10. Attorney (Vekâlet) Feature

Daha basit bir feature — tek service dosyası, mock yok.

### Akış

```
SettingsScreen → "Aktif Vekâletler"
  └─ /settings/active-attorneys → ActiveAttorneyScreen
       └─ attorneyService.getAttorneys()
            GET /mos/api/v3/attorneyV2
            Response: { data: { currentAttorneys: [], history: [] } }
            └─ mapAttorneyDto her ikisi için (subjects mapping dahil)
       └─ FlatList<Attorney>
       └─ Vekâlet kartı → revoke butonu
            └─ attorneyService.revokeAttorney(id)
                 GET /mos/api/v3/DeleteAttorney/<base64encoded_id>

CreateAttorneyScreen
  └─ AttorneyContext (form state — receiver email, dates, allSubjects, selectedSubjectIds)
  └─ "Konu seç" → /settings/select-subjects → SubjectSelectionScreen
       └─ attorneyService.getSubjects()
            GET /mos/api/v3/attorneySubjects
       └─ Multi-select → context.selectedSubjectIds güncellenir
  └─ Save:
       └─ attorneyService.createAttorney(payload)
            POST /mos/api/v3/CreateAttorneyV2
            Body: {
              receiverEmail (lower),
              startDate (DD-MM-YYYY),
              endDate,
              allSubjects (boolean),
              allowedSubjectIds: allSubjects ? null : selectedSubjectIds[]
            }
```

### `attorneyService` ([attorneyService.ts](src/features/attorney/services/attorneyService.ts))

- **MosApiWrapper<T>** envelope kullanır ama özel `assertApiSuccess` yok — manuel `code !== 200` kontrol.
- **`parseApiError`** — sunucudan gelen "under code 'XXX' for locale" formatlı mesajı çıkarır (locale key'ini gösterir).
- **DeleteAttorney path'i base64 encoded** ID kullanır (`btoa(id)` + `encodeURIComponent`).

### Form State: `AttorneyContext`

[`src/features/attorney/context/AttorneyContext.tsx`](src/features/attorney/context/AttorneyContext.tsx) — React Context, `app/settings/_layout.tsx` ile sarmalandığı için aynı flow içindeki tüm vekâlet sayfaları paylaşır. Burada **store kullanılmadı çünkü state ekran değiştiğinde resetlenmeli ve global olmamalı**.

---

## 11. Settings & Maintenance

### `SettingsScreen` ([src/features/settings/screens/SettingsScreen.tsx](src/features/settings/screens/SettingsScreen.tsx))

- Theme toggle (`useThemeStore`)
- Language toggle (`useLanguageStore`)
- Font size (`useFontSizeStore`)
- Vekâlet linkleri
- Logout butonu → `authStore.clear() + router.replace('/login')`

### Maintenance ([maintenanceService.ts](src/features/maintenance/services/maintenanceService.ts))

```ts
const MAINTENANCE_STATUS_PATH = '';  // ⚠️ ŞU AN BOŞ — feature no-op
```

`app/_layout.tsx` her açılışta `checkMaintenance()` çağırıyor; path boş olduğu için her zaman `{ isUnderMaintenance: false }` döner. Backend endpoint'i geldiğinde path doldurulacak.

---

## 12. Push Notifications

### Mimari

- **FCM** (Firebase Cloud Messaging) — token üretimi + sunucudan push tetikleme.
- **AWS SNS** — backend, FCM token'ı SNS endpoint'ine bağlıyor (`/mos/api/v3/RegisterSNS`).
- **Notifee** — uygulama açıkken (foreground) bildirimi göstermek için (Android default'da göstermez).

### Akış

```
Login başarılı
  └─ registerForPushNotifications(accessToken) (notificationService.ts:61-75)
       1. requestNotificationPermission()
            • Android 13+ : POST_NOTIFICATIONS izin iste
            • iOS: messaging().requestPermission()
       2. messaging().getToken() — FCM token al
       3. AsyncStorage'da '@mos/fcm_token' ile karşılaştır, değişmişse güncelle
       4. POST /mos/api/v3/RegisterSNS
          Headers: Authorization: Bearer <token>
          Body: { token: btoa(fcmToken), deviceType: '1' (iOS) | '0' (Android) }
       5. response.data.arn varsa AsyncStorage'a '@mos/sns_arn' yaz
```

> **`btoa(fcmToken)` kullanımı** bilinçli bir tasarım tercihi — backend SNS servisi token'ı base64 olarak bekliyor. Kriptografik bir koruma değil, sadece encoding.

### FCM Listener'ları ([app/_layout.tsx](app/_layout.tsx))

| Senaryo | Handler | Davranış |
|---|---|---|
| Background → mesaj geldi | `messaging().setBackgroundMessageHandler` (modül-seviye, satır 43) | `displayNotification` ile Notifee gösterir |
| Foreground → mesaj geldi | `messaging().onMessage` (NotificationHandler içinde) | Yine `displayNotification` (Android otomatik göstermediği için) |
| Background → bildirime tıklandı | `messaging().onNotificationOpenedApp` | `router.push('/')` |
| Uygulama kapalı → bildirime tıklandı | `messaging().getInitialNotification` | `router.push('/')` |
| FCM token yenilendi | `messaging().onTokenRefresh` | AsyncStorage'daki `@mos/fcm_token`'ı temizler (sonraki getToken yeniden register eder) |

### Mesaj Formatı

[`getRemoteNotificationContent`](app/_layout.tsx#L25-L40) — sunucu hem standart `notification.title/body` hem de eski `data.title/body/message/badge` formatlarını destekleyebilir; ikisi arasında akıllı fallback yapar.

### Notifee Channel

[`notificationDisplayService.ts`](src/features/auth/services/notificationDisplayService.ts):
- Channel ID: `tr.com.yabim.mobilonay`
- Importance: HIGH (heads-up notification)
- Tek `NOTIFICATION_ID = 'mos_notification'` — yeni mesaj eskiyi **replace** eder (multi-notification stack'i değil).

---

## 13. Theme, Font, i18n

### Theme ([src/shared/theme/](src/shared/theme/))

- **`colors.ts`** — `lightColors` ve `darkColors` objeleri (~120+ renk anahtarı: surface, background, primary, danger, status*, overlayLight, ...).
- **`useTheme()`** — `mode` ve `colors` döner.
- Theme `useThemeStore` ile yönetilir; başlangıçta cihaz preferansı, sonra AsyncStorage'dan.

### Font Size ([fontSizes.ts](src/shared/theme/fontSizes.ts))

- `useFontSizeStore` 'S' | 'M' | 'L' tutar.
- `ScaledText` komponenti (`src/shared/components/ui/ScaledText.tsx`) bu preference'a göre font scale'ler — accessibility için.

### i18n ([src/shared/i18n/](src/shared/i18n/))

- **i18next yok** — custom solution.
- `tr.ts` ve `en.ts` flat key-value objeleri (~160 satır her biri).
- `useTranslation()` hook'u key alır, mevcut `useLanguageStore` dilinde değer döner.
- **Eksik anahtar fallback'i:** TR'ye düşer (veya key string'i).
- **Sorun:** Bazı `Alert.alert()` çağrıları hardcoded TR string kullanıyor — i18n'e taşınmamış.

---

## 14. Storage Stratejisi

### SecureStore (`expo-secure-store`)

**Sadece auth session** için kullanılır. Anahtar: `@mos/auth_session`.

[`authSessionStorage.ts`](src/features/auth/services/authSessionStorage.ts):
- `readAuthSession` — SecureStore'dan oku, yoksa **legacy AsyncStorage migration** dene (eski yazılımdan kalanı SecureStore'a taşı), sonra null.
- `writeAuthSession` — SecureStore'a JSON yaz. **SecureStore yoksa hata fırlat** (plaintext'e fallback yapmıyoruz; K3 fix'i).
- `removeAuthSession` — SecureStore + AsyncStorage temizliği (cleanup için).
- `isSecureStoreAvailable` — iOS Keychain ve Android Keystore (API 23+) hep var; sadece web/çok eski Android'de `false`.

### AsyncStorage (`@react-native-async-storage/async-storage`)

Hassas **olmayan** her şey:

| Anahtar | İçerik | Yer |
|---|---|---|
| `@mos/theme_mode` | 'light' \| 'dark' | useThemeStore |
| `@mos/language` | 'tr' \| 'en' | useLanguageStore |
| `@mos/font_size` | 'S' \| 'M' \| 'L' | useFontSizeStore |
| `@mos/fcm_token` | FCM device token | notificationService |
| `@mos/sns_arn` | SNS endpoint ARN | notificationService |
| `@mos/auth_session` | (legacy — sadece migration için) | authSessionStorage |

### File System (Cache)

- `FileSystem.cacheDirectory` (expo-file-system/legacy) — ek dosyalar buraya yazılır.
- `attachmentFileUtils.cacheAttachmentFile` — base64 → dosya, mevcut dosya varsa skip.
- iOS preview HTML'leri de buraya yazılır (`<dosya>.html`).
- **Cache invalidation yok** — sistem cache temizleyene veya kullanıcı uygulama verisini silene kadar kalır.

---

## 15. Build & Deploy

### EAS Build ([eas.json](eas.json))

| Profil | Distribution | buildType | Env |
|---|---|---|---|
| `development` | internal | (default) | — |
| `preview` | internal | apk | — |
| `production` | (auto) | aab (default) | — |
| `production-apk` | internal | apk | `APP_ENV=production` |

### Komutlar

```bash
# Lokal geliştirme
npm install
npm run start          # Expo dev server
npm run android        # native build + dev client
npm run ios

# Validation
npm run typecheck
npm run lint
npm run test
npm run validate       # üçü birden

# EAS Build
eas build --platform android --profile production-apk
eas build --platform android --profile production
eas build --platform ios --profile production

# EAS Update (OTA, kullanılıyorsa)
eas update --branch production
```

### Custom Plugins ([plugins/](plugins/))

| Plugin | Yaptığı |
|---|---|
| `withOptimizedBuild.js` | Gradle minify, shrink resources, sadece `armeabi-v7a` + `arm64-v8a` build |
| `withNotificationIcon.js` | Drawable kopyalama + AndroidManifest meta-data injection (FCM ikonu) |
| `withNotifee.js` | Maven repo eklemesi (Notifee için gerekli) |

### Hassas Dosyalar

- **`google-services.json`** — Firebase config. `.gitignore`'da. Local'de bulunmalı; EAS Secret olarak yönetilmeli (`eas secret:create --type file --name GOOGLE_SERVICES_JSON --value ./google-services.json`).
- **`mobilonay.keystore`** — Android imza. Geçmişte `.b64.txt` formatında repo'ya commit'lenmiş (artık silinmiş). **Play App Signing kullanılıyorsa upload key'i rotate etmek mümkün.**

---

## 16. Son Yapılan Refactor'lar

Bu refactor'lar son sprint'te yapıldı, hand-off için bilmesi gereken değişiklikler:

### a) Codemagic Kaldırıldı (Y1)
- [codemagic.yaml](codemagic.yaml) silindi → tek CI/CD pipeline EAS.
- Codemagic UI tarafında: webhook, app/workflow, secret group manuel olarak silinmesi gerekiyor.

### b) `app.json` Birleştirildi (Y1)
- Eskiden hem `app.json` hem `app.config.js` vardı, plugin/extra alanları çakışıyordu.
- Şimdi **tek dosya: [app.config.js](app.config.js)**. `app.json` silindi.
- Doğrulama: `npx expo config --json` ile resolved config görülebilir.

### c) SecureStore Fallback Kaldırıldı (K3)
- Eski: SecureStore yoksa AsyncStorage'a düz yazıyordu (plaintext token).
- Yeni: SecureStore yoksa **persist atılır, hata fırlatılır**. Web'de logout her uygulama restart'ında olur (zaten kabul edilebilir).
- Caller'lar (`useAuthStore`) hâlâ `.catch(() => {})` ile yutuyor — uygulama çökmüyor.

### d) Token Refresh Race Condition Çözüldü (K4)
- Eski: 401 alınca direkt refresh tetikliyordu — paralel istekler aynı anda 401 alınca, .finally sonrası gelen geç bir 401 ikinci refresh başlatabiliyordu.
- Yeni: 401 alınca önce store'daki token değişmiş mi diye bakılıyor; değişmişse retry, aynıysa singleton lock'lu refresh.
- Detay: `withAuth(options, token)` — token artık parametre, gizli store erişimi yok.

### e) Keystore History Cleanup (K1) — KARAR BEKLİYOR
- `mobilonay.keystore.b64.txt` ve `google-services.json` git history'de duruyor.
- **Repo private'a alındı.** Yeterli mi karar Play App Signing kullanımına bağlı:
  - Kullanılıyorsa → upload key rotate et, history rewrite ikincil bonus.
  - Kullanılmıyorsa → keystore "leaked" sayılır, rewrite + Google Support purge gerekir.

---

## 17. Bilinen Sorunlar / Eksikler

### Kritik / Yüksek
- **K1** — Keystore history'de leaked. Karar bekleniyor (yukarıda).
- **K5** — API response runtime validation yok (`as T` cast). Zod migration bekleniyor.
- **K7** — `MAINTENANCE_STATUS_PATH = ''` (bilinçli; backend endpoint geldiğinde doldurulacak).  ⏳⏳⏳

### Orta
- **Y3** — Component/screen/hook test altyapısı yok (Jest + RTL kurulumu gerekli).
- **Y5** — Accessibility (a11y) label/role/hint neredeyse yok.
- **Y6** — Bazı Alert mesajları hardcoded TR string (i18n'e taşınmalı). (Düzeltildi.) ✅
- **Y8** — `remoteRequestCache` global mutable, TTL/invalidation eventi yok.
- **Y9** — Form validation merkezi değil (email regex, parola güç kuralı yok). 
- **Y10** — `remoteAuthService` içinde 2 ayrı `FetchApiClient` instance (Keycloak + MOS).

### Düşük
- **O1** — Ölü route'lar: `app/register.tsx`, `app/set-password.tsx`, `app/maintenance-preview.tsx`, `app/request-detail.tsx`. Kullanım takibi yapılmalı.
- **O2** — Büyük komponentler: LoginScreen 378sat, DateRangePickerModal 368sat, ActionDrawer 318sat, AccordionCategory 263sat — parçalanmalı.
- **O3** — TS path alias `@/*: ["./*"]` çok geniş; `["./src/*"]` olmalı.
- ⏳**O5** — `useAuthStore`'da `.catch(() => {})` yutmaları — telemetry/log'a gönderilmeli.
- ✅**O6** — RequestListScreen'de ScrollView içinde dinamik liste — FlatList/SectionList'e geçilmeli.  (Düzeltildi test gerektiriyor.) ✅
- ✅**typo** — RequestDetailScreen'de "Ek acilirken hata olustu" Türkçe karakter düşmüş.(Düzeltildi.) ✅
- ✅**deregisterFromPushNotifications** logout sırasında çağrılmıyor — sunucudaki SNS endpoint'i dangling kalıyor. (Düzeltildi test gerektiriyor.) ✅

### Nice-to-have
- Crash/error reporting yok (Sentry benzeri).
- Logger soyutlaması yok (`console.warn` direkt).
- Bundle size analyze yapılmamış.
- React Compiler aktif (`experiments.reactCompiler: true`) — bug riski izlenmeli.

---

## 18. Sıkça Sorulabilecek Sorular

### Genel

**S: Bu mock servis nedir, neden var?**
- C: Backend hazır olmadan UI geliştirilebilsin diye. Şu an `appConfig.api.mode === 'remote'` olduğu için tetiklenmiyor; ancak `mockAuthService` ve `mockRequestService` hâlâ kodda. Çevrimdışı demo veya test için kullanılabilir.

**S: Uygulama ilk açıldığında ne olur?**
- C: `app/_layout.tsx` yüklenir → SplashScreen oynatılır → `checkMaintenance()` çağrılır → SecureStore'dan auth session okunur → splash bittiğinde `app/index.tsx` redirect kararını verir (`/(tabs)` veya `/login`).

### State / Data

**S: Hangi state nerede tutuluyor?**
- C: Uzun-ömürlü ve global state → `src/store` (custom external store).
- C: Form state ve ekran-içi geçici → `useState` (ekran/hook seviyesi).
- C: Vekâlet oluşturma akışında çoklu sayfa state → `AttorneyContext` (React Context).

**S: Token nereye kaydediliyor?**
- C: SecureStore (iOS Keychain, Android Keystore) — `@mos/auth_session` anahtarı altında. SecureStore yoksa persist edilmiyor (web'de session sadece bellekte).

**S: Token nasıl yenileniyor?**
- C: `AuthenticatedApiClient` 401 alınca `refreshSession()` çağırır. Keycloak refresh token endpoint'ine `grant_type=refresh_token` ile POST atar. Yeni `AuthSession` `authStore.updateSession`'a yazılır.
- C: Paralel 401'ler için modül-seviye `refreshPromise` lock'u dedup yapar.

**S: Logout ne yapıyor?**
- C: `authStore.clear()` → SecureStore session sil + AsyncStorage'dan FCM token + SNS ARN sil + state null'a çek + dinleyiciler tetiklenir → `(tabs)/_layout.tsx`'in auth guard'ı `/login`'e redirect.

### API

**S: Bir endpoint çağırırken hangi client'ı kullanmalıyım?**
- C: Auth gerektiriyorsa `AuthenticatedApiClient` (token ekler, 401'de refresh). Kullanmıyorsa `FetchApiClient`. Auth servisleri (Keycloak token endpoint'i) zaten `FetchApiClient` kullanır çünkü auth almak için zaten token yok.

**S: Yeni bir endpoint eklemek için ne yapmalıyım?**
1. `src/features/<feature>/api/contracts.ts`'e DTO tipini ekle.
2. `src/features/<feature>/types.ts`'e domain tipi ekle.
3. Mapper yaz: DTO → domain (gerekiyorsa).
4. Service metodunu `services/<remote>Service.ts`'e ekle (`apiClient.request<DTO>(...)` + mapping).
5. Public facade'a ekle (`services/<feature>Service.ts`).
6. Hook ile kullan.

**S: API hata mesajları nasıl yönetiliyor?**
- C: 3 katman:
  1. `FetchApiClient` HTTP-level hatayı `ApiError` olarak fırlatır (Keycloak/Spring Boot formatlarını parse eder).
  2. Servis katmanı, envelope'taki `code !== 200` ise `assertApiSuccess` veya manuel kontrol ile hata fırlatır.
  3. Hook/screen `try-catch` ile yakalar, `isNetworkError` ise "bağlantı sorunu" Alert'i; değilse `error.message` Alert'i.

### UI

**S: Yeni bir ekran nasıl eklerim?**
1. `src/features/<feature>/screens/MyScreen.tsx` yaz.
2. `app/<path>/my-screen.tsx`'i tek bir wrapper olarak oluştur:
   ```tsx
   import MyScreen from '@/src/features/<feature>/screens/MyScreen';
   export default function Route() { return <MyScreen />; }
   ```
3. Auth gerekiyorsa `(tabs)/` veya başka authenticated grup içinde olsun.

**S: Custom tab bar nasıl çalışıyor?**
- C: `app/(tabs)/_layout.tsx`'te `tabBar={() => <MainBottomNavbar />}` ile default tab bar override edildi. `MainBottomNavbar` kendi navigation'ını yönetir (büyük ihtimalle `useRouter` kullanarak).

**S: Tema değişikliği anında yansıyor mu?**
- C: Evet — `useThemeStore` `useSyncExternalStore` ile dinleniyor, store değişince tüm subscriber'lar re-render olur. AsyncStorage'a async yazılıyor (UI bloklamıyor).

**S: Font ölçeklendirme nereden geliyor?**
- C: `useFontSizeStore` kullanıcı tercihini tutar. `ScaledText` komponenti bu preference'a göre `style.fontSize`'ı çarpan ile büyütür/küçültür. RN'in default `fontScale`'inden bağımsız (kendi mantığımız).

### Push Notifications

**S: FCM token ne zaman alınıyor ve sunucuya gönderiliyor?**
- C: Login başarılı olduktan hemen sonra `registerForPushNotifications(accessToken)` çağrılır. Bu, FCM'den token ister, `RegisterSNS` endpoint'ine yollar.

**S: Token yenilenirse ne olur?**
- C: `messaging().onTokenRefresh` listener'ı AsyncStorage'daki cache'i temizler. Bir sonraki login veya `getToken()` çağrısında yeni token alınır ve sunucuya re-register olur.

**S: Bildirim geldiğinde ne oluyor?**
- C: Background → `setBackgroundMessageHandler` Notifee ile gösterir.
- C: Foreground → `onMessage` Notifee ile gösterir (Android otomatik göstermez).
- C: Tıklanırsa → `onNotificationOpenedApp` veya `getInitialNotification` → `router.push('/')`.

### Build / Deploy

**S: APK vs AAB için hangi profil?**
- C: APK (test/internal) → `production-apk`. AAB (Play Store) → `production`.

**S: `app.config.js` ile `app.json` arasındaki fark?**
- C: Artık sadece `app.config.js` var. `app.json` silindi (Y1 fix). `app.config.js` `process.env.APP_ENV`'e göre dinamik URL üretebilir.

**S: Build sırasında hangi env kullanılır?**
- C: `eas.json`'daki profile'ın `env` bloğu — `production-apk` için `APP_ENV=production`. Bu, `app.config.js`'in `extra.api.baseUrl`'i `mos2.yasar.com.tr`'ye çevirmesini sağlar.

**S: Versiyonu nasıl güncelliyoruz?**
- C: 3 yer:
  1. `package.json#version`
  2. `app.config.js#version`
  3. `src/config/appConfig.ts#APP_VERSION_BY_PLATFORM` (versionService kontrolü için)
- C: EAS `production` profili `autoIncrement: true` — build number otomatik artar.

**S: Versiyon zorunluluğu nasıl çalışıyor?**
- C: Login'den önce `runVersionCheck()` çağrılır → `POST /mos/api/v3/check?platform=&version=` → sunucu reddederse Login fail. `APP_VERSION_BY_PLATFORM` sabitleri yeni release ile birlikte güncellenmeli.

### Sorun Giderme

**S: Login sonrası beyaz ekran, redirect çalışmıyor.**
- C: `app/_layout.tsx`'te `splashDone` state'ine bak. `SplashAnimationScreen.onFinish()` çağrılıyor mu? Lottie animasyonu hata veriyor olabilir.

**S: 401 sonra refresh oluyor ama yine 401 dönüyor.**
- C: Ya refresh token süresi dolmuş, ya client_id/realm yanlış. Production realm: `mobil-onay`, test: `Mobil.Onay` (büyük M dikkat). `client_id: 'mobile-api'` her ikisinde de aynı.

**S: Ek dosyaları açılmıyor (Android).**
- C: `IntentLauncher` cihazda dosya tipini handle edebilen bir uygulama gerektirir. PDF için Adobe Reader veya benzeri yüklü olmalı. Aksi halde Sharing fallback'i de yok (iOS'ta var).

**S: Push bildirim test cihazında gelmiyor.**
- C: Sırasıyla kontrol et:
  1. `RegisterSNS` 200 döndü mü? Logla.
  2. `FCM_TOKEN_KEY`'de token var mı? AsyncStorage'a bak.
  3. Notifee channel oluşturuldu mu? `ensureNotificationChannel()` ilk açılışta çağrılır.
  4. Android 13+ için POST_NOTIFICATIONS izni verildi mi?
  5. `google-services.json` doğru projenin mi? `mobilonay-4d80b` olmalı.

---

## Kapanış

Bu doküman projenin **bugünkü** halini temsil eder (2026-05-05).

- Tüm kritik dosyalar yorumlanmıştır; ek soru durumunda doğrudan kaynağa bakmak en doğrusu — domain (request → onay) tek karmaşık akıştır ve `requestMapper.ts` + `remoteRequestService.ts` çekirdektir.
- "Mock vs remote" toggle'ı şu an pratik olarak **remote sabit** ama mimari korunmuştur; backend kesintisinde mock'a düşürmek tek satır.
- Ekip büyürse: state için Zustand'a, validation için Zod'a, data fetching için TanStack Query'ye geçiş kolay (mevcut katmanlama destekliyor).

Şüphe duyulan davranış varsa: önce **`tests/*.test.mjs`** içindeki mapper testlerine bak (status code, attachment, description parsing iyi kapsanmış). Sonra ilgili `src/features/<x>/services/*Mapper.ts`. Servis seviyesinde test henüz yok.

İyi çalışmalar.
