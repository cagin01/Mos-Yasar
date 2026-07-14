import { CarPlay, ListTemplate } from 'react-native-carplay';

export const createActiveRequestsTemplate = () => {
  // 1. Liste elemanlarını yukarıda bir diziye alıyoruz ki index ile erişebilelim
  const requestItems = [
    {
      text: 'Mali Onay #1294',
      detailText: 'Yaşar Bilgi Teknolojileri - 15,000 TL',
      showsDisclosureIndicator: true,
    },
    {
      text: 'Sözleşme Onayı #9941',
      detailText: 'İzÜret Hizmet Alım Sözleşmesi',
      showsDisclosureIndicator: true,
    },
    {
      text: 'Personel İzin Onayı',
      detailText: 'Yazılım Departmanı İzin Talebi',
      showsDisclosureIndicator: true,
    },
  ];

  const activeList = new ListTemplate({
    title: 'Onay Bekleyenler',
    tabSystemItem: 1, // Favorites simgesi
    sections: [
      {
        header: 'Mali & İdari Onaylar',
        items: requestItems, // Tanımladığımız diziyi buraya veriyoruz
      },
    ],
    // 🚀 Hatanın çözüldüğü yer: Gelen parametreyi (selectEvent) alıp index ile eşliyoruz
    async onItemSelect(selectEvent) {
      // Tıklanan index'teki gerçek elemanı dizimizden güvenle çekiyoruz
      const selectedItem = requestItems[selectEvent.index];

      if (!selectedItem) return;

      const detailTemplate = new ListTemplate({
        title: selectedItem.text || 'İşlem Detayı',
        sections: [
          {
            header: 'İşlem Bilgileri',
            items: [
              { text: 'Durum', detailText: 'Onay Bekliyor' },
              { text: 'Açıklama', detailText: selectedItem.detailText || '-' },
              { text: 'Tarih', detailText: new Date().toLocaleDateString('tr-TR') },
            ],
          },
        ],
      });
      
      CarPlay.pushTemplate(detailTemplate, true);
    },
  });

  return activeList;
};