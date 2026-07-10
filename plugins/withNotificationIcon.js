const { withDangerousMod, withAndroidManifest } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

function withNotificationDrawable(config) {
  return withDangerousMod(config, [
    'android',
    (cfg) => {
      const src = path.resolve(__dirname, '../assets/drawable/ic_notification.xml');
      const destDir = path.join(cfg.modRequest.platformProjectRoot, 'app/src/main/res/drawable');
      const dest = path.join(destDir, 'ic_notification.xml');
      fs.mkdirSync(destDir, { recursive: true });
      fs.copyFileSync(src, dest);
      return cfg;
    },
  ]);
}

function withNotificationManifest(config) {
  return withAndroidManifest(config, (cfg) => {
    const application = cfg.modResults.manifest.application?.[0];
    if (!application) return cfg;

    if (!application['meta-data']) application['meta-data'] = [];

    const metaData = application['meta-data'];
    const iconKey = 'com.google.firebase.messaging.default_notification_icon';

    if (!metaData.find((m) => m.$['android:name'] === iconKey)) {
      metaData.push({ $: { 'android:name': iconKey, 'android:resource': '@drawable/ic_notification' } });
    }

    return cfg;
  });
}

module.exports = function withNotificationIcon(config) {
  config = withNotificationDrawable(config);
  config = withNotificationManifest(config);
  return config;
};
