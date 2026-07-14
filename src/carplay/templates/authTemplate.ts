import { ListTemplate } from 'react-native-carplay';

/**
 * Oturum açılmamışsa CarPlay ekranında gösterilecek kilit ekranı.
 * @param onMockLogin Test kolaylığı için CarPlay üzerinden giriş tetikleme callback'i
 */
export const createAuthTemplate = (onMockLogin?: () => void) => {
  return new ListTemplate({
    title: 'Dijital Onay',
    sections: [
      {
        header: 'Güvenli Oturum Gerekli',
        items: [
          {
            text: 'Lütfen Telefondan Giriş Yapın',
            detailText: 'İşlemleri görüntülemek için mobil uygulamaya giriş yapmalısınız.',
          },
          {
            text: 'Geliştirici Girişi (Mock)',
            detailText: 'Test etmek için doğrudan oturumu simüle et.',
            showsDisclosureIndicator: true,
          }
        ],
      },
    ],
  });
};