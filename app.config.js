const isProduction = process.env.APP_ENV === 'production';

module.exports = () => ({
  name: 'Dijital.Onay',
  slug: 'burak-n4t4bpsvklvzbykdov0ul',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  scheme: 'mosyasar',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  owner: 'burakkoctas',
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'tr.com.yabim.mobilonay.rn',  //Nc
    googleServicesFile: process.env.GOOGLE_SERVICES_INFO_PLIST || './GoogleService-Info.plist', 
    infoPlist: {
    // 🚨 CarPlay'in ekran ve ikon bağlantılarını iOS manifestine işleyen zorunlu blok:
    UIApplicationSceneManifest: {
      UIApplicationSupportsMultipleScenes: true,
      UISceneConfigurations: {
        CPTemplateApplicationSceneSessionRoleApplication: [
          {
            UISceneDelegateClassName: "Dynamic", // Expo Router entegrasyonu için dinamik tetikleyici
          },
        ],
      },
    },
},
  },
  android: {
    package: 'tr.com.yabim.mobilonay.rn',
    googleServicesFile: process.env.GOOGLE_SERVICES_JSON || './google-services.json',
    adaptiveIcon: {
      backgroundColor: '#1976D2',
      foregroundImage: './assets/adaptive-icon.png',
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false,
    permissions: ['android.permission.POST_NOTIFICATIONS'],
  },
  web: {
    output: 'static',
    favicon: './assets/icon.png',
  },
  plugins: [
    './plugins/withOptimizedBuild',
    'expo-router',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#fff',
        image: './assets/icon.png',
        imageWidth: 200,
        dark: {
          backgroundColor: '#fff',
          image: './assets/icon.png',
        },
      },
    ],
    '@react-native-community/datetimepicker',
    '@react-native-firebase/app',
    '@react-native-firebase/messaging',
    './plugins/withNotificationIcon',
    './plugins/withNotifee',
    'expo-secure-store',
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
  extra: {
    router: {},
    api: {
      mode: 'remote',
      baseUrl: isProduction ? 'https://mos2.yasar.com.tr' : 'https://mos-tst.yasar.com.tr',
      timeoutMs: 10000,
    },
    auth: {
      mode: 'remote',
      baseUrl: isProduction ? 'https://oauth.yasar.com.tr' : 'https://oauthtest.yasar.com.tr',
      realm: isProduction ? 'mobil-onay' : 'Mobil.Onay',
      timeoutMs: 10000,
    },
    eas: {
      projectId: 'e4b2e8ee-1c96-4c07-93bf-8a9a25b1fc62',
    },
  },
});
