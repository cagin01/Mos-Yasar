const { withProjectBuildGradle } = require('@expo/config-plugins');

module.exports = function withNotifee(config) {
  return withProjectBuildGradle(config, (cfg) => {
    const contents = cfg.modResults.contents;
    const mavenEntry = `maven { url "\${rootDir}/../node_modules/@notifee/react-native/android/libs" }`;

    if (contents.includes(mavenEntry)) return cfg;

    cfg.modResults.contents = contents.replace(
      /allprojects\s*\{[\s\S]*?repositories\s*\{/,
      (match) => `${match}\n    ${mavenEntry}`
    );
    return cfg;
  });
};
