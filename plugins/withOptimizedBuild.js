const { withGradleProperties } = require('@expo/config-plugins');

module.exports = function withOptimizedBuild(config) {
  return withGradleProperties(config, (config) => {
    const props = config.modResults;

    const set = (key, value) => {
      const index = props.findIndex((p) => p.key === key);
      if (index >= 0) {
        props[index].value = value;
      } else {
        props.push({ type: 'property', key, value });
      }
    };

    set('reactNativeArchitectures', 'armeabi-v7a,arm64-v8a');
    set('android.enableMinifyInReleaseBuilds', 'true');
    set('android.enableShrinkResourcesInReleaseBuilds', 'true');
    set('expo.gif.enabled', 'false');

    return config;
  });
};
