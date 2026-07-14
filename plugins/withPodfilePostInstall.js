const { withDangerousMod } = require('@expo/config-plugins');
const fs = require('fs');
const path = require('path');

module.exports = function withPodfilePostInstall(config) {
  return withDangerousMod(config, [
    'ios',
    (config) => {
      const podfilePath = path.join(config.modRequest.platformProjectRoot, 'Podfile');
      let contents = fs.readFileSync(podfilePath, 'utf-8');

      // 1) Firebase'i use_frameworks içinde static library gibi derlet
      if (!contents.includes('$RNFirebaseAsStaticFramework')) {
        contents = contents.replace(
          /(require File\.join.*\n)/,
          `$1\n$RNFirebaseAsStaticFramework = true\n`
        );
      }

      // 2) Non-modular header hatalarını sustur (bir önceki adımda eklediğimiz)
       const flag = `
    installer.pods_project.targets.each do |target|
      target.build_configurations.each do |bc|
        bc.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'
      end
      # Xcode 26.4+ / Apple Clang 21 fmt consteval sorunu için geçici düzeltme
      # (facebook/react-native#55601, expo/expo#44229)
      if target.name == 'fmt'
        target.build_configurations.each do |bc|
          bc.build_settings['CLANG_CXX_LANGUAGE_STANDARD'] = 'c++17'
        end
      end
    end
`;
      if (!contents.includes('CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES')) {
        contents = contents.replace(
          /post_install do \|installer\|/,
          `post_install do |installer|\n${flag}`
        );
      }

      fs.writeFileSync(podfilePath, contents);
      return config;
    },
  ]);
};  
