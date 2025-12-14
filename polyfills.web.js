// Polyfill for Expo SDK 51 web compatibility
if (typeof window !== 'undefined') {
  // Add missing registerWebModule function for expo-font
  if (!globalThis._expoModulesCore) {
    globalThis._expoModulesCore = {};
  }
  
  if (!globalThis._expoModulesCore.registerWebModule) {
    globalThis._expoModulesCore.registerWebModule = function() {
      // No-op for web - fonts are loaded via CSS
      return null;
    };
  }
}
