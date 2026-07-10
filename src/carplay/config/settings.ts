import { darkColors, lightColors } from '../../shared/theme/colors';

//CarPlay Modülü Global Yapılandırma Ayarlar

export const CARPLAY_CONFIG = {
  // Oturum Ömrü ve Bağlantı Ayarları
  SESSION: {
    RECCONNECTION_PERIOD_MS: 60000,          // Kablolu bağlantılar için 1 dakikalık kopma töleransı böylelikle her seferinde auth istemeyecek.
    AUTO_REFRESH_INTERVAL_MS: 30000,         // Onay listesinin otomatik yenilenme periyodu
  },

  LIMITS: {
    MAX_LIST_ITEMS: 8,              // Tek ekrandaki max satır sayısı
    MAX_TEXT_LENGTH: 150,           // Detay ekranındaki max özet karakter sınırı
  },

  // CarPlay renkleri app renkleriyle birebir uyumlu şekilde uyarlanmıştır.
  THEME: {
    light: {
      primary: lightColors.primary,
      success: lightColors.statusApprovedText, 
      danger: lightColors.statusRejectedText,  
      background: lightColors.background,
      text: lightColors.textDark,
    },
    dark: {
      primary: darkColors.primary,
      success: darkColors.statusApprovedText,
      danger: darkColors.statusRejectedText,
      background: darkColors.background,
      text: darkColors.textDark,
    }
  },
  FEATURES: {
    SHOULD_SHOW_VISUAL_DETAILS: (isMoving: boolean): boolean => {
      // Araç hareket halindeyse (isMoving === true) ekranda detay metnini GÖSTERME (false)
      // Araç duruyorsa (isMoving === false) ekrandan detaylı okunabilir olsun (true)
      return !isMoving;
    },
    HANDLE_DETAIL_CLICK_ACTION: (isMoving: boolean) => {
      if (isMoving) {
        // 🚗 Hareket Halindeyken: Ekranda hiçbir şey açma, direkt "Sesli Okuma (TTS)" motorunu tetikle
        return 'PLAY_AUDIO_VOICE';
      } else {
        // 🛑 Araç Dururken: Klasik mobil app'teki gibi detay sayfasını ekranda aç/göster
        return 'OPEN_VISUAL_DETAIL_SCREEN';
      }
    },
    ENABLE_NOTIFICATIONS_TAB: true, 
    ENABLE_TEXT_TO_SPEECH: true,    
  }
};

export type CarPlayConfigType = typeof CARPLAY_CONFIG;