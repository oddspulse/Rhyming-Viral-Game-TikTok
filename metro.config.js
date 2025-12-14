const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve expo-modules-core to our shim on web
config.resolver = {
  ...config.resolver,
  resolveRequest: (context, moduleName, platform) => {
    if (platform === 'web' && moduleName === 'expo-modules-core') {
      return {
        filePath: path.resolve(__dirname, 'expo-modules-core-shim.web.js'),
        type: 'sourceFile',
      };
    }
    // Default resolver
    return context.resolveRequest(context, moduleName, platform);
  },
};

module.exports = withNativeWind(config, { input: './global.css' });
