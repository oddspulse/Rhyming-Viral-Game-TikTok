// Polyfill for Expo SDK 51 web compatibility
if (typeof window !== 'undefined') {
  // Mock registerWebModule function for expo-font
  const registerWebModule = function(module, name) {
    // No-op for web - fonts are loaded via CSS
    return null;
  };

  // Patch expo-modules-core exports
  if (typeof window.ExpoModulesCore === 'undefined') {
    window.ExpoModulesCore = {};
  }

  if (!window.ExpoModulesCore.registerWebModule) {
    window.ExpoModulesCore.registerWebModule = registerWebModule;
  }

  // Also add to global scope for direct imports
  if (typeof window.registerWebModule === 'undefined') {
    window.registerWebModule = registerWebModule;
  }

  // Patch require to intercept expo-modules-core imports
  const originalRequire = typeof require !== 'undefined' ? require : null;
  if (originalRequire) {
    window.require = function(moduleName) {
      if (moduleName === 'expo-modules-core') {
        return {
          registerWebModule,
          NativeModulesProxy: {},
        };
      }
      return originalRequire.apply(this, arguments);
    };
  }
}
