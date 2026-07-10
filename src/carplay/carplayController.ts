import { Platform } from 'react-native';
import { authStore } from '../store/useAuthStore';
import { CARPLAY_CONFIG } from './config/settings';
import { createActiveRequestsTemplate } from './templates/activeRequestsTemplate';
import { createAuthTemplate } from './templates/authTemplate';
import { createNotificationsTemplate } from './templates/notificationsTemplate';


let CarPlay: any = null;
try {
  if (Platform.OS === 'ios') {
    CarPlay = require('react-native-carplay').CarPlay;
  }
} catch (e) {
  //Buraya bak catch i de logger a bağlamak gerekebilir.
}

class CarPlayController {
  private isConnected: boolean = false;
  private reconnectionTimeout: NodeJS.Timeout | null = null;
  private rootTabBarTemplate: any = null;

  public init() {
    if (!CarPlay) return;

    // CarPlay bağlantı olaylarını dinlemeye başlıyoruz
    CarPlay.emitter.addListener('didConnect', () => this.handleConnect());
    CarPlay.emitter.addListener('didDisconnect', () => this.handleDisconnect());
    
    // Uygulama içi oturum değişikliklerini dinlemek için authStore'a abone oluyoruz
    authStore.getState(); 
  }

  private handleConnect() {
    this.isConnected = true;
    if (this.reconnectionTimeout) {
      clearTimeout(this.reconnectionTimeout);
      this.reconnectionTimeout = null;
    }
    this.renderMainFlow();
  }

  private handleDisconnect() {
    this.isConnected = false;
    // settings.ts'de ismini revize ettiğimiz RECONNECTION_PERIOD devreye giriyor
    this.reconnectionTimeout = setTimeout(() => {
      if (!this.isConnected) {
        this.rootTabBarTemplate = null;
      }
    }, CARPLAY_CONFIG.SESSION.RECONNECTION_PERIOD_MS);
  }

  public renderMainFlow() {
    if (!CarPlay || !this.isConnected) return;

    const session = authStore.getState().session;
    const isAuthenticated = Boolean(session?.accessToken);

    // 🔒 1. Senaryo: Oturum Kapalıysa Kilit Ekranı Göster
    if (!isAuthenticated) {
      const authTemplate = createAuthTemplate(() => this.renderMainFlow());
      CarPlay.setRootTemplate(authTemplate, true);
      return;
    }

    // 🍏 2. Senaryo: Oturum Açıksa TabBar Mimarisiyle Ana Ekranları Yükle
    if (!this.rootTabBarTemplate) {
      const activeRequestsTab = createActiveRequestsTemplate();
      const notificationsTab = createNotificationsTemplate();

      const { CarPlayInterface } = require('react-native-carplay');
      
      // Apple CarPlay ana 2 sekmesini kuruyoruz
      this.rootTabBarTemplate = new CarPlayInterface.CPTabBarTemplate({
        templates: [activeRequestsTab, notificationsTab],
      });
    }

    CarPlay.setRootTemplate(this.rootTabBarTemplate, true);
  }
}

export const carplayController = new CarPlayController();