import { ListTemplate } from 'react-native-carplay';

export const createNotificationsTemplate = () => {
  return new ListTemplate({
    title: 'Bildirimler',
    tabSystemItem: 10, // CarPlay sekme ikonu
    sections: [
      {
        header: 'Son Bildirimler',
        items: [
          {
            text: 'Yeni İstek Eklendi',
            detailText: 'Yaşar Bilgi sisteminden yeni bir fatura onayı düştü.',
          },
          {
            text: 'Profil Güncellendi',
            detailText: 'Vekalet ayarlarınız başarıyla kaydedildi.',
          },
        ],
      },
    ],
  });
};