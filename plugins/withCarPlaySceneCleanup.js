const {
  withAppDelegate,
  withEntitlementsPlist,
  withInfoPlist,
} = require('@expo/config-plugins');

/**
 * Removes the previous incomplete CarPlay scene registration.
 *
 * CarPlay scenes require a real CPTemplateApplicationSceneDelegate. The old
 * registration pointed to a non-existent `static` class, which made the native
 * iOS build launch to a black screen. Keep this plugin until the native
 * CarPlay scene delegate is implemented.
 */
module.exports = function withCarPlaySceneCleanup(config) {
  config = withInfoPlist(config, (config) => {
    const manifest = config.modResults.UIApplicationSceneManifest;
    const scenes = manifest?.UISceneConfigurations;

    if (scenes?.CPTemplateApplicationSceneSessionRoleApplication) {
      delete scenes.CPTemplateApplicationSceneSessionRoleApplication;
    }

    if (scenes && Object.keys(scenes).length === 0) {
      delete manifest.UISceneConfigurations;
    }

    // The previous configuration enabled multiple scenes solely for the invalid
    // CarPlay scene. Do not leave the phone app in scene lifecycle mode.
    if (manifest && !manifest.UISceneConfigurations) {
      delete config.modResults.UIApplicationSceneManifest;
    }

    return config;
  });

  config = withEntitlementsPlist(config, (config) => {
    delete config.modResults['com.apple.developer.carplay-messaging'];
    return config;
  });

  return withAppDelegate(config, (config) => {
    if (config.modResults.language !== 'swift') {
      return config;
    }

    let contents = config.modResults.contents.replace(
      /\n*\/\/ @generated begin mos-yasar-carplay-scene[\s\S]*?\/\/ @generated end mos-yasar-carplay-scene\n*/,
      '\n'
    );

    if (!contents.includes('MOSCarPlaySceneDelegate')) {
      contents = contents
        .replace('import CarPlay\n', '')
        .replace('import react_native_carplay\n', '');
    }

    config.modResults.contents = contents;
    return config;
  });
};
